"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Area,
  ResponsiveContainer,
} from "recharts";

// Mock price data
const generateMockPriceData = (days: number, startPrice: number, volatility: number) => {
  const data = [];
  let currentPrice = startPrice;
  const now = new Date();

  for (let i = days; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);

    const change = (Math.random() - 0.5) * volatility * currentPrice;
    currentPrice += change;

    data.push({
      date: date.toISOString().split("T")[0],
      price: Math.max(currentPrice, 0.01),
    });
  }

  return data;
};

const timeRanges = [
  { label: "7D", days: 7 },
  { label: "30D", days: 30 },
  { label: "3M", days: 90 },
  { label: "1Y", days: 365 },
  { label: "All", days: 1825 },
];

const assetPriceData = {
  "1": { startPrice: 150, volatility: 0.01 },
  "2": { startPrice: 200, volatility: 0.025 },
  "3": { startPrice: 50000, volatility: 0.03 },
  "4": { startPrice: 2500, volatility: 0.025 },
  "5": { startPrice: 350, volatility: 0.01 },
};

export default function PriceChart({ assetId }: { assetId: string }) {
  const [selectedRange, setSelectedRange] = useState(timeRanges[0]);

  const assetData = assetPriceData[assetId as keyof typeof assetPriceData] || {
    startPrice: 100,
    volatility: 0.015,
  };

  const chartData = generateMockPriceData(
    selectedRange.days,
    assetData.startPrice,
    assetData.volatility
  );

  const priceChange = chartData[chartData.length - 1].price - chartData[0].price;
  const priceChangePercent = (priceChange / chartData[0].price) * 100;
  const isPriceUp = priceChange >= 0;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: value < 1 ? 4 : 2,
      maximumFractionDigits: value < 1 ? 4 : 2,
    }).format(value);
  };

  return (
    <Card className="bg-gray-900 border-gray-800">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-blue-400">Price Chart</CardTitle>
          <div className="flex space-x-1">
            {timeRanges.map((range) => (
              <Button
                key={range.label}
                variant={selectedRange.label === range.label ? "default" : "outline"}
                size="sm"
                className={`${
                  selectedRange.label === range.label
                    ? "bg-blue-600 hover:bg-blue-700 text-white"
                    : "bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700"
                }`}
                onClick={() => setSelectedRange(range)}
              >
                {range.label}
              </Button>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2 mt-2">
          <span className="text-xl font-mono">
            {formatCurrency(chartData[chartData.length - 1].price)}
          </span>
          <span className={`${isPriceUp ? "text-green-500" : "text-red-500"}`}>
            {isPriceUp ? "+" : ""}
            {priceChangePercent.toFixed(2)}%
          </span>
          <span className="text-gray-400 text-sm">{selectedRange.label}</span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[350px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 10, right: 20, left: 20, bottom: 30 }}>
              <defs>
                <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="0%"
                    stopColor={isPriceUp ? "#22c55e" : "#ef4444"}
                    stopOpacity={0.6}
                  />
                  <stop
                    offset="100%"
                    stopColor={isPriceUp ? "#22c55e" : "#ef4444"}
                    stopOpacity={0}
                  />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="#374151" strokeDasharray="3 3" />
              <XAxis
                dataKey="date"
                tick={{ fill: "#9CA3AF", fontSize: 12 }}
                tickFormatter={(value) => {
                  const date = new Date(value);
                  return date.toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    ...(selectedRange.days > 90 ? { year: "2-digit" } : {}),
                  });
                }}
              />
              <YAxis
                domain={["dataMin", "dataMax"]}
                tickFormatter={(value) => formatCurrency(value)}
                tick={{ fill: "#9CA3AF", fontSize: 12 }}
              />
              <Tooltip
                contentStyle={{ backgroundColor: "#1F2937", border: "1px solid #374151" }}
                labelStyle={{ color: "#9CA3AF" }}
                formatter={(value) => formatCurrency(Number(value))}
                labelFormatter={(label) =>
                  new Date(label).toLocaleDateString("en-US", {
                    weekday: "short",
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })
                }
              />
              <Area
                type="monotone"
                dataKey="price"
                stroke="none"
                fill="url(#priceGradient)"
                opacity={0.4}
              />
              <Line
                type="monotone"
                dataKey="price"
                stroke={isPriceUp ? "#22c55e" : "#ef4444"}
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
