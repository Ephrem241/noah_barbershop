import { createContext, useContext } from 'react'

export type ConfirmOptions = {
  title: string
  message?: string
  confirmLabel?: string
  danger?: boolean
}

export type Feedback = {
  toast: (message: string, tone?: 'success' | 'error') => void
  confirm: (options: ConfirmOptions) => Promise<boolean>
}

export const FeedbackContext = createContext<Feedback | null>(null)

export function useFeedback() {
  const ctx = useContext(FeedbackContext)
  if (!ctx) throw new Error('useFeedback must be used inside <FeedbackProvider>')
  return ctx
}

/** Turns any thrown value into a readable message. */
export const errorMessage = (e: unknown) => (e instanceof Error ? e.message : 'Something went wrong')
