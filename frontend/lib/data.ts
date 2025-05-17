import type { Asset, News } from "./types"

export const mockAssets: Asset[] = [
  {
    name: "Apple Inc.",
    ticker: "AAPL",
    type: "Stock",
    price: 187.68,
    changePercent: 1.23,
    marketCap: 2950000000000,
    volume: 58900000000,
    peRatio: 31.2,
    dividendYield: 0.5,
  },
  {
    name: "Tesla, Inc.",
    ticker: "TSLA",
    type: "Stock",
    price: 237.49,
    changePercent: -2.15,
    marketCap: 755000000000,
    volume: 125000000000,
    peRatio: 84.3,
    dividendYield: 0,
  },
  {
    name: "Bitcoin",
    ticker: "BTC",
    type: "Crypto",
    price: 68423.12,
    changePercent: 2.87,
    marketCap: 1340000000000,
    volume: 42000000000,
    circulatingSupply: 19500000,
    allTimeHigh: 69000,
  },
  {
    name: "Ethereum",
    ticker: "ETH",
    type: "Crypto",
    price: 3452.78,
    changePercent: 1.56,
    marketCap: 415000000000,
    volume: 18700000000,
    circulatingSupply: 120000000,
    allTimeHigh: 4800,
  },
  {
    name: "Vanguard S&P 500 ETF",
    ticker: "VOO",
    type: "ETF",
    price: 456.32,
    changePercent: 0.87,
    marketCap: 325000000000,
    volume: 5600000000,
  },
]

export const mockNews: News[] = [
  {
    title: "Apple's AI Strategy Unveiled at WWDC",
    summary: "Apple revealed its comprehensive AI strategy at WWDC, focusing on on-device processing and privacy.",
    source: "TechCrunch",
    date: "2 hours ago",
    url: "#",
    imageUrl: "/placeholder.svg?height=80&width=80",
    tickers: ["AAPL"],
  },
  {
    title: "Tesla Announces New Battery Technology",
    summary: "Tesla unveiled a new battery technology that could increase range by 30% and reduce costs.",
    source: "Reuters",
    date: "5 hours ago",
    url: "#",
    imageUrl: "/placeholder.svg?height=80&width=80",
    tickers: ["TSLA"],
  },
  {
    title: "Bitcoin Surges Past $68,000 as Institutional Adoption Grows",
    summary: "Bitcoin reached a new high as more financial institutions announce cryptocurrency investments.",
    source: "Bloomberg",
    date: "1 day ago",
    url: "#",
    tickers: ["BTC"],
  },
  {
    title: "Ethereum Completes Major Network Upgrade",
    summary: "Ethereum successfully implemented its latest upgrade, improving scalability and reducing gas fees.",
    source: "CoinDesk",
    date: "2 days ago",
    url: "#",
    imageUrl: "/placeholder.svg?height=80&width=80",
    tickers: ["ETH"],
  },
  {
    title: "Market Rally Continues as Tech Stocks Lead Gains",
    summary: "Major indices reached new highs with technology stocks leading the market rally.",
    source: "CNBC",
    date: "3 days ago",
    url: "#",
    tickers: ["AAPL", "TSLA", "VOO"],
  },
]

export function searchAssets(query: string): Asset[] {
  const lowerQuery = query.toLowerCase()
  return mockAssets.filter(
    (asset) => asset.name.toLowerCase().includes(lowerQuery) || asset.ticker.toLowerCase().includes(lowerQuery),
  )
}

export function generateChartData(asset: Asset, timeframe: "7d" | "30d" | "1y") {
  const data = []
  const now = new Date()
  const volatility = asset.type === "Crypto" ? 0.05 : 0.02
  let days = 0

  switch (timeframe) {
    case "7d":
      days = 7
      break
    case "30d":
      days = 30
      break
    case "1y":
      days = 365
      break
  }

  let currentPrice = asset.price
  const trend = Math.random() > 0.5 ? 1 : -1

  for (let i = days; i >= 0; i--) {
    const date = new Date()
    date.setDate(now.getDate() - i)

    // Add some randomness to the price, with a slight trend
    const randomChange = (Math.random() - 0.5) * volatility * currentPrice
    const trendChange = trend * Math.random() * 0.01 * currentPrice * (1 - i / days)

    if (i !== 0) {
      currentPrice = currentPrice - randomChange - trendChange
      if (currentPrice <= 0) currentPrice = asset.price * 0.1 // Prevent negative prices
    } else {
      currentPrice = asset.price // Ensure the last price matches the current price
    }

    data.push({
      date: date.toISOString(),
      price: currentPrice,
    })
  }

  return data
}

export const expertiseLevels = [
  { label: "Beginner", value: "beginner" },
  { label: "Intermediate", value: "intermediate" },
  { label: "Advanced", value: "advanced" },
];

export const topicOptions = [
  { label: "Stocks", value: "stocks" },
  { label: "Cryptocurrencies", value: "cryptocurrencies" },
  { label: "Forex", value: "forex" },
  { label: "Commodities", value: "commodities" },
  { label: "Bonds", value: "bonds" },
  { label: "ETFs", value: "etfs" },
  { label: "Real Estate", value: "real_estate" },
  { label: "Retirement", value: "retirement" }
];