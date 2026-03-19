import { tool } from "@langchain/core/tools";
import { z } from "zod";
import { parseStringPromise } from "xml2js";

export const searchArxivTool = tool(async ({ query, maxResults = 5 }) => {
  try {
    const response = await fetch(`http://export.arxiv.org/api/query?search_query=all:${encodeURIComponent(query)}&start=0&max_results=${maxResults}`);
    const xmlData = await response.text();
    const result = await parseStringPromise(xmlData);
    
    // Parse the Atom feed structure
    const entries = result.feed.entry || [];
    const parsedEntries = entries.map((entry: any) => ({
      title: entry.title[0].trim(),
      summary: entry.summary[0].trim(),
      published: entry.published[0],
      authors: entry.author.map((a: any) => a.name[0]),
      link: entry.id[0]
    }));

    if (parsedEntries.length === 0) {
      return "No literature found for this query on ArXiv.";
    }

    return JSON.stringify(parsedEntries, null, 2);
  } catch (error: any) {
    return `Error searching ArXiv: ${error.message}`;
  }
}, {
  name: "search_arxiv",
  description: "Search the ArXiv pre-print server for academic papers. Use this to check originality and saturation of a topic. Returns a JSON string of paper titles, summaries, and dates.",
  schema: z.object({
    query: z.string().describe("The search query. Focus on specific technical concepts or keywords."),
    maxResults: z.number().optional().describe("Maximum number of results to return. Default is 5.")
  }),
});
