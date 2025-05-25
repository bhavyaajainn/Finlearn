export interface Asset {
    added_on: string; // ISO date string
    asset_type: "stock" | "crypto"; // or use string if dynamic
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