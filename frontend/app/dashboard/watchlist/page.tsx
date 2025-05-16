import WatchlistTable from "./components/watchlist-table"
import SearchAssets from "./components/search-bar"
import AddAssetModal from "./components/add-asset-modal"

export default function Home() {
  return (
    <div className="min-h-screen bg-black text-white">
      <div className="container mx-auto py-8 px-4">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-blue-500 mb-2">WatchList</h1>
          <p className="text-gray-400">Track & Deep Dive Into What Matters</p>
        </header>

        <div className="mb-8">
          <SearchAssets />
        </div>

        <div className="bg-gray-900 rounded-lg p-6 shadow-lg">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-blue-400">Your Watchlist</h2>
            <AddAssetModal />
          </div>

          <WatchlistTable />
        </div>
      </div>
    </div>
  )
}
