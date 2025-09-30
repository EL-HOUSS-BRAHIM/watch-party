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
      <div className="bg-white/5 border border-white/10 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4">{title}</h3>
        <div className="flex items-center justify-center h-48">
          <p className="text-white/60">No data available</p>
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
    <div className="bg-white/5 border border-white/10 rounded-lg p-6">
      <h3 className="text-lg font-semibold text-white mb-6">{title}</h3>
      
      <div className={`space-y-4 ${horizontal ? '' : 'flex items-end justify-between h-48'}`}>
        {data.map((item, index) => {
          const percentage = maxValue > 0 ? (item.value / maxValue) * 100 : 0
          const color = item.color || colors[index % colors.length]

          if (horizontal) {
            return (
              <div key={index} className="flex items-center gap-4">
                <div className="w-24 text-white/80 text-sm truncate">
                  {item.label}
                </div>
                <div className="flex-1 relative">
                  <div className="w-full bg-white/10 rounded-full h-6">
                    <div
                      className="h-6 rounded-full flex items-center justify-end pr-2 transition-all duration-500 ease-out"
                      style={{
                        backgroundColor: color,
                        width: `${percentage}%`,
                        minWidth: showValues && item.value > 0 ? '40px' : '0'
                      }}
                    >
                      {showValues && (
                        <span className="text-white text-xs font-medium">
                          {item.value.toLocaleString()}
                        </span>
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
                className="w-8 rounded-t transition-all duration-500 ease-out hover:opacity-80 relative"
                style={{
                  backgroundColor: color,
                  height: `${percentage}%`,
                  minHeight: item.value > 0 ? '4px' : '0'
                }}
              >
                {showValues && (
                  <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 text-white text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity bg-gray-900 px-2 py-1 rounded whitespace-nowrap">
                    {item.value.toLocaleString()}
                  </div>
                )}
              </div>
              <div className="text-white/60 text-xs mt-2 text-center max-w-16 truncate">
                {item.label}
              </div>
            </div>
          )
        })}
      </div>

      {/* Legend for horizontal bars */}
      {horizontal && data.length > 5 && (
        <div className="flex flex-wrap gap-4 mt-6 pt-4 border-t border-white/10">
          {data.map((item, index) => (
            <div key={index} className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded"
                style={{ backgroundColor: item.color || colors[index % colors.length] }}
              />
              <span className="text-white/80 text-sm">{item.label}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}