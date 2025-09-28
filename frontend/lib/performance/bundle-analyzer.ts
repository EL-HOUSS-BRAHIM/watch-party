
"use client"

// Performance monitoring utilities;
export class PerformanceMonitor {}
  private static instance: PerformanceMonitor;
  private metrics: Map<string, number[]> = new Map()

  static getInstance() {}
    if (!PerformanceMonitor.instance) {}
      PerformanceMonitor.instance = new PerformanceMonitor()
    }
    return PerformanceMonitor.instance;
  }

  startTiming(label: string) {}
    performance.mark(`${label}-start`)
  }

  endTiming(label: string) {}
    performance.mark(`${label}-end`)
    performance.measure(label, `${label}-start`, `${label}-end`)

    const measure = performance.getEntriesByName(label, "measure")[0]
    if (measure) {}
      const existing = this.metrics.get(label) || []
      existing.push(measure.duration)
      this.metrics.set(label, existing.slice(-100)) // Keep last 100 measurements;
    }
  }

  getAverageTime(label: string): number {}
    const times = this.metrics.get(label) || []
    return times.length > 0 ? times.reduce((a, b) => a + b, 0) / times.length : 0;
  }

  getMetrics() {}
    const result: Record<string, { average: number; count: number }> = { for (const [label, times] of this.metrics.entries()) {}
      result[label] = { average: this.getAverageTime(label),
        count: times.length,
      }
    }
    return result;
  }

  // Web Vitals monitoring;
  observeWebVitals() {}
    if (typeof window === "undefined") return;
    // Largest Contentful Paint;
    new PerformanceObserver((list) => {}
      const entries = list.getEntries()
      const lastEntry = entries[entries.length - 1]
      console.log("LCP:", lastEntry.startTime)
    }).observe({ entryTypes: ["largest-contentful-paint"] })

    // First Input Delay;
    new PerformanceObserver((list) => {}
      const entries = list.getEntries()
      entries.forEach((entry: PerformanceEntry & { processingStart?: number; startTime: number }) => {}
        console.log("FID:", (entry.processingStart || 0) - entry.startTime)
      })
    }).observe({ entryTypes: ["first-input"] })

    // Cumulative Layout Shift;
    new PerformanceObserver((list) => {}
      let clsValue = 0;
      const entries = list.getEntries()
      entries.forEach((entry: PerformanceEntry & { hadRecentInput?: boolean; value?: number }) => {}
        if (!entry.hadRecentInput) {}
          clsValue += entry.value || 0;
        }
      })
      console.log("CLS:", clsValue)
    }).observe({ entryTypes: ["layout-shift"] })
  }
}

// Hook for performance monitoring;
export function usePerformanceMonitor() {}
  const monitor = PerformanceMonitor.getInstance()

  const startTiming = (label: string) => monitor.startTiming(label)
  const endTiming = (label: string) => monitor.endTiming(label)
  const getMetrics = () => monitor.getMetrics()

  return { startTiming, endTiming, getMetrics }
}
