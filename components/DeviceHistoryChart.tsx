'use client'

import { useState, useEffect } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts'
import { DeviceData, DeviceHistoryResponse, DeviceHistoryDataPoint } from '@/types/device'
import { getDeviceConfig, formatDeviceValue } from '@/utils/deviceUtils'
import { deviceApi } from '@/lib/api'
import { Clock, TrendingUp, ZoomIn, RotateCcw } from 'lucide-react'

interface DeviceHistoryChartProps {
  device: DeviceData
}

interface ChartDataPoint {
  time: string
  timestamp: number
  value: number | null
  formattedTime: string
  formattedDate: string
  displayLabel: string
}

export default function DeviceHistoryChart({ device }: DeviceHistoryChartProps) {
  const [historyData, setHistoryData] = useState<DeviceHistoryResponse | null>(null)
  const [rawChartData, setRawChartData] = useState<ChartDataPoint[]>([])
  const [chartData, setChartData] = useState<ChartDataPoint[]>([])
  const [timeWindow, setTimeWindow] = useState(3) // Default 3 hours
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [isZoomed, setIsZoomed] = useState(false)
  const [zoomRange, setZoomRange] = useState<[number, number] | null>(null)
  const [isSelecting, setIsSelecting] = useState(false)
  const [selectionStart, setSelectionStart] = useState<number | null>(null)
  const [selectionEnd, setSelectionEnd] = useState<number | null>(null)
  const [isMobile, setIsMobile] = useState(false)
  const [lastTouchTime, setLastTouchTime] = useState(0)

  const config = getDeviceConfig(device.type)

  // Intelligent data downsampling based on time window and zoom level
  const downsampleData = (data: ChartDataPoint[], targetPoints: number): ChartDataPoint[] => {
    if (data.length <= targetPoints) return data.filter(point => 
      point.timestamp && !isNaN(point.timestamp) && point.formattedTime && point.formattedDate
    )

    const step = Math.max(1, Math.ceil(data.length / targetPoints))
    const downsampled: ChartDataPoint[] = []

    for (let i = 0; i < data.length; i += step) {
      // Use a sliding window to preserve important data characteristics
      const windowEnd = Math.min(i + step, data.length)
      const window = data.slice(i, windowEnd).filter(point => 
        point.timestamp && !isNaN(point.timestamp)
      )
      
      if (window.length === 0) continue
      
      // For continuous data, use average; for binary, use most recent
      if (config.values === 'continuous') {
        const validValues = window.filter(p => p.value !== null && !isNaN(p.value))
        if (validValues.length > 0) {
          const avgValue = validValues.reduce((sum, p) => sum + (p.value || 0), 0) / validValues.length
          const middlePoint = window[Math.floor(window.length / 2)]
          
          if (middlePoint && !isNaN(middlePoint.timestamp) && !isNaN(avgValue)) {
            const date = new Date(middlePoint.timestamp)
            const formattedTime = date.toLocaleTimeString('en-GB', {
              hour: '2-digit',
              minute: '2-digit',
              hour12: false
            })
            const formattedDate = date.toLocaleDateString('en-GB', {
              day: '2-digit',
              month: '2-digit'
            })
            
            downsampled.push({
              ...middlePoint,
              value: avgValue,
              formattedTime,
              formattedDate,
              displayLabel: `${formattedDate}\n${formattedTime}`
            })
          }
        }
      } else {
        // For binary data, use the most recent value in the window
        const latestPoint = window[window.length - 1]
        if (latestPoint && !isNaN(latestPoint.timestamp)) {
          const date = new Date(latestPoint.timestamp)
          const formattedTime = date.toLocaleTimeString('en-GB', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
          })
          const formattedDate = date.toLocaleDateString('en-GB', {
            day: '2-digit',
            month: '2-digit'
          })
          
          downsampled.push({
            ...latestPoint,
            formattedTime,
            formattedDate,
            displayLabel: `${formattedDate}\n${formattedTime}`
          })
        }
      }
    }

    return downsampled.filter(point => 
      point.timestamp && !isNaN(point.timestamp) && point.formattedTime && point.formattedDate
    )
  }

  // Get optimal number of data points based on time window
  const getOptimalPointCount = (hours: number, isZoomed: boolean): number => {
    if (isZoomed) return 500 // More detail when zoomed
    
    if (hours <= 3) return 200
    if (hours <= 6) return 150
    if (hours <= 12) return 120
    if (hours <= 24) return 100
    return 80 // For 48 hours, use minimal points
  }

  const fetchHistory = async (hours: number) => {
    if (!device.id) return

    setIsLoading(true)
    setError('')
    try {
      const response = await deviceApi.getDeviceHistory(device.id, hours)
      setHistoryData(response)
      
      // Process raw data with validation
      const processedData: ChartDataPoint[] = response.history
        .map(point => {
          const timestamp = new Date(point.time).getTime()
          const value = point.device_data ?? point.device_state ?? null
          const date = new Date(point.time)
          
          const formattedTime = date.toLocaleTimeString('en-GB', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
          })
          
          const formattedDate = date.toLocaleDateString('en-GB', {
            day: '2-digit',
            month: '2-digit'
          })
          
          return {
            time: point.time,
            timestamp,
            value,
            formattedTime,
            formattedDate,
            displayLabel: `${formattedDate}\n${formattedTime}`
          }
        })
        .filter(point => 
          // Filter out invalid data points
          point.timestamp && 
          !isNaN(point.timestamp) && 
          point.formattedTime &&
          point.formattedDate &&
          (point.value === null || !isNaN(point.value))
        )
        .sort((a, b) => a.timestamp - b.timestamp)

      // Store raw data only if we have valid data
      if (processedData.length > 0) {
        setRawChartData(processedData)
        
        // Apply intelligent downsampling
        const optimalPoints = getOptimalPointCount(hours, false)
        const downsampledData = downsampleData(processedData, optimalPoints)
        
        // Only set chart data if downsampling produced valid results
        if (downsampledData.length > 0) {
          setChartData(downsampledData)
        } else {
          setChartData([])
        }
      } else {
        setRawChartData([])
        setChartData([])
      }
      
      // Reset zoom when new data is loaded
      setIsZoomed(false)
      setZoomRange(null)
    } catch (err) {
      console.error('Failed to fetch device history:', err)
      setError('Failed to load historical data')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchHistory(timeWindow)
  }, [device.id, timeWindow])

  // Reset zoom when time window changes
  useEffect(() => {
    setIsZoomed(false)
    setZoomRange(null)
    setIsSelecting(false)
    setSelectionStart(null)
    setSelectionEnd(null)
  }, [timeWindow])

  // Detect mobile device
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768 || 'ontouchstart' in window)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])


  const handleTimeWindowChange = (hours: number) => {
    setTimeWindow(hours)
  }

  const handleSelectionStart = (e: any) => {
    if (!e || !e.activeLabel) return
    
    // Handle mobile double-tap for zoom
    if (isMobile) {
      const now = Date.now()
      if (now - lastTouchTime < 300) {
        // Double tap detected - zoom to last 25% of data
        const startIdx = Math.floor(chartData.length * 0.75)
        const endIdx = chartData.length - 1
        if (endIdx - startIdx >= 3) {
          zoomToRange(startIdx, endIdx)
        }
        setLastTouchTime(0)
        return
      }
      setLastTouchTime(now)
      return
    }
    
    setIsSelecting(true)
    const startIndex = chartData.findIndex(point => point.formattedTime === e.activeLabel)
    setSelectionStart(startIndex >= 0 ? startIndex : null)
    setSelectionEnd(null)
  }

  const handleSelectionMove = (e: any) => {
    if (!isSelecting || !e || !e.activeLabel || selectionStart === null) return
    
    const endIndex = chartData.findIndex(point => point.formattedTime === e.activeLabel)
    if (endIndex >= 0) {
      setSelectionEnd(endIndex)
    }
  }

  const handleSelectionEnd = () => {
    if (!isSelecting || selectionStart === null || selectionEnd === null) {
      setIsSelecting(false)
      setSelectionStart(null)
      setSelectionEnd(null)
      return
    }

    const startIdx = Math.min(selectionStart, selectionEnd)
    const endIdx = Math.max(selectionStart, selectionEnd)
    
    // Ensure we have a meaningful selection
    if (endIdx - startIdx >= 3) {
      zoomToRange(startIdx, endIdx)
    }
    
    setIsSelecting(false)
    setSelectionStart(null)
    setSelectionEnd(null)
  }

  // Mouse event handlers
  const handleMouseDown = (e: any) => {
    // Prevent text selection during drag
    if (e && e.preventDefault) {
      e.preventDefault()
    }
    handleSelectionStart(e)
  }
  const handleMouseMove = (e: any) => {
    // Prevent text selection during drag
    if (e && e.preventDefault && isSelecting) {
      e.preventDefault()
    }
    handleSelectionMove(e)
  }
  const handleMouseUp = () => {
    handleSelectionEnd()
  }

  // Mobile zoom button for alternative interaction
  const handleMobileZoom = () => {
    const startIdx = Math.floor(chartData.length * 0.75)
    const endIdx = chartData.length - 1
    if (endIdx - startIdx >= 3) {
      zoomToRange(startIdx, endIdx)
    }
  }

  const zoomToRange = (startIdx: number, endIdx: number) => {
    setIsZoomed(true)
    setZoomRange([startIdx, endIdx])
    
    // Get the time range from the current chart data
    const startTime = chartData[startIdx]?.timestamp
    const endTime = chartData[endIdx]?.timestamp
    
    if (startTime && endTime && rawChartData.length > 0 && 
        !isNaN(startTime) && !isNaN(endTime) && startTime < endTime) {
      // Filter raw data to the selected time range with padding
      const timeSpan = endTime - startTime
      const padding = Math.max(timeSpan * 0.02, 60000) // At least 1 minute padding
      
      const filteredRawData = rawChartData.filter(
        point => point.timestamp && 
                 !isNaN(point.timestamp) && 
                 point.timestamp >= (startTime - padding) && 
                 point.timestamp <= (endTime + padding)
      )
      
      if (filteredRawData.length >= 2) {
        // Apply appropriate downsampling for zoomed view
        const zoomedOptimalPoints = Math.min(300, Math.max(10, filteredRawData.length))
        const zoomedData = downsampleData(filteredRawData, zoomedOptimalPoints)
        
        // Validate the zoomed data before setting
        const validZoomedData = zoomedData.filter(point => 
          point.timestamp && 
          !isNaN(point.timestamp) && 
          point.formattedTime &&
          point.formattedDate &&
          (point.value === null || !isNaN(point.value))
        )
        
        if (validZoomedData.length >= 2) {
          setChartData(validZoomedData)
        } else {
          resetZoom()
        }
      } else {
        resetZoom()
      }
    } else {
      resetZoom()
    }
  }

  const resetZoom = () => {
    setIsZoomed(false)
    setZoomRange(null)
    setIsSelecting(false)
    setSelectionStart(null)
    setSelectionEnd(null)
    
    if (rawChartData.length > 0) {
      const optimalPoints = getOptimalPointCount(timeWindow, false)
      const downsampledData = downsampleData(rawChartData, optimalPoints)
      setChartData(downsampledData)
    }
  }

  const formatTooltipValue = (value: number | null) => {
    if (value === null) return 'No data'
    
    if (config.values === 'continuous') {
      return `${value.toFixed(config.round || 0)}${config.unit || ''}`
    } else if (config.values === 'binary' && config.valueMap) {
      const mappedValue = config.valueMap[value]
      return mappedValue ? mappedValue.text : `${value}`
    }
    return `${value}`
  }

  const getLineColor = () => {
    switch (config.category) {
      case 'environmental': return '#10B981' // Green
      case 'security': return '#EF4444' // Red  
      case 'control': return '#3B82F6' // Blue
      default: return '#8B5CF6' // Purple
    }
  }

  const timeWindowOptions = [
    { value: 1, label: '1 Hour' },
    { value: 3, label: '3 Hours' },
    { value: 6, label: '6 Hours' },
    { value: 12, label: '12 Hours' },
    { value: 24, label: '24 Hours' },
    { value: 48, label: '48 Hours' },
  ]

  if (error) {
    return (
      <div className="text-center py-8">
        <div className="text-red-400 mb-2">{error}</div>
        <button
          onClick={() => fetchHistory(timeWindow)}
          className="text-sm text-primary-400 hover:text-primary-300"
        >
          Try again
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Time Window Selector and Zoom Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-primary-400" />
          <span className="text-sm font-medium text-white">Historical Data</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-dark-400">Time Window:</span>
          <select
            value={timeWindow}
            onChange={(e) => handleTimeWindowChange(Number(e.target.value))}
            className="input-field !py-1 !px-2 text-xs"
            disabled={isLoading}
          >
            {timeWindowOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Chart */}
      <div 
        className="h-64 w-full select-none" 
        style={{ 
          userSelect: 'none', 
          WebkitUserSelect: 'none',
          MozUserSelect: 'none',
          msUserSelect: 'none'
        }}
      >
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="flex items-center gap-2 text-dark-400">
              <div className="animate-spin rounded-full h-5 w-5 border-b border-primary-500"></div>
              Loading historical data...
            </div>
          </div>
        ) : chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart 
              key={`chart-${timeWindow}`}
              data={chartData} 
              margin={{ top: 10, right: 10, left: 10, bottom: 30 }}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onClick={isMobile ? handleSelectionStart : undefined}
              style={{ userSelect: 'none' }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
              <XAxis 
                dataKey="formattedTime"
                stroke="#9CA3AF"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                interval="preserveStartEnd"
              />
              <YAxis 
                stroke="#9CA3AF"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => 
                  config.values === 'continuous' 
                    ? `${value}${config.unit || ''}` 
                    : `${value}`
                }
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1F2937',
                  border: '1px solid #374151',
                  borderRadius: '8px',
                  color: '#F9FAFB'
                }}
                labelStyle={{ color: '#9CA3AF' }}
                formatter={(value) => [formatTooltipValue(value as number | null), config.description]}
                labelFormatter={(label, payload) => {
                  if (payload && payload[0] && payload[0].payload) {
                    const data = payload[0].payload as ChartDataPoint
                    return `${data.formattedDate} at ${data.formattedTime}`
                  }
                  return `Time: ${label}`
                }}
                cursor={{
                  stroke: getLineColor(),
                  strokeWidth: 1,
                  strokeDasharray: '3 3'
                }}
                animationDuration={0}
              />
              <Line
                type="monotone"
                dataKey="value"
                stroke={getLineColor()}
                strokeWidth={2}
                dot={chartData.length <= 50 ? { fill: getLineColor(), strokeWidth: 0, r: 3 } : false}
                activeDot={{ r: 5, fill: getLineColor() }}
                connectNulls={false}
              />
              
              {/* Selection indicators */}
              {isSelecting && selectionStart !== null && (
                <ReferenceLine
                  x={chartData[selectionStart]?.formattedTime}
                  stroke={getLineColor()}
                  strokeWidth={2}
                  strokeDasharray="4 4"
                />
              )}
              {isSelecting && selectionEnd !== null && (
                <ReferenceLine
                  x={chartData[selectionEnd]?.formattedTime}
                  stroke={getLineColor()}
                  strokeWidth={2}
                  strokeDasharray="4 4"
                />
              )}
  
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-full text-dark-400">
            <div className="text-center">
              <Clock className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No historical data available</p>
              <p className="text-xs mt-1">Try selecting a different time window</p>
            </div>
          </div>
        )}
      </div>

      {/* Zoom Controls */}
      {isZoomed && (
        <div className="flex justify-center items-center gap-4 pb-2">
          <div className="flex items-center gap-1">
            <ZoomIn className="w-3 h-3 text-green-400" />
            <span className="text-xs text-green-400">Zoomed View</span>
          </div>
          <button
            onClick={resetZoom}
            className="px-3 py-1 bg-dark-700 hover:bg-dark-600 text-blue-400 hover:text-blue-300 text-xs rounded-md flex items-center gap-1 border border-dark-600"
          >
            <RotateCcw className="w-3 h-3" />
            Reset Zoom
          </button>
        </div>
      )}

      {/* Data Summary */}
      {chartData.length > 0 && (
        <div className="space-y-3 pt-4 border-t border-dark-700">
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-sm font-semibold text-white">
                {chartData.length}
              </div>
              <div className="text-xs text-dark-400">
                {isZoomed ? 'Zoomed Points' : 'Displayed Points'}
              </div>
            </div>
            <div className="text-center">
              <div className="text-sm font-semibold text-white">
                {formatTooltipValue(Math.max(...chartData.map(d => d.value || 0)))}
              </div>
              <div className="text-xs text-dark-400">Max Value</div>
            </div>
            <div className="text-center">
              <div className="text-sm font-semibold text-white">
                {formatTooltipValue(Math.min(...chartData.map(d => d.value || 0)))}
              </div>
              <div className="text-xs text-dark-400">Min Value</div>
            </div>
          </div>
          
                     {rawChartData.length > chartData.length && !isZoomed && (
             <div className="text-center">
               <div className="text-xs text-dark-400">
                 📊 Showing {chartData.length} of {rawChartData.length} total data points
                 <br />
                 <span className="text-blue-400">
                   {isMobile 
                     ? "Double-tap on chart to zoom to recent data or use zoom button below" 
                     : "Click and drag on the chart to select a time range for zooming"
                   }
                 </span>
               </div>
             </div>
           )}
           
           {/* Mobile zoom button */}
           {isMobile && !isZoomed && rawChartData.length > chartData.length && (
             <div className="text-center mt-2">
               <button
                 onClick={handleMobileZoom}
                 className="px-3 py-1 bg-primary-600 hover:bg-primary-700 text-white text-xs rounded-md flex items-center gap-1 mx-auto"
               >
                 <ZoomIn className="w-3 h-3" />
                 Zoom to Recent Data
               </button>
             </div>
           )}
          
          {isZoomed && (
            <div className="text-center">
              <div className="text-xs text-dark-400">
                🔍 Zoomed view showing detailed data
                <br />
                <span className="text-green-400">Higher resolution data in selected time range</span>
              </div>
            </div>
          )}
          
          {isSelecting && (
            <div className="text-center">
              <div className="text-xs text-blue-400">
                🎯 Selecting zoom range... Release to zoom in
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
} 