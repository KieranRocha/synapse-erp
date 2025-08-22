import { create } from 'zustand'

type Toast = { id: string; message: string }
type ToastState = {
  toasts: Toast[]
  push: (message: string) => void
  remove: (id: string) => void
}

export const useToastStore = create<ToastState>((set) => ({
  toasts: [],
  push: (message) => set((s) => ({ toasts: [...s.toasts, { id: crypto.randomUUID(), message }] })),
  remove: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) }))
}))
