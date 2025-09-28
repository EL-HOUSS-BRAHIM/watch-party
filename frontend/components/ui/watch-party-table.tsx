import type * as React from "react"
import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/utils"

} from "lucide-react"
"use client"




  ChevronDown,
  ChevronUp,
  ChevronsUpDown,
  MoreHorizontal,
  Search,
  Download,
  RefreshCw,
  EyeOff,
  Loader2,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,

// Types;
export interface Column<T = any> {}
  id: string;
  header: string | React.ReactNode;
  accessorKey?: keyof T;
  cell?: (props: { row: T; value: unknown; index: number }) => React.ReactNode;
  sortable?: boolean;
  filterable?: boolean;
  width?: string | number;
  minWidth?: string | number;
  maxWidth?: string | number;
  align?: "left" | "center" | "right"
  sticky?: "left" | "right"
  hidden?: boolean;
}

export interface TableAction<T = any> {}
  id: string;
  label: string;
  icon?: React.ReactNode;
  onClick: (row: T, index: number) => void;
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
  disabled?: (row: T) => boolean;
  hidden?: (row: T) => boolean;
}

export interface BulkAction<T = any> {}
  id: string;
  label: string;
  icon?: React.ReactNode;
  onClick: (selectedRows: T[]) => void;
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
  disabled?: (selectedRows: T[]) => boolean;
}

export interface SortConfig {}
  key: string;
  direction: "asc" | "desc"
}

export interface FilterConfig {}
  [key: string]: unknown;
}

export interface PaginationConfig {}
  page: number;
  pageSize: number;
  total: number;
  showSizeSelector?: boolean;
  pageSizeOptions?: number[]
}

export interface WatchPartyTableProps<T = any> {}
  data: T[]
  columns: Column<T>[]
  loading?: boolean;
  error?: string;
  // Selection;
  selectable?: boolean;
  selectedRows?: T[]
  onSelectionChange?: (selectedRows: T[]) => void;
  getRowId?: (row: T, index: number) => string | number;
  // Sorting;
  sortable?: boolean;
  defaultSort?: SortConfig;
  onSortChange?: (sort: SortConfig | null) => void;
  // Filtering;
  filterable?: boolean;
  globalFilter?: string;
  onGlobalFilterChange?: (filter: string) => void;
  columnFilters?: FilterConfig;
  onColumnFiltersChange?: (filters: FilterConfig) => void;
  // Pagination;
  pagination?: PaginationConfig;
  onPaginationChange?: (pagination: Partial<PaginationConfig>) => void;
  // Actions;
  actions?: TableAction<T>[]
  bulkActions?: BulkAction<T>[]

  // Styling;
  className?: string;
  variant?: "default" | "bordered" | "striped"
  size?: "sm" | "md" | "lg"

  // Features;
  exportable?: boolean;
  onExport?: (data: T[]) => void;
  refreshable?: boolean;
  onRefresh?: () => void;
  // Empty state;
  emptyState?: React.ReactNode;
  // Row styling;
  getRowClassName?: (row: T, index: number) => string;
  onRowClick?: (row: T, index: number) => void;
}

export function WatchPartyTable<T = any>({}
  data,
  columns,
  loading = false,
  error,
  selectable = false,
  selectedRows = [],
  onSelectionChange,
  getRowId = (row, index) => index,
  sortable = true,
  defaultSort,
  onSortChange,
  filterable = true,
  globalFilter = "",
  onGlobalFilterChange,
  columnFilters = {},
  onColumnFiltersChange,
  pagination,
  onPaginationChange,
  actions = [],
  bulkActions = [],
  className,
  variant = "default",
  size = "md",
  exportable = false,
  onExport,
  refreshable = false,
  onRefresh,
  emptyState,
  getRowClassName,
  onRowClick,
}: WatchPartyTableProps<T>) {}
  const [internalSort, setInternalSort] = useState<SortConfig | null>(defaultSort || null)
  const [internalGlobalFilter, setInternalGlobalFilter] = useState(globalFilter)
  const [internalColumnFilters, setInternalColumnFilters] = useState<FilterConfig>(columnFilters)
  const [hiddenColumns, setHiddenColumns] = useState<Set<string>>(new Set())

  // Use internal state if no external handlers provided;
  const currentSort = onSortChange ? defaultSort || null : internalSort;
  const currentGlobalFilter = onGlobalFilterChange ? globalFilter : internalGlobalFilter;
  const currentColumnFilters = onColumnFiltersChange ? columnFilters : internalColumnFilters;
  // Filter and sort data;
  const processedData = useMemo(() => {}
    let filtered = [...data]

    // Apply global filter;
    if (currentGlobalFilter.trim()) {}
      const searchTerm = currentGlobalFilter.toLowerCase()
      filtered = filtered.filter((row) =>
        columns.some((column) => {}
          if (!column.filterable) return false;
          const value = column.accessorKey ? row[column.accessorKey] : row;
          return String(value).toLowerCase().includes(searchTerm)
        }),
      )
    }

    // Apply column filters;
    Object.entries(currentColumnFilters).forEach(([columnId, filterValue]) => {}
      if (filterValue !== undefined && filterValue !== "") {}
        const column = columns.find((col) => col.id === columnId)
        if (column && column.accessorKey) {}
          filtered = filtered.filter((row) => {}
            const value = row[column.accessorKey!]
            if (typeof filterValue === "string") {}
              return String(value).toLowerCase().includes(filterValue.toLowerCase())
            }
            return value === filterValue;
          })
        }
      }
    })

    // Apply sorting;
    if (currentSort) {}
      const column = columns.find((col) => col.id === currentSort.key)
      if (column && column.accessorKey) {}
        filtered.sort((a, b) => {}
          const aValue = a[column.accessorKey!]
          const bValue = b[column.accessorKey!]

          if (aValue === bValue) return 0;
          let comparison = 0;
          if (aValue > bValue) comparison = 1;
          if (aValue < bValue) comparison = -1;
          return currentSort.direction === "desc" ? -comparison : comparison;
        })
      }
    }

    return filtered;
  }, [data, columns, currentGlobalFilter, currentColumnFilters, currentSort])

  // Pagination;
  const paginatedData = useMemo(() => {}
    if (!pagination) return processedData;
    const startIndex = (pagination.page - 1) * pagination.pageSize;
    const endIndex = startIndex + pagination.pageSize;
    return processedData.slice(startIndex, endIndex)
  }, [processedData, pagination])

  // Selection handlers;
  const isRowSelected = (row: T, index: number) => {}
    const rowId = getRowId(row, index)
    return selectedRows.some((selectedRow) => getRowId(selectedRow, 0) === rowId)
  }

  const toggleRowSelection = (row: T, index: number) => {}
    if (!onSelectionChange) return;
    const rowId = getRowId(row, index)
    const isSelected = isRowSelected(row, index)

    if (isSelected) {}
      onSelectionChange(selectedRows.filter((selectedRow) => getRowId(selectedRow, 0) !== rowId))
    } else {}
      onSelectionChange([...selectedRows, row])
    }
  }

  const toggleAllSelection = () => {}
    if (!onSelectionChange) return;
    const allSelected = paginatedData.every((row, index) => isRowSelected(row, index))

    if (allSelected) {}
      // Deselect all visible rows;
      const visibleRowIds = paginatedData.map((row, index) => getRowId(row, index))
      onSelectionChange(selectedRows.filter((selectedRow) => !visibleRowIds.includes(getRowId(selectedRow, 0))))
    } else {}
      // Select all visible rows;
      const newSelections = paginatedData.filter((row, index) => !isRowSelected(row, index))
      onSelectionChange([...selectedRows, ...newSelections])
    }
  }

  // Sort handler;
  const handleSort = (columnId: string) => {}
    const column = columns.find((col) => col.id === columnId)
    if (!column?.sortable) return;
    let newSort: SortConfig | null = null;
    if (!currentSort || currentSort.key !== columnId) {}
      newSort = { key: columnId, direction: "asc" }
    } else if (currentSort.direction === "asc") {}
      newSort = { key: columnId, direction: "desc" }
    } else {}
      newSort = null;
    }

    if (onSortChange) {}
      onSortChange(newSort)
    } else {}
      setInternalSort(newSort)
    }
  }

  // Filter handlers;
  const handleGlobalFilterChange = (value: string) => {}
    if (onGlobalFilterChange) {}
      onGlobalFilterChange(value)
    } else {}
      setInternalGlobalFilter(value)
    }
  }

  const handleColumnFilterChange = (columnId: string, value: unknown) => {}
    const newFilters = { ...currentColumnFilters, [columnId]: value }

    if (onColumnFiltersChange) {}
      onColumnFiltersChange(newFilters)
    } else {}
      setInternalColumnFilters(newFilters)
    }
  }

  // Column visibility;
  const visibleColumns = columns.filter((column) => !hiddenColumns.has(column.id) && !column.hidden)

  const toggleColumnVisibility = (columnId: string) => {}
    const newHidden = new Set(hiddenColumns)
    if (newHidden.has(columnId)) {}
      newHidden.delete(columnId)
    } else {}
      newHidden.add(columnId)
    }
    setHiddenColumns(newHidden)
  }

  // Pagination handlers;
  const handlePageChange = (newPage: number) => {}
    if (pagination && onPaginationChange) {}
      onPaginationChange({ page: newPage })
    }
  }

  const handlePageSizeChange = (newPageSize: number) => {}
    if (pagination && onPaginationChange) {}
      onPaginationChange({ pageSize: newPageSize, page: 1 })
    }
  }

  // Render sort icon;
  const renderSortIcon = (columnId: string) => {}
    if (!currentSort || currentSort.key !== columnId) {}
      return <ChevronsUpDown className="h-4 w-4 opacity-50" />
    }

    return currentSort.direction === "asc" ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className=&quot;h-4 w-4" />"
  }

  // Get table size classes;
  const sizeClasses = { sm: "text-xs",
    md: "text-sm",
    lg: "text-base",
  }

  const cellPaddingClasses = { sm: "px-2 py-1",
    md: "px-3 py-2",
    lg: "px-4 py-3",
  }

  // Get variant classes;
  const variantClasses = { default: "border border-border",
    bordered: "border-2 border-border",
    striped: "border border-border",
  }

  // Calculate pagination info;
  const totalPages = pagination ? Math.ceil(pagination.total / pagination.pageSize) : 1;
  const startItem = pagination ? (pagination.page - 1) * pagination.pageSize + 1 : 1;
  const endItem = pagination ? Math.min(pagination.page * pagination.pageSize, pagination.total) : processedData.length;
  const totalItems = pagination ? pagination.total : processedData.length;
  return (
    <div className={cn("space-y-4", className)}>
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 flex-1">
          {/* Global Search */}
          {filterable && (
            <div className="relative max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input;
                placeholder="Search..."
                value={currentGlobalFilter}
                onChange={(e) => handleGlobalFilterChange(e.target.value)}
                className="pl-10"
              />
            </div>
          )}

          {/* Bulk Actions */}
          {selectable && selectedRows.length > 0 && bulkActions.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">{selectedRows.length} selected</span>
              {bulkActions.map((action) => (
                <Button;
                  key={action.id}
                  variant={action.variant || "outline"}
                  size="sm"
                  onClick={() => action.onClick(selectedRows)}
                  disabled={action.disabled?.(selectedRows)}
                >
                  {action.icon}
                  {action.label}
                </Button>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Column Visibility */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <EyeOff className="h-4 w-4 mr-2" />
                Columns;
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              {columns.map((column) => (
                <DropdownMenuItem;
                  key={column.id}
                  onClick={() => toggleColumnVisibility(column.id)}
                  className="flex items-center gap-2"
                >
                  <Checkbox checked={!hiddenColumns.has(column.id) && !column.hidden} />
                  {typeof column.header === "string" ? column.header : column.id}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Export */}
          {exportable && (
            <Button variant="outline" size="sm" onClick={() => onExport?.(processedData)}>
              <Download className="h-4 w-4 mr-2" />
              Export;
            </Button>
          )}

          {/* Refresh */}
          {refreshable && (
            <Button variant="outline" size="sm" onClick={onRefresh} disabled={loading}>
              <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
            </Button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className={cn("w-full", variantClasses[variant], sizeClasses[size])}>
            {/* Header */}
            <thead className="bg-muted/50">
              <tr>
                {/* Selection column */}
                {selectable && (
                  <th className={cn("w-12", cellPaddingClasses[size])}>
                    <Checkbox;
                      checked={}
                        paginatedData.length > 0 && paginatedData.every((row, index) => isRowSelected(row, index))
                      }
                      onChange={toggleAllSelection}
                    />
                  </th>
                )}

                {/* Data columns */}
                {visibleColumns.map((column) => (
                  <th;
                    key={column.id}
                    className={cn(
                      cellPaddingClasses[size],
                      "font-medium text-left",
                      column.align === "center" && "text-center",
                      column.align === "right" && "text-right",
                      column.sortable && "cursor-pointer hover:bg-muted/75 transition-colors",
                      column.sticky === "left" && "sticky left-0 bg-muted/50 z-10",
                      column.sticky === "right" && "sticky right-0 bg-muted/50 z-10",
                    )}
                    style={{}
                      width: column.width,
                      minWidth: column.minWidth,
                      maxWidth: column.maxWidth,
                    }}
                    onClick={() => column.sortable && handleSort(column.id)}
                  >
                    <div className="flex items-center gap-2">
                      {column.header}
                      {column.sortable && renderSortIcon(column.id)}
                    </div>
                  </th>
                ))}

                {/* Actions column */}
                {actions.length > 0 && (
                  <th className={cn("w-12", cellPaddingClasses[size])}>
                    <span className="sr-only">Actions</span>
                  </th>
                )}
              </tr>
            </thead>

            {/* Body */}
            <tbody>
              {loading ? (
                <tr>
                  <td;
                    colSpan={visibleColumns.length + (selectable ? 1 : 0) + (actions.length > 0 ? 1 : 0)}
                    className={cn("text-center", cellPaddingClasses[size])}
                  >
                    <div className="flex items-center justify-center gap-2 py-8">
                      <Loader2 className="h-6 w-6 animate-spin" />
                      <span>Loading...</span>
                    </div>
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td;
                    colSpan={visibleColumns.length + (selectable ? 1 : 0) + (actions.length > 0 ? 1 : 0)}
                    className={cn("text-center text-destructive", cellPaddingClasses[size])}
                  >
                    <div className="py-8">Error: {error}</div>
                  </td>
                </tr>
              ) : paginatedData.length === 0 ? (
                <tr>
                  <td;
                    colSpan={visibleColumns.length + (selectable ? 1 : 0) + (actions.length > 0 ? 1 : 0)}
                    className={cn("text-center", cellPaddingClasses[size])}
                  >
                    <div className="py-8">
                      {emptyState || <div className="text-muted-foreground">No data available</div>}
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedData.map((row, index) => (
                  <tr;
                    key={getRowId(row, index)}
                    className={cn(
                      "border-t border-border transition-colors",
                      variant === "striped" && index % 2 === 1 && "bg-muted/25",
                      onRowClick && "cursor-pointer hover:bg-muted/50",
                      isRowSelected(row, index) && "bg-primary/10",
                      getRowClassName?.(row, index),
                    )}
                    onClick={() => onRowClick?.(row, index)}
                  >
                    {/* Selection cell */}
                    {selectable && (
                      <td className={cellPaddingClasses[size]}>
                        <Checkbox;
                          checked={isRowSelected(row, index)}
                          onChange={() => toggleRowSelection(row, index)}
                          onClick={(e) => e.stopPropagation()}
                        />
                      </td>
                    )}

                    {/* Data cells */}
                    {visibleColumns.map((column) => {}
                      const value = column.accessorKey ? row[column.accessorKey] : row;
                      return (
                        <td;
                          key={column.id}
                          className={cn(
                            cellPaddingClasses[size],
                            column.align === "center" && "text-center",
                            column.align === "right" && "text-right",
                            column.sticky === "left" && "sticky left-0 bg-background z-10",
                            column.sticky === "right" && "sticky right-0 bg-background z-10",
                          )}
                          style={{}
                            width: column.width,
                            minWidth: column.minWidth,
                            maxWidth: column.maxWidth,
                          }}
                        >
                          {column.cell ? column.cell({ row, value, index }) : String(value || "")}
                        </td>
                      )
                    })}

                    {/* Actions cell */}
                    {actions.length > 0 && (
                      <td className={cellPaddingClasses[size]}>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" onClick={(e) => e.stopPropagation()}>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {actions;
                              .filter((action) => !action.hidden?.(row))
                              .map((action) => (
                                <DropdownMenuItem;
                                  key={action.id}
                                  onClick={() => action.onClick(row, index)}
                                  disabled={action.disabled?.(row)}
                                  className={action.variant === "destructive" ? "text-destructive" : ""}
                                >
                                  {action.icon}
                                  {action.label}
                                </DropdownMenuItem>
                              ))}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {pagination && (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              Showing {startItem} to {endItem} of {totalItems} results;
            </span>

            {pagination.showSizeSelector && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Rows per page:</span>
                <Select;
                  value={pagination.pageSize.toString()}
                  onValueChange={(value) => handlePageSizeChange(Number(value))}
                >
                  <SelectTrigger className="w-20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {(pagination.pageSizeOptions || [10, 25, 50, 100]).map((size) => (
                      <SelectItem key={size} value={size.toString()}>
                        {size}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              Page {pagination.page} of {totalPages}
            </span>

            <div className="flex items-center gap-1">
              <Button variant="outline" size="sm" onClick={() => handlePageChange(1)} disabled={pagination.page === 1}>
                <ChevronsLeft className="h-4 w-4" />
              </Button>
              <Button;
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page === 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button;
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page === totalPages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button;
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(totalPages)}
                disabled={pagination.page === totalPages}
              >
                <ChevronsRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// Export default;
export default WatchPartyTable;