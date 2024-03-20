import { PriceAPIJobResult, PriceAPISearchResult } from "../interfaces";

export interface SearchResult {
  // Define the structure of your search result items
  [key: string]: any; // Replace `any` with actual properties and types you expect
}

export interface ApiResponse {
  // Structure of the API response
  results: [
    {
      query: { source: string };
      content: { search_results: SearchResult[] };
    }
  ];
}

export function processResults(data: ApiResponse, source: string): SearchResult[] {
  const searchResults = data.results[0].content.search_results;
  // Append the source to each item
  return searchResults.map((item) => ({ ...item, source }));
}

export function combineResults(apiResponses: PriceAPIJobResult[]): PriceAPISearchResult[] {
  return apiResponses.flatMap(apiResponse => {
    const source = apiResponse.results[0].query.source;
    return apiResponse.results[0].content.search_results.map(item => ({
      ...item,
      source: source, // Use the sourceMap to get the friendly name if it exists
    }));
  });
}
