"use client"
import { ExternalLink } from "lucide-react"

// Mock news data
const mockNews = {
  "1": [
    // Apple
    {
      id: "1",
      title: "Apple Announces New iPhone 15 Pro with Revolutionary Camera System",
      source: "TechCrunch",
      date: "2023-09-12",
      summary:
        "Apple unveiled its latest flagship smartphone with a groundbreaking camera system that promises to deliver professional-grade photography capabilities.",
      url: "#",
      sentiment: "positive",
    },
    {
      id: "2",
      title: "Apple's Services Revenue Hits All-Time High in Q3 Earnings",
      source: "Bloomberg",
      date: "2023-08-03",
      summary:
        "Apple reported record-breaking services revenue in its third-quarter earnings, offsetting slower hardware sales and exceeding analyst expectations.",
      url: "#",
      sentiment: "positive",
    },
    {
      id: "3",
      title: "Apple Vision Pro: Mixed Reality Headset to Launch in Early 2024",
      source: "The Verge",
      date: "2023-07-18",
      summary:
        "Apple's highly anticipated mixed reality headset, the Vision Pro, is set to hit stores in early 2024 with a price tag of $3,499.",
      url: "#",
      sentiment: "neutral",
    },
    {
      id: "4",
      title: "Apple Faces Antitrust Scrutiny Over App Store Policies in EU",
      source: "Financial Times",
      date: "2023-06-27",
      summary:
        "European regulators have intensified their investigation into Apple's App Store practices, potentially leading to significant changes in how the company operates in the region.",
      url: "#",
      sentiment: "negative",
    },
  ],
  "2": [
    // Tesla
    {
      id: "1",
      title: "Tesla Cybertruck Production Ramps Up as Demand Surges",
      source: "Reuters",
      date: "2023-09-15",
      summary:
        "Tesla is accelerating production of its futuristic Cybertruck as customer reservations continue to climb, despite the vehicle's controversial design.",
      url: "#",
      sentiment: "positive",
    },
    {
      id: "2",
      title: "Tesla's Full Self-Driving Beta Expands to More Users",
      source: "Electrek",
      date: "2023-08-22",
      summary:
        "Tesla has expanded access to its Full Self-Driving Beta software to more customers, bringing advanced autonomous driving features to thousands of additional vehicles.",
      url: "#",
      sentiment: "positive",
    },
    {
      id: "3",
      title: "Tesla Q2 Earnings Miss Expectations as Margins Compress",
      source: "CNBC",
      date: "2023-07-19",
      summary:
        "Tesla reported second-quarter earnings below analyst estimates as automotive gross margins declined due to price cuts and increased competition in the EV market.",
      url: "#",
      sentiment: "negative",
    },
    {
      id: "4",
      title: "Elon Musk Announces AI Day 2023, Promising Major Robotics Breakthroughs",
      source: "TechCrunch",
      date: "2023-06-30",
      summary:
        "Tesla CEO Elon Musk has announced the date for Tesla AI Day 2023, where the company is expected to showcase advancements in its Optimus humanoid robot and AI technologies.",
      url: "#",
      sentiment: "neutral",
    },
  ],
  "3": [
    // Bitcoin
    {
      id: "1",
      title: "Bitcoin Surges Past $70,000, Setting New All-Time High",
      source: "CoinDesk",
      date: "2023-09-18",
      summary:
        "Bitcoin has broken through the $70,000 barrier for the first time, driven by institutional adoption and growing mainstream acceptance of cryptocurrencies.",
      url: "#",
      sentiment: "positive",
    },
    {
      id: "2",
      title: "Major Investment Bank Launches Bitcoin ETF for Institutional Clients",
      source: "Bloomberg",
      date: "2023-08-10",
      summary:
        "A leading global investment bank has introduced a Bitcoin exchange-traded fund (ETF) exclusively for its institutional clients, signaling growing acceptance in traditional finance.",
      url: "#",
      sentiment: "positive",
    },
    {
      id: "3",
      title: "Bitcoin Mining Difficulty Reaches Record High as Hash Rate Soars",
      source: "Decrypt",
      date: "2023-07-25",
      summary:
        "Bitcoin's mining difficulty has adjusted to an all-time high as the network's hash rate continues to climb, reflecting increased competition among miners despite energy concerns.",
      url: "#",
      sentiment: "neutral",
    },
    {
      id: "4",
      title: "Regulatory Concerns Grow as Countries Consider New Crypto Legislation",
      source: "Financial Times",
      date: "2023-06-15",
      summary:
        "Several major economies are drafting new cryptocurrency regulations that could impact Bitcoin's use and trading, creating uncertainty in the market.",
      url: "#",
      sentiment: "negative",
    },
  ],
  "4": [
    // Ethereum
    {
      id: "1",
      title: "Ethereum Completes Major Network Upgrade, Improving Scalability",
      source: "The Block",
      date: "2023-09-20",
      summary:
        "Ethereum has successfully implemented a significant network upgrade that enhances scalability and reduces transaction fees, addressing key concerns for users and developers.",
      url: "#",
      sentiment: "positive",
    },
    {
      id: "2",
      title: "Ethereum DeFi Ecosystem Surpasses $100 Billion in Total Value Locked",
      source: "DeFi Pulse",
      date: "2023-08-15",
      summary:
        "The total value locked in Ethereum-based decentralized finance protocols has exceeded $100 billion, highlighting the platform's dominance in the DeFi space.",
      url: "#",
      sentiment: "positive",
    },
    {
      id: "3",
      title: "Major Enterprise Adoption: Fortune 500 Companies Join Ethereum Enterprise Alliance",
      source: "CoinDesk",
      date: "2023-07-28",
      summary:
        "Several Fortune 500 companies have joined the Ethereum Enterprise Alliance, signaling growing corporate interest in blockchain technology for business applications.",
      url: "#",
      sentiment: "positive",
    },
    {
      id: "4",
      title: "Ethereum Gas Fees Spike Amid NFT Frenzy, Raising Usability Concerns",
      source: "Decrypt",
      date: "2023-06-22",
      summary:
        "A surge in NFT trading activity has caused Ethereum gas fees to rise significantly, reigniting debates about the network's accessibility for smaller transactions.",
      url: "#",
      sentiment: "negative",
    },
  ],
  "5": [
    // Microsoft
    {
      id: "1",
      title: "Microsoft's AI Integration Boosts Office 365 Productivity Features",
      source: "TechCrunch",
      date: "2023-09-22",
      summary:
        "Microsoft has rolled out new AI-powered features across its Office 365 suite, enhancing productivity tools with advanced automation and content generation capabilities.",
      url: "#",
      sentiment: "positive",
    },
    {
      id: "2",
      title: "Microsoft Azure Revenue Grows 30% Year-Over-Year in Latest Earnings",
      source: "CNBC",
      date: "2023-08-18",
      summary:
        "Microsoft reported strong cloud performance in its quarterly earnings, with Azure revenue increasing 30% compared to the same period last year, exceeding analyst expectations.",
      url: "#",
      sentiment: "positive",
    },
    {
      id: "3",
      title: "Microsoft Expands Gaming Portfolio with New Studio Acquisitions",
      source: "The Verge",
      date: "2023-07-30",
      summary:
        "Following its Activision Blizzard deal, Microsoft has announced the acquisition of additional gaming studios to bolster its Xbox Game Pass offering and exclusive content.",
      url: "#",
      sentiment: "positive",
    },
    {
      id: "4",
      title: "Microsoft Faces Security Scrutiny After Major Exchange Server Vulnerability",
      source: "Wired",
      date: "2023-06-25",
      summary:
        "A critical vulnerability discovered in Microsoft Exchange Server has raised concerns about the company's security practices as organizations rush to apply emergency patches.",
      url: "#",
      sentiment: "negative",
    },
  ],
}

export default function NewsSection({ assetId }: { assetId: string }) {
  const news = mockNews[assetId as keyof typeof mockNews] || []

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case "positive":
        return "border-l-green-500"
      case "negative":
        return "border-l-red-500"
      default:
        return "border-l-yellow-500"
    }
  }

  return (
    <div>
      <h3 className="text-xl font-semibold text-blue-400 mb-4">Latest News</h3>
      <div className="space-y-4">
        {news.length > 0 ? (
          news.map((item) => (
            <div
              key={item.id}
              className={`p-4 bg-gray-800/50 rounded-lg border-l-4 ${getSentimentColor(item.sentiment)} hover:bg-gray-800 transition-colors`}
            >
              <div className="flex justify-between items-start">
                <h3 className="font-semibold text-lg mb-1 text-white">{item.title}</h3>
                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:text-blue-300 ml-2"
                >
                  <ExternalLink className="h-4 w-4" />
                </a>
              </div>
              <div className="text-sm text-gray-400 mb-2">
                {item.source} • {new Date(item.date).toLocaleDateString()}
              </div>
              <p className="text-gray-300">{item.summary}</p>
            </div>
          ))
        ) : (
          <div className="text-center py-8 text-gray-400">No recent news available for this asset.</div>
        )}
      </div>
    </div>
  )
}
