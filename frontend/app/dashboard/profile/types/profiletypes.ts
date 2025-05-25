export interface UserPreferences {
    expertise_level: string,
    categories: string[],
}

export interface Streak {
    current_streak: number;
    last_active: string;
    longest_streak: number;
    updated_at: string; 
    user_id: string;
  }
  