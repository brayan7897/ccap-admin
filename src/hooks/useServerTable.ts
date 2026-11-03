"use client";

import { useCallback, useState } from "react";
import { useDebounce } from "@/hooks/useDebounce";

interface Options {
  pageSize?: number;
  debounceMs?: number;
  /** Server search only fires from this many characters (shorter = no filter). */
  minChars?: number;
}

/**
 * State for a server-paginated, server-filtered admin table.
 *
 * - searchInput is bound to the input (instant, no lag while typing).
 * - search is the debounced, validated value that goes into the query key,
 *   so we fire one request per pause instead of one per keystroke.
 * - Any change to the search or to a filter sent through resetPage() sends
 *   the user back to page 1. Otherwise a filter can leave them on a page
 *   that no longer exists and show a misleading empty table.
 */
export function useServerTable({
  pageSize = 25,
  debounceMs = 350,
  minChars = 2,
}: Options = {}) {
  const [searchInput, setSearchInput] = useState("");
  const trimmed = searchInput.trim();
  const debounced = useDebounce(trimmed, debounceMs);
  const search = debounced.length >= minChars ? debounced : "";

  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize });

  // "Adjust state while rendering" (React docs): avoids an extra effect pass.
  const [prevSearch, setPrevSearch] = useState(search);
  if (prevSearch !== search) {
    setPrevSearch(search);
    setPagination((p) => (p.pageIndex === 0 ? p : { ...p, pageIndex: 0 }));
  }

  const resetPage = useCallback(
    () => setPagination((p) => (p.pageIndex === 0 ? p : { ...p, pageIndex: 0 })),
    [],
  );

  return {
    searchInput,
    setSearchInput,
    search,
    /** True between the last keystroke and the request being fired. */
    isSearchPending: trimmed !== debounced,
    pagination,
    setPagination,
    resetPage,
    skip: pagination.pageIndex * pagination.pageSize,
    limit: pagination.pageSize,
  };
}
