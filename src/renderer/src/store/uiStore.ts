import { create } from 'zustand'
import { persist, PersistOptions } from 'zustand/middleware'

interface UIState {
  isDark: boolean
  setIsDark: () => void
  setDark: (val: boolean) => void
  sidebarCollapsed: boolean
  toggleSidebar: () => void
}

type UIStore = UIState & {
  _persist?: PersistOptions<UIState>
}

export const useUIStore = create<UIStore>()(
  persist(
    (set) => ({
      isDark: false,
      setIsDark: () => set((s) => ({ isDark: !s.isDark })),
      setDark: (val) => set({ isDark: !!val }),
      sidebarCollapsed: false,
      toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed }))
    }),
    { name: 'ui-store' }
  )
)
