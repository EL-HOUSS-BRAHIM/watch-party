"use client"

import { useState, useEffect } from "react"
import { adminApi, SystemStats, ServerHealth } from "@/lib/api-client"

interface SystemManagementProps {
  onBack: () => void
}

export default function SystemManagement({ onBack }: SystemManagementProps) {
  const [stats, setStats] = useState<SystemStats | null>(null)
  const [health, setHealth] = useState<ServerHealth | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<"overview" | "settings" | "logs" | "maintenance">("overview")

  useEffect(() => {
    loadSystemData()
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(loadSystemData, 30000)
    return () => clearInterval(interval)
  }, [])

  const loadSystemData = async () => {
    try {
      const [statsResponse, healthResponse] = await Promise.all([
        adminApi.getSystemStats(),
        adminApi.getServerHealth()
      ])
      
      setStats(statsResponse)
      setHealth(healthResponse)
    } catch (error) {
      console.error("Failed to load system data:", error)
    } finally {
      setLoading(false)
    }
  }

  const restartService = async (service: string) => {
    if (!confirm(`Are you sure you want to restart ${service}? This may cause temporary downtime.`)) {
      return
    }

    try {
      await adminApi.restartService(service)
      alert(`${service} restart initiated. Please wait a moment and check the status.`)
      setTimeout(loadSystemData, 5000) // Refresh after 5 seconds
    } catch (error) {
      alert("Failed to restart service: " + (error instanceof Error ? error.message : "Unknown error"))
    }
  }

  const clearCache = async () => {
    if (!confirm("Are you sure you want to clear all caches? This may temporarily slow down the system.")) {
      return
    }

    try {
      await adminApi.clearCache()
      alert("Cache cleared successfully.")
    } catch (error) {
      alert("Failed to clear cache: " + (error instanceof Error ? error.message : "Unknown error"))
    }
  }

  const getHealthStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "healthy": return "text-green-400"
      case "warning": return "text-yellow-400"
      case "critical": return "text-red-400"
      default: return "text-white/60"
    }
  }

  const getHealthStatusBg = (status: string) => {
    switch (status?.toLowerCase()) {
      case "healthy": return "bg-green-500/20"
      case "warning": return "bg-yellow-500/20"
      case "critical": return "bg-red-500/20"
      default: return "bg-white/10"
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-white/60">Loading system data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="text-white/60 hover:text-white transition-colors"
          >
            ←
          </button>
          <div>
            <h2 className="text-2xl font-bold text-white">System Management</h2>
            <p className="text-white/60">Monitor and manage system health</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className={`px-3 py-1 rounded-full text-sm font-medium ${
            getHealthStatusBg(health?.overall_status || "unknown")
          } ${getHealthStatusColor(health?.overall_status || "unknown")}`}>
            System: {health?.overall_status?.toUpperCase() || "UNKNOWN"}
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white/5 border border-white/10 rounded-lg p-1">
        <div className="flex">
          {[
            { id: "overview", label: "Overview", icon: "📊" },
            { id: "settings", label: "Settings", icon: "⚙️" },
            { id: "logs", label: "System Logs", icon: "📋" },
            { id: "maintenance", label: "Maintenance", icon: "🔧" }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium rounded transition-colors ${
                activeTab === tab.id
                  ? "bg-blue-600 text-white"
                  : "text-white/60 hover:text-white hover:bg-white/10"
              }`}
            >
              <span>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          {/* System Health Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white/5 border border-white/10 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-medium text-white">CPU Usage</h3>
                <span className="text-2xl">🖥️</span>
              </div>
              <div className="mb-2">
                <div className="flex justify-between text-sm">
                  <span className="text-white/60">Current</span>
                  <span className="text-white">{stats?.cpu_usage || 0}%</span>
                </div>
                <div className="w-full bg-white/10 rounded-full h-2 mt-1">
                  <div 
                    className={`h-2 rounded-full ${
                      (stats?.cpu_usage || 0) > 80 ? "bg-red-600" :
                      (stats?.cpu_usage || 0) > 60 ? "bg-yellow-600" : "bg-green-600"
                    }`}
                    style={{ width: `${stats?.cpu_usage || 0}%` }}
                  ></div>
                </div>
              </div>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-medium text-white">Memory Usage</h3>
                <span className="text-2xl">💾</span>
              </div>
              <div className="mb-2">
                <div className="flex justify-between text-sm">
                  <span className="text-white/60">Current</span>
                  <span className="text-white">{stats?.memory_usage || 0}%</span>
                </div>
                <div className="w-full bg-white/10 rounded-full h-2 mt-1">
                  <div 
                    className={`h-2 rounded-full ${
                      (stats?.memory_usage || 0) > 80 ? "bg-red-600" :
                      (stats?.memory_usage || 0) > 60 ? "bg-yellow-600" : "bg-green-600"
                    }`}
                    style={{ width: `${stats?.memory_usage || 0}%` }}
                  ></div>
                </div>
              </div>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-medium text-white">Storage Usage</h3>
                <span className="text-2xl">💿</span>
              </div>
              <div className="mb-2">
                <div className="flex justify-between text-sm">
                  <span className="text-white/60">Current</span>
                  <span className="text-white">{stats?.storage_usage || 0}%</span>
                </div>
                <div className="w-full bg-white/10 rounded-full h-2 mt-1">
                  <div 
                    className={`h-2 rounded-full ${
                      (stats?.storage_usage || 0) > 80 ? "bg-red-600" :
                      (stats?.storage_usage || 0) > 60 ? "bg-yellow-600" : "bg-green-600"
                    }`}
                    style={{ width: `${stats?.storage_usage || 0}%` }}
                  ></div>
                </div>
              </div>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-medium text-white">Active Users</h3>
                <span className="text-2xl">👥</span>
              </div>
              <div className="text-2xl font-bold text-white mb-1">
                {stats?.active_connections || 0}
              </div>
              <div className="text-sm text-white/60">
                Currently online
              </div>
            </div>
          </div>

          {/* Service Status */}
          <div className="bg-white/5 border border-white/10 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-white mb-6">Service Status</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {health?.services?.map((service: any) => (
                <div key={service.name} className="bg-white/5 border border-white/10 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-white">{service.name}</h4>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      getHealthStatusBg(service.status)
                    } ${getHealthStatusColor(service.status)}`}>
                      {service.status?.toUpperCase()}
                    </span>
                  </div>
                  
                  <div className="text-sm text-white/60 mb-3">
                    Response Time: {service.response_time || "N/A"}ms
                  </div>
                  
                  <button
                    onClick={() => restartService(service.name)}
                    className="w-full px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm transition-colors"
                  >
                    Restart Service
                  </button>
                </div>
              )) || (
                <div className="col-span-full text-center py-8">
                  <p className="text-white/60">No service data available</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === "maintenance" && (
        <div className="space-y-6">
          <div className="bg-white/5 border border-white/10 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-white mb-6">System Maintenance</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h4 className="font-medium text-white">Cache Management</h4>
                
                <div className="bg-white/5 border border-white/10 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h5 className="font-medium text-white">Application Cache</h5>
                      <p className="text-white/60 text-sm">Clear all cached data</p>
                    </div>
                    <button
                      onClick={clearCache}
                      className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded text-sm transition-colors"
                    >
                      Clear Cache
                    </button>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-medium text-white">Database Operations</h4>
                
                <div className="bg-white/5 border border-white/10 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h5 className="font-medium text-white">Database Backup</h5>
                      <p className="text-white/60 text-sm">Create system backup</p>
                    </div>
                    <button
                      onClick={() => alert("Backup feature coming soon")}
                      className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded text-sm transition-colors"
                    >
                      Backup Now
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
              <h4 className="font-medium text-red-400 mb-2">⚠️ Danger Zone</h4>
              <p className="text-red-400/80 text-sm mb-4">
                These actions can significantly impact the system. Use with extreme caution.
              </p>
              
              <div className="flex gap-3">
                <button
                  onClick={() => alert("System restart feature coming soon")}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded text-sm transition-colors"
                >
                  Restart System
                </button>
                <button
                  onClick={() => alert("Maintenance mode feature coming soon")}
                  className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded text-sm transition-colors"
                >
                  Enable Maintenance Mode
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Other tabs placeholder */}
      {(activeTab === "settings" || activeTab === "logs") && (
        <div className="bg-white/5 border border-white/10 rounded-lg p-8 text-center">
          <div className="text-6xl mb-4">🚧</div>
          <h3 className="text-xl font-semibold text-white mb-2">
            {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Management
          </h3>
          <p className="text-white/60 mb-6">
            This section is under development. Advanced {activeTab} management tools will be available here.
          </p>
          <button
            onClick={() => setActiveTab("overview")}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
          >
            Back to Overview
          </button>
        </div>
      )}
    </div>
  )
}