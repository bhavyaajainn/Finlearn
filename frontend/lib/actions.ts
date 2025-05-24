"use client";

import { UserPreferences } from "@/app/dashboard/profile/types/profiletypes";
import { toast } from "sonner";

// Utility for validating inputs
function isInvalidString(input: string | undefined | null): boolean {
    return !input || input.trim().length === 0;
}

export async function searchAssets(searchTerm: string, activeFilter: string) {
    if (isInvalidString(searchTerm) || isInvalidString(activeFilter)) {
        console.error("Validation Error: Missing searchTerm or activeFilter.");
        return [];
    }

    try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/watchlist/search`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                query: searchTerm.trim(),
                asset_type: activeFilter.trim(),
                limit: 10,
            }),
        });

        if (!res.ok) {
            const errorText = await res.text();
            throw new Error(`Server responded with status ${res.status}: ${errorText}`);
        }

        const data = await res.json();
        console.log("Search response:", data);
        return data.results;
    } catch (error: any) {
        console.error("Error searching assets:", error.message);
        return [];
    }
}

export async function addToWatchlist(
    symbol: string,
    asset_type: string,
    notes: string,
    userid: string | undefined
) {
    if (
        isInvalidString(symbol) ||
        isInvalidString(asset_type) ||
        isInvalidString(userid)
    ) {
        console.error("Validation Error: Missing required parameters.");
        return [];
    }

    try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/watchlist/add?user_id=${userid}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                symbol: symbol.trim(),
                asset_type: asset_type.trim(),
                notes: notes?.trim() || "",
            }),
        });

        if (!res.ok) {
            const errorText = await res.text();
            throw new Error(`Server responded with status ${res.status}: ${errorText}`);
        }

        const data = await res.json();
        console.log("Add to watchlist response:", data);

        return data;
    } catch (error: any) {
        console.error("Error adding to watchlist:", error.message);
        return [];
    }
}

export const fetchPreferences = async (userid: string) => {
    if (!userid) {
        toast("No user found.");
        return;
    }

    try {
        const res = await fetch(
            `${process.env.NEXT_PUBLIC_BASE_URL}/selectedcategories?user_id=${userid}`,
            {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                },
            }
        );

        if (!res.ok) {
            const errorData = await res.json().catch(() => ({}));
            throw new Error(errorData?.message || "Failed to fetch data.");
        }

        const data = await res.json();

        return data;

    } catch (error: any) {
        toast(error.message || "Something went wrong. Please try again.");
    }
};

export async function fetchstreak(userid: string) {

    if (!userid) {
        toast("No user found.");
        return;
    }

    try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/user/streak?user_id=${userid}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        });

        if (!res.ok) {
            const errorText = await res.text();
            throw new Error(`Server responded with status ${res.status}: ${errorText}`);
        }

        const data = await res.json();

        return data.streak;

    } catch (error: any) {
        console.error("Error searching assets:", error.message);
        return [];
    }
};

export const updatePreferences = async (userid: string, expertiseLevel: string, topics: string[], userdata: UserPreferences) => {
    if (!userid) {
        toast("No user found.");
        return;
    }

    if (topics.length == 0) {
        toast("No Topics Added");
    }

    try {
        const res = await fetch(
            `${process.env.NEXT_PUBLIC_BASE_URL}/selectedcategories?user_id=${userid}`,
            {
                method: "PUT",
                body: JSON.stringify({
                    expertise_level: expertiseLevel,
                    categories: topics.length === 0 ? userdata?.categories : topics,
                }),
                headers: {
                    "Content-Type": "application/json",
                },
            }
        );

        if (!res.ok) {
            const errorData = await res.json().catch(() => ({}));

            throw new Error(errorData?.message || "Failed to update data.", errorData);
        }

        const data = await res.json();

        return data

    } catch (error: any) {
        toast(error.message || "Something went wrong. Please try again.");
    }
};

export const fetchWatchlist = async (API_BASE_URL: string, userId: string) => {

    try {
        const response = await fetch(
            `${API_BASE_URL}/watchlist?user_id=${userId}&include_similar=false`
        );
        const data = await response.json();

        console.log("fetch watchlist",data);

        return data.watchlist;

    } catch (error) {
        console.error("Error fetching watchlist:", error);
        toast.error("Failed to fetch watchlist");
    }
};

