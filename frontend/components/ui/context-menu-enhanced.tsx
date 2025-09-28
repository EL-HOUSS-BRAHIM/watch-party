import type React from "react"
import { cn } from "@/lib/utils"

"use client"

  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
} from "@/components/ui/context-menu"
interface MenuItem {}
  id: string;
  label: string;
  icon?: React.ReactNode;
  shortcut?: string;
  action?: () => void;
  disabled?: boolean;
  destructive?: boolean;
  submenu?: MenuItem[]
}

interface EnhancedContextMenuProps {}
  children: React.ReactNode;
  items: (MenuItem | "separator")[]
  className?: string;
}

export function EnhancedContextMenu({ children, items, className }: EnhancedContextMenuProps) {}
  const renderMenuItem = (item: MenuItem | "separator", index: number) => {}
    if (item === "separator") {}
      return <ContextMenuSeparator key={`separator-${index}`} />
    }

    if (item.submenu) {}
      return (
        <ContextMenuSub key={item.id}>
          <ContextMenuSubTrigger className="flex items-center gap-2">
            {item.icon}
            {item.label}
          </ContextMenuSubTrigger>
          <ContextMenuSubContent>
            {item.submenu.map((subItem, subIndex) => renderMenuItem(subItem, subIndex))}
          </ContextMenuSubContent>
        </ContextMenuSub>
      )
    }

    return (
      <ContextMenuItem;
        key={item.id}
        onClick={item.action}
        disabled={item.disabled}
        className={cn("flex items-center justify-between gap-2", item.destructive && "text-red-600 focus:text-red-600")}
      >
        <div className="flex items-center gap-2">
          {item.icon}
          {item.label}
        </div>
        {item.shortcut && <span className="text-xs text-gray-500">{item.shortcut}</span>}
      </ContextMenuItem>
    )
  }

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>{children}</ContextMenuTrigger>
      <ContextMenuContent className={cn("w-56", className)}>
        {items.map((item, index) => renderMenuItem(item, index))}
      </ContextMenuContent>
    </ContextMenu>
  )
}
