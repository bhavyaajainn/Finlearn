'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { generateChartData } from '@/lib/data'
import { Asset } from '@/lib/types'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Area,
  AreaChart,
} from 'recharts'

interface PriceChartProps {
  asset: Asset
  timeframe: '7d' | '30d' | '1y'
}

export function PriceChart({ asset, timeframe }: PriceChartProps) {
  const [chartData, setChartData] = useState<{ date: string; price: number }[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    setIsLoading(true)
    setTimeout(() => {
      setChartData(generateChartData(asset, timeframe))
      setIsLoading(false)
    }, 500)
  }, [asset, timeframe])

  if (isLoading) {
    return (
      <div className="h-64 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full"
        />
      </div>
    )
  }

  const minPrice = Math.min(...chartData.map((d) => d.price)) * 0.99
  const maxPrice = Math.max(...chartData.map((d) => d.price)) * 1.01

  const isPositive = chartData[0].price <= chartData[chartData.length - 1].price
  const gradientId = `${asset.ticker}-gradient`
  const lineColor = isPositive ? '#3b82f6' : '#ef4444'
  const fillColor = isPositive ? '#93c5fd' : '#fca5a5'

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData}>
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={fillColor} stopOpacity={0.3} />
              <stop offset="95%" stopColor={fillColor} stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis
            dataKey="date"
            tickFormatter={(value) => {
              const date = new Date(value)
              if (timeframe === '7d') return date.toLocaleDateString(undefined, { weekday: 'short' })
              if (timeframe === '30d') return date.toLocaleDateString(undefined, { day: 'numeric', month: 'short' })
              return date.toLocaleDateString(undefined, { month: 'short' })
            }}
            tick={{ fill: '#94a3b8', fontSize: 12 }}
          />
          <YAxis
            domain={[minPrice, maxPrice]}
            tickFormatter={(value) => `$${value.toFixed(2)}`}
            tick={{ fill: '#94a3b8', fontSize: 12 }}
          />
          <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.1} />
          <Tooltip
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const data = payload[0].payload
                return (
                  <div className="bg-gray-900 border border-gray-700 p-2 rounded shadow-lg">
                    <p className="text-xs text-gray-400">
                      {new Date(data.date).toLocaleDateString()}
                    </p>
                    <p className="text-sm font-medium">${data.price.toFixed(2)}</p>
                  </div>
                )
              }
              return null
            }}
          />
          <Area
            type="monotone"
            dataKey="price"
            stroke={lineColor}
            fill={`url(#${gradientId})`}
            strokeWidth={2}
            dot={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
