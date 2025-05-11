"use client"

import type React from "react"

import { ResponsiveContainer, LineChart, Tooltip } from "recharts"

interface ChartProps {
  data: any[]
  children: React.ReactNode
}

export function ChartContainer({ data, children }: ChartProps) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      {children}
    </ResponsiveContainer>
  )
}

interface ChartComponentProps {
  data: any[]
}

export function Chart({ data, children }: ChartComponentProps) {
  return <LineChart data={data}>{children}</LineChart>
}

interface LinearGradientProps {
  id: string
  color: string
  fromOpacity: number
  toOpacity: number
}

export function LinearGradient({ id, color, fromOpacity, toOpacity }: LinearGradientProps) {
  return (
    <defs>
      <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
        <stop offset="5%" stopColor={`var(--${color}-500)`} stopOpacity={fromOpacity} />
        <stop offset="95%" stopColor={`var(--${color}-500)`} stopOpacity={toOpacity} />
      </linearGradient>
    </defs>
  )
}

interface LineProps {
  dataKey: string
  stroke: string
  strokeWidth: number
  fill: string
}

export function Line({ dataKey, stroke, strokeWidth, fill }: LineProps) {
  return <Line type="monotone" dataKey={dataKey} stroke={stroke} strokeWidth={strokeWidth} fill={fill} dot={false} />
}

interface XAxisProps {
  dataKey?: string
  tickFormatter?: (value: any) => string
  tickCount?: number
  tickFormat?: (value: any) => string
}

export function XAxis({ tickFormatter, tickCount, tickFormat }: XAxisProps) {
  return (
    <XAxis
      dataKey="date"
      tickFormatter={tickFormatter}
      tickCount={tickCount}
      tick={{ fill: "var(--gray-400)", fontSize: "0.75rem" }}
      stroke="var(--gray-800)"
      style={{ fontSize: "0.75rem" }}
      tickFormat={tickFormat}
    />
  )
}

interface YAxisProps {
  tickFormatter?: (value: number) => string
  domain?: number[]
  tickCount?: number
}

export function YAxis({ tickFormatter, domain, tickCount }: YAxisProps) {
  return (
    <YAxis
      tickFormatter={tickFormatter}
      domain={domain}
      tickCount={tickCount}
      tick={{ fill: "var(--gray-400)", fontSize: "0.75rem" }}
      stroke="var(--gray-800)"
      style={{ fontSize: "0.75rem" }}
    />
  )
}

interface ChartTooltipProps {
  content: ({ active, payload }: { active: boolean; payload: any[] }) => React.ReactNode
}

export function ChartTooltip({ content }: ChartTooltipProps) {
  return <Tooltip content={content} />
}
