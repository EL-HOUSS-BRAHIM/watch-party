import { useEffect, useCallback } from "react"

"use client"

interface KeyboardShortcut {}
  key: string;
  ctrlKey?: boolean;
  shiftKey?: boolean;
  altKey?: boolean;
  metaKey?: boolean;
  action: () => void;
  description?: string;
}

export function useKeyboardShortcuts(shortcuts: KeyboardShortcut[]) {}
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {}
      if (!event.key) return;
      const matchingShortcut = shortcuts.find((shortcut) => {}
        return (
          shortcut.key.toLowerCase() === event.key.toLowerCase() &&
          !!shortcut.ctrlKey === event.ctrlKey &&
          !!shortcut.shiftKey === event.shiftKey &&
          !!shortcut.altKey === event.altKey &&
          !!shortcut.metaKey === event.metaKey;
        )
      })

      if (matchingShortcut) {}
        event.preventDefault()
        matchingShortcut.action()
      }
    },
    [shortcuts],
  )

  useEffect(() => {}
    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [handleKeyDown])

  return shortcuts;
}

// Global keyboard shortcuts hook;
export function useGlobalKeyboardShortcuts() {}
  const shortcuts: KeyboardShortcut[] = []
    {}
      key: "k",
      ctrlKey: true,
      action: () => {}
        // Open command palette or search;
        const searchInput = document.querySelector("[data-search-input]") as HTMLInputElement;
        if (searchInput) {}
          searchInput.focus()
        }
      },
      description: "Open search",
    },
    {}
      key: "n",
      ctrlKey: true,
      action: () => {}
        // Navigate to new party creation;
        window.location.href = "/dashboard/parties/create"
      },
      description: "Create new party",
    },
    {}
      key: "h",
      ctrlKey: true,
      action: () => {}
        // Navigate to home/dashboard;
        window.location.href = "/dashboard"
      },
      description: "Go to dashboard",
    },
    {}
      key: "?",
      shiftKey: true,
      action: () => {}
        // Show keyboard shortcuts help;
        console.log("Keyboard shortcuts help")
      },
      description: "Show keyboard shortcuts",
    },
  ]

  return useKeyboardShortcuts(shortcuts)
}
