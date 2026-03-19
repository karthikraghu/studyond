import { StateGraph, START, END, MemorySaver } from "@langchain/langgraph";
import { ChatAnthropic } from "@langchain/anthropic";
import { SystemMessage, HumanMessage, ToolMessage } from "@langchain/core/messages";
import { z } from "zod";
import { ThesisState, ThesisStateSchema } from "./state.js";
import { searchAcademicLiteratureTool } from "../tools/index.js";

function getModel() {
  return new ChatAnthropic({
    modelName: process.env.ANTHROPIC_MODEL || "claude-3-5-sonnet-latest",
    temperature: 0,
    anthropicApiKey: process.env.ANTHROPIC_API_KEY || process.env.VITE_ANTHROPIC_API_KEY,
  });
}

// ==========================================
// 🧑‍🏫 Agent 1: The Experienced Professor
// ==========================================
async function professorNode(state: ThesisStateSchema) {
  const llm = getModel();
  
  const prompt = `You are an experienced Information Systems Professor guiding a Master's student. Your job is to take their raw thesis pitch and structure it into a rigorous academic roadmap.

Instructions:
Do not critique the idea yet; assume it has potential and help them find the best angle.
If the user proposes a purely engineering project, attach a research methodology to it (e.g., Design Science Research, empirical evaluation, user-centric A/B testing). A Master's thesis must generate knowledge.

User's Raw Pitch:
"${state.initialPitch}"`;

  const structuredLlm = llm.withStructuredOutput(z.object({
    refinedTopic: z.string().describe("A formal, academic title for the thesis."),
    researchQuestions: z.array(z.string()).describe("2 to 3 sharply defined research questions."),
    methodology: z.string().describe("The proposed academic approach."),
    timeline: z.string().describe("A realistic 4-to-6 month phase breakdown.")
  }));

  const roadmap = await structuredLlm.invoke([
    new SystemMessage(prompt),
    new HumanMessage("Format the thesis pitch into an academic roadmap.")
  ]);

  return { academicRoadmap: roadmap };
}

// ==========================================
// 🕵️‍♂️ Agent 2: The Assistant Researcher
// ==========================================
async function assistantNode(state: ThesisStateSchema) {
  const llm = getModel();
  const tools = [searchAcademicLiteratureTool];
  const modelWithTools = llm.bindTools(tools);
  
  const prompt = `You are a diligent PhD Assistant Researcher. The Professor has just proposed a thesis roadmap for a Master's student. Your job is to search the current literature to ensure this topic is relevant, not entirely over-saturated, and has valid baselines.

Professor's Roadmap:
Theme: ${state.academicRoadmap?.refinedTopic || "Unknown"}
RQs: ${(state.academicRoadmap?.researchQuestions || []).join(", ")}

Instructions:
1. Extract the core keywords.
2. Use the search_academic_literature tool to find recent papers.
3. Synthesize the findings into a concise report.`;

  // 1. Ask model to use the tool
  const response = await modelWithTools.invoke([
    new SystemMessage(prompt),
    new HumanMessage("Please search the literature and then provide your analysis.")
  ]); 

  // 2. Execute the tool
  let toolMessages: any[] = [];
  if (response.tool_calls && response.tool_calls.length > 0) {
    toolMessages = await Promise.all(response.tool_calls.map(async (toolCall) => {
      let content = "Unsupported tool";
      if (toolCall.name === "search_academic_literature") {
        content = await searchAcademicLiteratureTool.invoke(toolCall.args);
      }
      return new ToolMessage({ name: toolCall.name, tool_call_id: toolCall.id, content });
    }));
  }

  // 3. Force structured output by using withStructuredOutput on a new LLM instance with the tool results appended
  const structuredLlm = getModel().withStructuredOutput(z.object({
    saturationLevel: z.enum(['Low', 'Medium', 'High']),
    recentKeyPapers: z.array(z.object({
      title: z.string(),
      year: z.number().or(z.string())
    })),
    researchGapStatus: z.string().describe("A brief 2-sentence summary confirming if the student's proposed angle still has room for original contribution based on the retrieved papers.")
  }));

  const messagesToProvide: any[] = [
    new SystemMessage(prompt),
    new HumanMessage("Please search the literature and then provide your analysis."),
    response
  ];
  
  if (toolMessages.length > 0) {
      messagesToProvide.push(...toolMessages);
      messagesToProvide.push(new HumanMessage("Now synthesize those tool results into the required JSON format."));
  } else {
      messagesToProvide.push(new HumanMessage("No tool calls were made. Proceeding to synthesis."));
  }

  const literatureContext = await structuredLlm.invoke(messagesToProvide);

  return { literatureContext: literatureContext };
}

// ==========================================
// ⚖️ Agent 3: The Defense Chair
// ==========================================
async function chairNode(state: ThesisStateSchema) {
  const llm = getModel();
  
  const prompt = `You are the strict but fair Chair of the Thesis Defense Committee. You are evaluating a Master's thesis proposal.

Initial Pitch: "${state.initialPitch}"

Professor's Roadmap:
${JSON.stringify(state.academicRoadmap, null, 2)}

Assistant's Literature Context:
${JSON.stringify(state.literatureContext, null, 2)}

Your job is to identify fatal flaws, scope creep, and feasibility risks. Specially look out for ideas that require massive proprietary datasets or massive compute resources, unless explicitly stated otherwise.

Instructions:
- The 'So What?' Test: Evaluate utility. Does this solve a real problem?
- Scope Constraints: Identify exactly what the student must exclude to finish within 6 months.
- Risk Assessment: Highlight the single biggest point of failure in their methodology.`;

  const structuredLlm = llm.withStructuredOutput(z.object({
    utilityScore: z.number().min(1).max(10),
    majorRisks: z.array(z.string()).describe("1-2 critical risks"),
    outOfScope: z.string().describe("Clear statement of what the student should NOT do"),
    finalVerdict: z.enum(["APPROVED", "NEEDS_REVISION", "REJECTED"]),
    actionableFeedback: z.string().describe("One sentence telling the student exactly what to change in their next iteration.")
  }));

  const critique = await structuredLlm.invoke([
    new SystemMessage(prompt),
    new HumanMessage("Provide your final evaluation formatted strictly as requested.")
  ]);

  return {
    defenseCritique: critique,
    healthStatus: critique.finalVerdict
  };
}

// ==========================================
// 🔄 The LangGraph Routing Logic
// ==========================================
const workflow = new StateGraph(ThesisState)
  .addNode("professor", professorNode)
  .addNode("assistant", assistantNode)
  .addNode("chair", chairNode)
  
  // Linear Flow
  .addEdge(START, "professor")
  .addEdge("professor", "assistant")
  .addEdge("assistant", "chair")
  .addEdge("chair", END);

export const memorySaver = new MemorySaver();

export const compileThesisGraph = () => {
    return workflow.compile({ checkpointer: memorySaver });
};
