import { tool } from "@langchain/core/tools";
import { z } from "zod";

export const searchGitHubTool = tool(async ({ query, limit = 5 }) => {
  try {
    const q = encodeURIComponent(`${query} dataset OR implementation`);
    const response = await fetch(`https://api.github.com/search/repositories?q=${q}&sort=stars&order=desc&per_page=${limit}`, {
      headers: {
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'Thesis-Validator-Agent'
      }
    });

    if (!response.ok) {
      if (response.status === 403) {
        return "GitHub API rate limit exceeded. Please infer data availability based on existing knowledge or try again later.";
      }
      throw new Error(`GitHub API returned status ${response.status}`);
    }

    const data = await response.json();
    const repos = data.items || [];
    
    if (repos.length === 0) {
      return "No relevant open-source repositories or datasets found on GitHub.";
    }

    const compiled = repos.map((repo: any) => ({
      name: repo.name,
      description: repo.description,
      stars: repo.stargazers_count,
      url: repo.html_url
    }));

    return JSON.stringify(compiled, null, 2);
  } catch (error: any) {
    return `Error searching GitHub: ${error.message}`;
  }
}, {
  name: "search_github",
  description: "Search GitHub for existing data sets, repositories, or baseline implementations to evaluate the technical feasibility of a thesis project.",
  schema: z.object({
    query: z.string().describe("The topic or dataset to search for."),
    limit: z.number().optional().describe("Number of results to return.")
  })
});
