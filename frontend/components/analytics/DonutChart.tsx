"use client"

interface DonutChartData {
  label: string
  value: number
  color?: string
}

interface DonutChartProps {
  data: DonutChartData[]
  title: string
  centerLabel?: string
  centerValue?: string | number
}

export default function DonutChart({ 
  data, 
  title, 
  centerLabel,
  centerValue 
}: DonutChartProps) {
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

  const total = data.reduce((sum, item) => sum + item.value, 0)
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

  let cumulativePercentage = 0

  return (
    <div className="bg-white/5 border border-white/10 rounded-lg p-6">
      <h3 className="text-lg font-semibold text-white mb-6">{title}</h3>
      
      <div className="flex items-center justify-between">
        {/* Chart */}
        <div className="relative w-48 h-48">
          <svg width="192" height="192" viewBox="0 0 192 192" className="transform -rotate-90">
            {data.map((item, index) => {
              const percentage = total > 0 ? (item.value / total) * 100 : 0
              const strokeDasharray = `${percentage * 4.71} 471`
              const strokeDashoffset = -cumulativePercentage * 4.71
              const color = item.color || colors[index % colors.length]
              
              cumulativePercentage += percentage
              
              return (
                <circle
                  key={index}
                  cx="96"
                  cy="96"
                  r="75"
                  fill="transparent"
                  stroke={color}
                  strokeWidth="20"
                  strokeDasharray={strokeDasharray}
                  strokeDashoffset={strokeDashoffset}
                  className="transition-all duration-500 hover:stroke-opacity-80"
                />
              )
            })}
          </svg>
          
          {/* Center content */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            {centerValue && (
              <div className="text-2xl font-bold text-white">
                {centerValue}
              </div>
            )}
            {centerLabel && (
              <div className="text-white/60 text-sm">
                {centerLabel}
              </div>
            )}
          </div>
        </div>

        {/* Legend */}
        <div className="flex-1 ml-8 space-y-3">
          {data.map((item, index) => {
            const percentage = total > 0 ? (item.value / total) * 100 : 0
            const color = item.color || colors[index % colors.length]
            
            return (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="w-4 h-4 rounded"
                    style={{ backgroundColor: color }}
                  />
                  <span className="text-white/80 text-sm">{item.label}</span>
                </div>
                <div className="text-right">
                  <div className="text-white font-medium">
                    {item.value.toLocaleString()}
                  </div>
                  <div className="text-white/60 text-xs">
                    {percentage.toFixed(1)}%
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Summary */}
      <div className="mt-6 pt-4 border-t border-white/10 text-center">
        <div className="text-white/60 text-sm">
          Total: <span className="text-white font-medium">{total.toLocaleString()}</span>
        </div>
      </div>
    </div>
  )
}