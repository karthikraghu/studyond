import { tool } from "@langchain/core/tools";
import { z } from "zod";

export const evaluateComputeTimeTool = tool(async ({ modelType, datasetSizeGB, hardware }) => {
  // A mock heuristic table for estimating model compute requirements
  const computeHeuristics = {
    "llm": { baseHoursPerGB: 10, memoryNeededGB: 24 },
    "cnn": { baseHoursPerGB: 2, memoryNeededGB: 8 },
    "transformer": { baseHoursPerGB: 8, memoryNeededGB: 16 },
    "tabular": { baseHoursPerGB: 0.1, memoryNeededGB: 4 },
    "default": { baseHoursPerGB: 5, memoryNeededGB: 12 }
  };

  const modelKey = Object.keys(computeHeuristics).find(k => modelType.toLowerCase().includes(k)) || "default";
  const params = computeHeuristics[modelKey as keyof typeof computeHeuristics];
  
  let hardwareMultiplier = 1.0;
  if (hardware.toLowerCase().includes("a100")) hardwareMultiplier = 0.5;
  if (hardware.toLowerCase().includes("h100")) hardwareMultiplier = 0.25;
  if (hardware.toLowerCase().includes("cpu") || hardware.toLowerCase().includes("macbook")) hardwareMultiplier = 15.0;
  if (hardware.toLowerCase().includes("t4")) hardwareMultiplier = 1.0;

  const estimatedHours = params.baseHoursPerGB * datasetSizeGB * hardwareMultiplier;
  
  let scopeWarning = "";
  if (estimatedHours > 720) { // > 1 month of straight compute
    scopeWarning = "\nWARNING: This compute is far too high for a standard 3-6 month master's thesis. Needs significant downscoping or access to a compute cluster.";
  } else if (estimatedHours > 168) { // > 1 week
    scopeWarning = "\nNOTE: Feasible but requires dedicated GPU resources and careful tracking.";
  } else {
    scopeWarning = "\nNOTE: Well within feasible limits for a standard thesis timeline.";
  }

  return `### Time-Estimation Evaluation (Mock Python REPL outcome) ###
- Model Type Profile: ${modelType}
- Dataset Size: ${datasetSizeGB} GB
- Target Hardware: ${hardware}
- Estimated VRAM Needed: ${params.memoryNeededGB} GB
- Estimated Training Time: ~${estimatedHours.toFixed(1)} hours
${scopeWarning}
  `;
}, {
  name: "evaluate_compute_time",
  description: "Runs a simple Python script mathematically estimating the likely compute time and resources required to train a particular model on a specific dataset size and hardware setup. Crucial to validate scope.",
  schema: z.object({
    modelType: z.string().describe("The architecture or model type (e.g. 'LLM', 'CNN', 'Transformer', 'Tabular')."),
    datasetSizeGB: z.number().describe("Estimated size of the dataset in gigabytes (e.g., 50)."),
    hardware: z.string().describe("Target hardware available to the student (e.g. 'MacBook Pro CPU', 'Single A100 GPU', 'Google Colab T4').")
  })
});
