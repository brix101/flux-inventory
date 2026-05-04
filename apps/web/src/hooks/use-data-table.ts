import type { TableOptions, TableState } from "@tanstack/react-table"
import * as React from "react"
import { getCoreRowModel, useReactTable } from "@tanstack/react-table"

// import type { ExtendedColumnSort, QueryKeys } from "@/types/data-table"

const PAGE_KEY = "page"
const PER_PAGE_KEY = "perPage"
const SORT_KEY = "sort"
const QUERY_KEY = "q"
const DEBOUNCE_MS = 300
const THROTTLE_MS = 50

interface UseDataTableProps<TData>
  extends
    Omit<
      TableOptions<TData>,
      | "state"
      | "pageCount"
      | "getCoreRowModel"
      | "manualFiltering"
      | "manualPagination"
      | "manualSorting"
    >,
    Required<Pick<TableOptions<TData>, "pageCount">> {
  initialState?: Omit<Partial<TableState>, "sorting"> & {
    // sorting?: ExtendedColumnSort<TData>[]
  }
  // queryKeys?: Partial<QueryKeys>
  history?: "push" | "replace"
  debounceMs?: number
  throttleMs?: number
  clearOnDefault?: boolean
  enableAdvancedFilter?: boolean
  scroll?: boolean
  shallow?: boolean
  startTransition?: React.TransitionStartFunction
}

export function useDataTable<TData>(props: UseDataTableProps<TData>) {
  const {
    columns,
    pageCount = -1,
    initialState,
    // queryKeys,
    history = "replace",
    debounceMs = DEBOUNCE_MS,
    throttleMs = THROTTLE_MS,
    clearOnDefault = false,
    enableAdvancedFilter = false,
    scroll = false,
    shallow = true,
    startTransition,
    ...tableProps
  } = props

  const table = useReactTable({
    ...tableProps,
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

  return React.useMemo(() => table, [table])
}
