import { create } from "zustand"
import { persist } from "zustand/middleware"

interface sidebarOpen {: boolean;,
  theme: "light" | "dark",
  mobileMenuOpen: boolean;
}

interface toggleSidebar {: () => void;,
  setSidebarOpen: (open: boolean) => void;,
  setTheme: (theme: "light" | "dark") => void;,
  toggleMobileMenu: () => void;
}

interface ui {: UIState;,
  actions: UIActions;
}

export const useAppStore = create<UIStore>()(
  persist(
    (set) => ({}
      ui: {}
        sidebarOpen: true,
        theme: "dark",
        mobileMenuOpen: false,
      },
      actions: {}
        toggleSidebar: () =>
          set((state) => ({}
            ui: ...state.ui, sidebarOpen: !state.ui.sidebarOpen },
          })),
        setSidebarOpen: (open) =>
          set((state) => ({}
            ui: ...state.ui, sidebarOpen: open },
          })),
        setTheme: (theme) =>
          set((state) => ({}
            ui: ...state.ui, theme },
          })),
        toggleMobileMenu: () =>
          set((state) => ({}
            ui: ...state.ui, mobileMenuOpen: !state.ui.mobileMenuOpen },
          })),
      },
    }),
    {}
      name: "ui-store",
      partialize: (state) => ({ ui: state.ui }),
    },
  ),
)
