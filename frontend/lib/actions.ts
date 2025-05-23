"use client";

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
