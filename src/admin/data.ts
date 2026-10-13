import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { contentKeys } from '../content/api'
import type { Database, Tables, TablesInsert, TablesUpdate } from '../lib/database.types'
import { requireSupabase } from '../lib/supabase'

export type TableName = keyof Database['public']['Tables']
type Row<T extends TableName> = Tables<T>

export const adminKey = (table: TableName) => ['admin', table] as const

/** Public queries to refresh after each table changes, so the live site updates immediately. */
const affects: Record<TableName, readonly (readonly unknown[])[]> = {
  services: [contentKeys.services],
  gallery_items: [contentKeys.gallery],
  testimonials: [contentKeys.testimonials],
  barbers: [contentKeys.barbers],
  barber_media: [contentKeys.barbers],
  shop_settings: [contentKeys.shop],
  booking_requests: [],
  admins: [],
}

const raise = (error: { message: string }): never => {
  throw new Error(error.message)
}

/** All rows of a table (admins see hidden rows too), ordered. */
export function useRows<T extends TableName>(table: T, orderBy = 'sort_order', ascending = true) {
  return useQuery({
    queryKey: adminKey(table),
    queryFn: async () => {
      const { data, error } = await requireSupabase()
        .from(table)
        .select('*')
        .order(orderBy as never, { ascending })
      if (error) raise(error)
      return (data ?? []) as unknown as Row<T>[]
    },
  })
}

export function useInvalidate() {
  const qc = useQueryClient()
  return (table: TableName) => {
    void qc.invalidateQueries({ queryKey: adminKey(table) })
    for (const key of affects[table]) void qc.invalidateQueries({ queryKey: key })
  }
}

/** Insert / update / delete for one table; every success refreshes admin and public data. */
export function useTableMutations<T extends TableName>(table: T, idColumn = 'id') {
  const invalidate = useInvalidate()
  const done = { onSuccess: () => invalidate(table) }
  const db = () => requireSupabase().from(table)

  const insert = useMutation({
    ...done,
    mutationFn: async (values: TablesInsert<T>) => {
      const { data, error } = await db()
        .insert(values as never)
        .select()
        .single()
      if (error) raise(error)
      return data as unknown as Row<T>
    },
  })

  const update = useMutation({
    ...done,
    mutationFn: async ({ id, values }: { id: string | number; values: TablesUpdate<T> }) => {
      const { error } = await db()
        .update(values as never)
        .eq(idColumn as never, id as never)
      if (error) raise(error)
    },
  })

  const remove = useMutation({
    ...done,
    mutationFn: async (id: string | number) => {
      const { error } = await db()
        .delete()
        .eq(idColumn as never, id as never)
      if (error) raise(error)
    },
  })

  return { insert, update, remove }
}

type Sortable = { id: string; sort_order: number }

/** Move a row up or down: rewrites sort_order 1..n for the rows whose position changed. */
export function useReorder(table: TableName) {
  const invalidate = useInvalidate()
  return useMutation({
    mutationFn: async ({ rows, index, direction }: { rows: Sortable[]; index: number; direction: -1 | 1 }) => {
      const target = index + direction
      if (target < 0 || target >= rows.length) return
      const next = [...rows]
      ;[next[index], next[target]] = [next[target], next[index]]
      const changes = next.map((row, i) => ({ id: row.id, sort_order: i + 1 })).filter((c, i) => next[i].sort_order !== c.sort_order)
      for (const change of changes) {
        const { error } = await requireSupabase()
          .from(table)
          .update({ sort_order: change.sort_order } as never)
          .eq('id' as never, change.id as never)
        if (error) raise(error)
      }
    },
    onSuccess: () => invalidate(table),
  })
}

export const nextSortOrder = (rows: { sort_order: number }[]) =>
  rows.reduce((max, r) => Math.max(max, r.sort_order), 0) + 1
