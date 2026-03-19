import { DynamicStructuredTool } from "@langchain/core/tools";
import { z } from "zod";

export const searchAcademicLiteratureTool = new DynamicStructuredTool({
  name: "search_academic_literature",
  description: "Search the OpenAlex database for recent academic papers based on a query.",
  schema: z.object({
    query: z.string().describe("The search query containing core keywords."),
  }),
  func: async ({ query }) => {
    try {
      // Create a search URL on OpenAlex
      const url = `https://api.openalex.org/works?search=${encodeURIComponent(query)}&per-page=3&sort=publication_year:desc`;
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`OpenAlex API error: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (!data.results || data.results.length === 0) {
        return "No recent papers found for this topic.";
      }

      const formattedResults = data.results.map((work: any) => {
        return `- Title: ${work.title}
  Year: ${work.publication_year}
  URL: ${work.id}`;
      });

      return `Top 3 most recent related papers:\n\n${formattedResults.join("\n\n")}`;
    } catch (error: any) {
      return `Error searching literature: ${error.message}`;
    }
  },
});
