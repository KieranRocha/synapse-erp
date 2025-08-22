import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useUIStore = create(
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
