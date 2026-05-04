import type { RowData } from "@tanstack/react-table"

declare module "@tanstack/react-table" {
  // interface TableMeta<TData extends RowData> {
  //   queryKeys?: QueryKeys
  // }

  interface ColumnMeta<TData extends RowData, TValue> {
    label?: string
    placeholder?: string
    // variant?: "text" //| "select" | "date" | "slider"
    variant?: "text" | "number"
    options?: Option[]
    range?: [number, number]
    unit?: string
    icon?: React.ReactNode
  }
}

export interface Option {
  label: string
  value: string
  count?: number
  icon?: React.ReactNode
}
