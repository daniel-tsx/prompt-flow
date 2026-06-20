"use server";

import { globalSearch, type SearchResult } from "@/db/queries/search";

export async function searchEverything(query: string): Promise<SearchResult[]> {
  return globalSearch(query, 6);
}
