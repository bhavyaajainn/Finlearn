export interface Asset {
    name: string
    ticker: string
    type: "Stock" | "Crypto" | "ETF"
    price: number
    changePercent: number
    marketCap: number
    volume: number
    peRatio?: number
    dividendYield?: number
    circulatingSupply?: number
    allTimeHigh?: number
}

export interface News {
    title: string
    summary: string
    source: string
    date: string
    url: string
    imageUrl?: string
    tickers: string[]
}

export interface ChartDataPoint {
    date: string
    price: number
}
