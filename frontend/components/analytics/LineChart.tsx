"use client"

import { useState } from "react"
// useEffect available for future data loading features
// import { useEffect } from "react"

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
      <div className="rounded-3xl border border-brand-navy/10 bg-white/90 p-6 text-brand-navy shadow-[0_18px_45px_rgba(28,28,46,0.08)]">
        <h3 className="mb-4 text-lg font-semibold">{title}</h3>
        <div className="flex h-48 items-center justify-center text-brand-navy/60">
          No data available
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
    <div className="rounded-3xl border border-brand-navy/10 bg-white/95 p-6 text-brand-navy shadow-[0_18px_45px_rgba(28,28,46,0.08)]">
      <h3 className="mb-6 text-lg font-semibold">{title}</h3>

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
              stroke="rgba(28,28,46,0.08)"
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
            className="pointer-events-none absolute rounded-2xl border border-brand-navy/10 bg-white/95 px-3 py-2 text-xs font-semibold text-brand-navy shadow-[0_12px_30px_rgba(28,28,46,0.12)]"
            style={{
              left: `${getPointPosition(hoveredPoint, data[hoveredPoint].value).x}%`,
              top: `${getPointPosition(hoveredPoint, data[hoveredPoint].value).y}%`,
              transform: 'translate(-50%, -100%)',
              marginTop: '-8px'
            }}
          >
            <div className="font-medium">{data[hoveredPoint].value.toLocaleString()}</div>
            <div className="text-[11px] text-brand-navy/60">
              {data[hoveredPoint].date || data[hoveredPoint].label}
            </div>
          </div>
        )}
      </div>

      {/* X-axis labels */}
      <div className="mt-4 flex justify-between text-[11px] uppercase tracking-[0.3em] text-brand-navy/40">
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