export interface Asset {
    added_on: string;
    asset_type: "stock" | "crypto";
    currency: string;
    current_price: number;
    exchange: string;
    industry: string;
    market_cap: number;
    name: string;
    notes: string;
    price_change: number;
    price_change_percent: number;
    sector: string;
    symbol: string;
}

export interface AssetData {
    asset_type: "cryptocurrency" | "stock" | string;
    symbol: string;
    name?: string;
    description?: string;
    current_price?: number | null;
    change_percent?: number | null;
    market_cap?: number | null;
    volume?: number | null;
    data_source?: string;
    match_reason?: string;
}

export interface WatchlistAsset {
    symbol: string;
    name: string;
    asset_type: string;
    current_price: number;
    price_change_percent: number;
}

export interface AssetInfo {
    name: string
    current_price: number
    price_change_percent: number
    symbol: string
    asset_type: string
}

export interface TooltipWord {
    word: string
    tooltip: string
}

export interface Section {
    title: string
    content: string
}

export interface Recommendation {
    time_horizon: string
    risk_level: string
    reasoning: string
    action: string
}

export interface NewsImpact {
    reason: string
    direction: 'positive' | 'negative' | 'neutral'
}

export interface NewsItem {
    author: string | null
    citation: string
    date: string
    headline: string
    impact: NewsImpact
    source: string
    summary: string
    url: string
}

export interface ResearchAssetData {
    symbol: string
    name: string
    asset_type: string
    current_price: number
    price_change_percent: number
    expertise_level: string
    loading_status: {
        asset_loaded: boolean
        analysis_loaded: boolean
        related_loaded: boolean
    }
    asset_info: AssetInfo
    from_cache: boolean
    recent_news: NewsItem[]
    similar_assets: any[] 
    title: string
    summary: string
    sections: Section[]
    references: string[]
    recommendation: Recommendation
    generated_at: string
    format: string
    conclusion: string
    tooltip_words: TooltipWord[]
    watchlist_relevance: string
}
