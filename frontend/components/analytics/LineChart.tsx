"use client"

import { useState, useEffect } from "react"

interface ChartData {
  label: string
  value: number
  date?: string
}

interface LineChartProps {
  data: ChartData[]
  title: string
  color?: string
  height?: number
}

export default function LineChart({ 
  data, 
  title, 
  color = "#3b82f6", 
  height = 200 
}: LineChartProps) {
  const [hoveredPoint, setHoveredPoint] = useState<number | null>(null)

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
  const minValue = Math.min(...data.map(d => d.value))
  const range = maxValue - minValue || 1

  const getPointPosition = (index: number, value: number) => {
    const x = (index / (data.length - 1)) * 100
    const y = 100 - ((value - minValue) / range) * 100
    return { x, y }
  }

  const pathData = data.map((point, index) => {
    const pos = getPointPosition(index, point.value)
    return `${index === 0 ? 'M' : 'L'} ${pos.x} ${pos.y}`
  }).join(' ')

  return (
    <div className="bg-white/5 border border-white/10 rounded-lg p-6">
      <h3 className="text-lg font-semibold text-white mb-6">{title}</h3>
      
      <div className="relative" style={{ height: `${height}px` }}>
        <svg
          width="100%"
          height="100%"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          className="absolute inset-0"
        >
          {/* Grid lines */}
          {[0, 25, 50, 75, 100].map(y => (
            <line
              key={y}
              x1="0"
              y1={y}
              x2="100"
              y2={y}
              stroke="rgba(255,255,255,0.1)"
              strokeWidth="0.1"
            />
          ))}
          
          {/* Area under curve */}
          <path
            d={`${pathData} L 100 100 L 0 100 Z`}
            fill={`url(#gradient-${title.replace(/\s+/g, '-')})`}
            opacity="0.2"
          />
          
          {/* Line */}
          <path
            d={pathData}
            fill="none"
            stroke={color}
            strokeWidth="0.5"
            vectorEffect="non-scaling-stroke"
          />
          
          {/* Data points */}
          {data.map((point, index) => {
            const pos = getPointPosition(index, point.value)
            return (
              <circle
                key={index}
                cx={pos.x}
                cy={pos.y}
                r={hoveredPoint === index ? "1" : "0.5"}
                fill={color}
                className="transition-all duration-200 cursor-pointer"
                onMouseEnter={() => setHoveredPoint(index)}
                onMouseLeave={() => setHoveredPoint(null)}
              />
            )
          })}
          
          {/* Gradient definition */}
          <defs>
            <linearGradient
              id={`gradient-${title.replace(/\s+/g, '-')}`}
              x1="0%"
              y1="0%"
              x2="0%"
              y2="100%"
            >
              <stop offset="0%" stopColor={color} stopOpacity="0.4" />
              <stop offset="100%" stopColor={color} stopOpacity="0" />
            </linearGradient>
          </defs>
        </svg>

        {/* Hover tooltip */}
        {hoveredPoint !== null && (
          <div
            className="absolute bg-gray-900 border border-white/20 rounded-lg px-3 py-2 text-sm text-white z-10 pointer-events-none"
            style={{
              left: `${getPointPosition(hoveredPoint, data[hoveredPoint].value).x}%`,
              top: `${getPointPosition(hoveredPoint, data[hoveredPoint].value).y}%`,
              transform: 'translate(-50%, -100%)',
              marginTop: '-8px'
            }}
          >
            <div className="font-medium">{data[hoveredPoint].value.toLocaleString()}</div>
            <div className="text-white/60 text-xs">
              {data[hoveredPoint].date || data[hoveredPoint].label}
            </div>
          </div>
        )}
      </div>

      {/* X-axis labels */}
      <div className="flex justify-between mt-4 text-xs text-white/60">
        {data.map((point, index) => {
          if (index === 0 || index === data.length - 1 || index % Math.ceil(data.length / 4) === 0) {
            return (
              <span key={index}>
                {point.date ? new Date(point.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : point.label}
              </span>
            )
          }
          return null
        })}
      </div>
    </div>
  )
}