"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { generateChartData } from "@/lib/data";
import { Asset } from "@/lib/types";
import {
  Chart,
  ChartContainer,
  ChartTooltip,
  Line,
  LinearGradient,
  XAxis,
  YAxis,
} from "@/components/ui/chart";

interface PriceChartProps {
  asset: Asset;
  timeframe: "7d" | "30d" | "1y";
}

export function PriceChart({ asset, timeframe }: PriceChartProps) {
  const [chartData, setChartData] = useState<{ date: string; price: number }[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    // Simulate data loading
    setTimeout(() => {
      setChartData(generateChartData(asset, timeframe));
      setIsLoading(false);
    }, 500);
  }, [asset, timeframe]);

  if (isLoading) {
    return (
      <div className="h-64 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  const minPrice = Math.min(...chartData.map(d => d.price)) * 0.99;
  const maxPrice = Math.max(...chartData.map(d => d.price)) * 1.01;
  
  const isPositive = chartData[0].price <= chartData[chartData.length - 1].price;
  const gradientColor = isPositive ? "blue" : "red";
  const lineColor = isPositive ? "#3b82f6" : "#ef4444";

  return (
    <div className="h-64">
      <ChartContainer>
        <Chart data={chartData}>
          <LinearGradient
            id={`${asset.ticker}-gradient`}
            color={gradientColor}
            fromOpacity={0.2}
            toOpacity={0}
          />
          <XAxis
            tickCount={5}
            tickFormat={(value) => {
              const date = new Date(value);
              if (timeframe === "7d") {
                return date.toLocaleDateString(undefined, { weekday: 'short' });
              } else if (timeframe === "30d") {
                return date.toLocaleDateString(undefined, { day: 'numeric', month: 'short' });
              } else {
                return date.toLocaleDateString(undefined, { month: 'short' });
              }
            }}
          />
          <YAxis
            tickCount={5}
            tickFormat={(value) => `$${value.toFixed(2)}`}
            domain={[minPrice, maxPrice]}
          />
          <Line
            dataKey="price"
            stroke={lineColor}
            strokeWidth={2}
            fill={`url(#${asset.ticker}-gradient)`}
          />
          <ChartTooltip
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const data = payload[0].payload;
                return (
                  <div className="bg-gray-900 border border-gray-700 p-2 rounded shadow-lg">
                    <p className="text-xs text-gray-400">
                      {new Date(data.date).toLocaleDateString()}
                    </p>
                    <p className="text-sm font-medium">
                      ${data.price.toFixed(2)}
                    </p>
                  </div>
                );
              }
              return null;
            }}
          />
        </Chart>
      </ChartContainer>
    </div>
  );
}
