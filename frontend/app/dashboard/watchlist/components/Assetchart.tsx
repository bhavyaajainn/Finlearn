// "use client"

// import { useState } from "react"
// import { Button } from "@/components/ui/button"
// import { ChartContainer, ChartTooltip, ChartTooltipContent, Line, LineChart, XAxis, YAxis } from "@/components/ui/chart"

// // Mock data for the chart
// const generateChartData = (days: number, startPrice: number, volatility: number) => {
//   const data = []
//   let currentPrice = startPrice
//   const now = new Date()

//   for (let i = days; i >= 0; i--) {
//     const date = new Date(now)
//     date.setDate(date.getDate() - i)

//     // Random price movement with trend
//     const change = (Math.random() - 0.5) * volatility * currentPrice
//     currentPrice += change
//     if (currentPrice < 0) currentPrice = 0.01

//     data.push({
//       date: date.toISOString().split("T")[0],
//       price: currentPrice,
//     })
//   }

//   return data
// }

// interface AssetChartProps {
//   asset: {
//     price: number
//     type: string
//   }
// }

// export default function AssetChart({ asset }: AssetChartProps) {
//   const [timeframe, setTimeframe] = useState("7d")

//   // Generate different data based on timeframe
//   const chartData = (() => {
//     switch (timeframe) {
//       case "7d":
//         return generateChartData(7, asset.price, 0.02)
//       case "30d":
//         return generateChartData(30, asset.price, 0.03)
//       case "1y":
//         return generateChartData(365, asset.price, 0.05)
//       default:
//         return generateChartData(7, asset.price, 0.02)
//     }
//   })()

//   // Calculate min and max for y-axis
//   const prices = chartData.map((d) => d.price)
//   const minPrice = Math.min(...prices) * 0.95
//   const maxPrice = Math.max(...prices) * 1.05

//   return (
//     <div>
//       <div className="flex items-center justify-between mb-4">
//         <h3 className="font-medium">Price Chart</h3>
//         <div className="flex items-center space-x-2">
//           <Button variant={timeframe === "7d" ? "default" : "outline"} size="sm" onClick={() => setTimeframe("7d")}>
//             7D
//           </Button>
//           <Button variant={timeframe === "30d" ? "default" : "outline"} size="sm" onClick={() => setTimeframe("30d")}>
//             30D
//           </Button>
//           <Button variant={timeframe === "1y" ? "default" : "outline"} size="sm" onClick={() => setTimeframe("1y")}>
//             1Y
//           </Button>
//         </div>
//       </div>

//       <div className="h-[300px] w-full">
//         <ChartContainer>
//           <LineChart data={chartData}>
//             <XAxis dataKey="date" />
//             <YAxis
//               domain={[minPrice, maxPrice]}
//               tickFormatter={(value) =>
//                 asset.type === "crypto" && value > 1000
//                   ? `$${Math.round(value).toLocaleString()}`
//                   : `$${value.toFixed(2)}`
//               }
//             />
//             <Line
//               type="monotone"
//               dataKey="price"
//               stroke="#3b82f6"
//               strokeWidth={2}
//               dot={false}
//               activeDot={{ r: 6, fill: "#3b82f6" }}
//             />
//             <ChartTooltip>
//               <ChartTooltipContent
//                 className="bg-blue-950 border-blue-900"
//                 formatter={(value) => [
//                   asset.type === "crypto" && value > 1000
//                     ? `$${Math.round(Number(value)).toLocaleString()}`
//                     : `$${Number(value).toFixed(2)}`,
//                   "Price",
//                 ]}
//               />
//             </ChartTooltip>
//           </LineChart>
//         </ChartContainer>
//       </div>
//     </div>
//   )
// }
