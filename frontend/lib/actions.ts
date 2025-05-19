"use server"

export async function searchAssets(searchTerm: string, activeFilter: string) {
    // await new Promise((resolve) => setTimeout(resolve, 800))
    try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/watchlist/search`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(
                {
                    query: searchTerm,
                    asset_type: activeFilter,
                    limit: 10,
                }
            ),
        })


        if (!res.ok) throw new Error("Failed to fetch assets")

        const data = await res.json()
        console.log("search response ", data);
        return data.results;
    } catch (error) {
        console.error("Error searching assets:", error)
        return []
    }
}


export async function addToWatchlist(assetId: string) {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 500))

    // In a real app, this would add the asset to the user's watchlist in a database
    console.log(`Added asset ${assetId} to watchlist`)

    return { success: true, message: `Asset ${assetId} added to watchlist` }
}
