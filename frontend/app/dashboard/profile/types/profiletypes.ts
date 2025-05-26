export interface UserPreferences {
    expertise_level: string,
    categories: string[],
}
export interface Streak {
    current_streak: number
    longest_streak: number
    total_articles: number
}
export interface RawDay {
    date: string
    count: number
}

export interface HeatmapDay extends RawDay {
    week: number
    day: number
}

export interface HeatmapData {
    user_id: string
    year: number
    data: RawDay[]
}

export interface DailyCount {
    date: string // e.g. "Mon", "Tue"
    count: number
}

export interface DateRange {
    start: string // e.g. "2025-05-19"
    end: string   // e.g. "2025-05-25"
}

export interface CategoriesData {
    [category: string]: DailyCount[]
}

export interface UserProgressData {
    user_id: string
    period: 'week' | 'month'
    date_range: DateRange
    articles_data: DailyCount[]
    tooltips_data: DailyCount[]
    categories_data: CategoriesData
}