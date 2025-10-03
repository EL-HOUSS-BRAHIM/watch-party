"use client"

interface BarChartData {
  label: string
  value: number
  color?: string
}

interface BarChartProps {
  data: BarChartData[]
  title: string
  horizontal?: boolean
  showValues?: boolean
}

export default function BarChart({ 
  data, 
  title, 
  horizontal = false, 
  showValues = true 
}: BarChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="rounded-3xl border border-brand-navy/10 bg-white/90 p-6 text-brand-navy shadow-[0_18px_45px_rgba(28,28,46,0.08)]">
        <h3 className="mb-4 text-lg font-semibold">{title}</h3>
        <div className="flex h-48 items-center justify-center text-brand-navy/60">
          No data available
        </div>
      </div>
    )
  }

  const maxValue = Math.max(...data.map(d => d.value))
  const colors = [
    "#3b82f6", // blue
    "#10b981", // green
    "#8b5cf6", // purple
    "#f59e0b", // yellow
    "#ef4444", // red
    "#06b6d4", // cyan
    "#84cc16", // lime
    "#f97316", // orange
  ]

  return (
    <div className="rounded-3xl border border-brand-navy/10 bg-white/95 p-6 text-brand-navy shadow-[0_18px_45px_rgba(28,28,46,0.08)]">
      <h3 className="mb-6 text-lg font-semibold">{title}</h3>

      <div className={`space-y-4 ${horizontal ? '' : 'flex h-48 items-end justify-between'}`}>
        {data.map((item, index) => {
          const percentage = maxValue > 0 ? (item.value / maxValue) * 100 : 0
          const color = item.color || colors[index % colors.length]

          if (horizontal) {
            return (
              <div key={index} className="flex items-center gap-4">
                <div className="w-28 truncate text-sm font-medium text-brand-navy/70">
                  {item.label}
                </div>
                <div className="flex-1 relative">
                  <div className="h-6 w-full rounded-full border border-brand-navy/10 bg-brand-neutral">
                    <div
                      className="flex h-6 items-center justify-end rounded-full pr-3 text-[11px] font-semibold uppercase tracking-[0.25em] text-white transition-all duration-500 ease-out"
                      style={{
                        backgroundColor: color,
                        width: `${percentage}%`,
                        minWidth: showValues && item.value > 0 ? '40px' : '0'
                      }}
                    >
                      {showValues && (
                        <span>{item.value.toLocaleString()}</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )
          }

          return (
            <div key={index} className="flex flex-col items-center group">
              <div
                className="relative w-10 rounded-t-full transition-all duration-500 ease-out hover:opacity-90"
                style={{
                  backgroundColor: color,
                  height: `${percentage}%`,
                  minHeight: item.value > 0 ? '4px' : '0'
                }}
              >
                {showValues && (
                  <div className="absolute -top-9 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full border border-brand-navy/10 bg-white/95 px-3 py-1 text-xs font-semibold text-brand-navy opacity-0 shadow-[0_12px_30px_rgba(28,28,46,0.12)] transition-opacity group-hover:opacity-100">
                    {item.value.toLocaleString()}
                  </div>
                )}
              </div>
              <div className="mt-2 max-w-20 truncate text-center text-xs font-semibold uppercase tracking-[0.3em] text-brand-navy/50">
                {item.label}
              </div>
            </div>
          )
        })}
      </div>

      {/* Legend for horizontal bars */}
      {horizontal && data.length > 5 && (
        <div className="mt-6 flex flex-wrap gap-4 border-t border-brand-navy/10 pt-4">
          {data.map((item, index) => (
            <div key={index} className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded"
                style={{ backgroundColor: item.color || colors[index % colors.length] }}
              />
              <span className="text-sm font-medium text-brand-navy/70">{item.label}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}