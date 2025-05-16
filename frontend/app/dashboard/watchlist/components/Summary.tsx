"use client"
import { ExternalLink, BookOpen, AlertTriangle, TrendingUp, Lightbulb } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

// Mock AI summary data
const mockSummaries = {
  "1": {
    // Apple
    fundamentals:
      "Apple continues to demonstrate strong financial performance with revenue diversification beyond hardware into services. The company maintains industry-leading margins and a robust balance sheet with significant cash reserves. Recent product cycles have shown healthy demand, particularly in the premium segments. Services revenue growth remains a key strength, with an expanding ecosystem of subscription offerings.",
    recentDevelopments:
      "Apple's latest product launches include the iPhone 15 series with USB-C adoption and enhanced camera capabilities. The Vision Pro mixed reality headset represents a new product category with potential long-term growth implications. The company continues to expand its silicon strategy with the M3 chip series, further differentiating its hardware performance. Regulatory challenges regarding App Store policies remain a concern in multiple jurisdictions.",
    outlook:
      "Apple's near-term outlook appears stable with steady iPhone demand and growing services revenue. The company's expansion into new markets like India presents growth opportunities. Potential headwinds include macroeconomic pressures affecting consumer spending, increasing competition in key product categories, and ongoing regulatory scrutiny. Long-term growth may depend on successful entry into new product categories and continued services expansion.",
    citations: [
      {
        title: "Apple Q3 2023 Earnings Report",
        source: "Apple Investor Relations",
        url: "#",
      },
      {
        title: "iPhone 15 Pro Review: Subtle Refinements to a Winning Formula",
        source: "The Verge",
        url: "#",
      },
      {
        title: "Apple's Services Strategy: The Next $100 Billion Business",
        source: "Bloomberg",
        url: "#",
      },
    ],
  },
  "2": {
    // Tesla
    fundamentals:
      "Tesla maintains its position as the leading electric vehicle manufacturer globally, though with increasing competition. The company has improved its production efficiency and gross margins, despite recent price adjustments. Tesla's energy business, including solar and storage solutions, represents a smaller but growing segment. The company's balance sheet has strengthened considerably, with substantial cash reserves and reduced debt.",
    recentDevelopments:
      "Tesla has begun Cybertruck deliveries, marking entry into the pickup truck market with a distinctive offering. The company continues to expand manufacturing capacity with new gigafactories and production lines. Full Self-Driving (FSD) technology remains in beta with gradual feature improvements, though regulatory approval for full autonomy remains distant. Recent price adjustments across the vehicle lineup have impacted margins but supported volume growth.",
    outlook:
      "Tesla faces a more competitive landscape as traditional automakers accelerate their EV transitions. The company's growth trajectory depends on successful scaling of new models like the Cybertruck and potential mass-market vehicles. Energy storage business shows promise for diversification. Key risks include production ramp challenges, regulatory hurdles for autonomous driving, and potential demand softening in a higher interest rate environment.",
    citations: [
      {
        title: "Tesla Q2 2023 Vehicle Production & Deliveries Report",
        source: "Tesla Investor Relations",
        url: "#",
      },
      {
        title: "Cybertruck Production Challenges and Market Potential",
        source: "Reuters",
        url: "#",
      },
      {
        title: "The State of Tesla's Full Self-Driving Technology",
        source: "Electrek",
        url: "#",
      },
    ],
  },
  "3": {
    // Bitcoin
    fundamentals:
      "Bitcoin maintains its position as the largest cryptocurrency by market capitalization, with its fixed supply of 21 million coins serving as a core value proposition. Network security remains robust with substantial hash rate growth. Bitcoin's correlation with traditional risk assets has fluctuated but remains significant. Institutional adoption continues to grow through various investment vehicles and corporate treasury allocations.",
    recentDevelopments:
      "Bitcoin has experienced significant price appreciation following the approval of spot Bitcoin ETFs in the United States, marking a milestone for mainstream accessibility. The network underwent its fourth halving event, reducing mining rewards and potentially impacting long-term supply dynamics. Lightning Network capacity continues to grow, addressing scaling limitations of the base layer. Regulatory clarity has improved in some jurisdictions while remaining uncertain in others.",
    outlook:
      "Bitcoin's near-term price action may be influenced by broader macroeconomic conditions, particularly central bank policies and inflation trends. Institutional adoption through ETFs and corporate treasuries could provide sustained demand. Regulatory developments remain a key variable across global markets. Long-term outlook depends on Bitcoin's evolution as a store of value, medium of exchange, and its position within the broader digital asset ecosystem.",
    citations: [
      {
        title: "Bitcoin: Digital Gold in the Age of Inflation",
        source: "CoinDesk Research",
        url: "#",
      },
      {
        title: "Impact of Spot Bitcoin ETFs on Market Dynamics",
        source: "Bloomberg",
        url: "#",
      },
      {
        title: "Bitcoin Halving Cycle Analysis: Historical Patterns and Future Projections",
        source: "Glassnode",
        url: "#",
      },
    ],
  },
  "4": {
    // Ethereum
    fundamentals:
      "Ethereum remains the leading smart contract platform with the largest developer ecosystem and decentralized application (dApp) usage. The network's transition to Proof of Stake has significantly reduced energy consumption and altered the tokenomics with a deflationary mechanism through transaction fee burning. Ethereum's DeFi and NFT ecosystems represent substantial portions of total value in these sectors despite competition from alternative Layer 1 blockchains.",
    recentDevelopments:
      "Ethereum has successfully implemented several network upgrades following the Merge, improving scalability and reducing transaction costs. Layer 2 scaling solutions like Optimism and Arbitrum have gained significant adoption, addressing base layer congestion. EIP-4844 (Proto-Danksharding) represents a significant upcoming upgrade to further improve scalability. The network continues to see development toward the full Ethereum 2.0 roadmap with sharding as a longer-term goal.",
    outlook:
      "Ethereum's competitive position faces challenges from alternative Layer 1 blockchains offering lower fees and different design tradeoffs. The success of Layer 2 scaling solutions will be crucial for retaining activity on the Ethereum ecosystem. Regulatory attention on DeFi and staking presents both challenges and opportunities for clarity. Long-term growth depends on successful technical execution of the scaling roadmap and continued developer adoption.",
    citations: [
      {
        title: "The State of Ethereum Q3 2023",
        source: "Messari Research",
        url: "#",
      },
      {
        title: "Layer 2 Scaling Solutions: Adoption Metrics and Comparison",
        source: "L2Beat",
        url: "#",
      },
      {
        title: "EIP-4844: Impact on Ethereum Scalability and Gas Fees",
        source: "Ethereum Foundation",
        url: "#",
      },
    ],
  },
  "5": {
    // Microsoft
    fundamentals:
      "Microsoft maintains a diversified business model across cloud services, software, and hardware with strong recurring revenue streams. Azure cloud services continue to show robust growth, competing effectively with AWS for market leadership. The company's enterprise software suite, including Microsoft 365 and Dynamics, provides stable cash flow with high margins. Gaming represents a growing segment following strategic acquisitions.",
    recentDevelopments:
      "Microsoft has significantly expanded its AI capabilities, integrating OpenAI's technology across its product suite as Microsoft Copilot. The acquisition of Activision Blizzard strengthens the company's gaming portfolio and Game Pass subscription service. Azure's AI infrastructure investments position the company competitively in the growing AI computing market. The company continues to benefit from enterprise digital transformation trends accelerated by remote and hybrid work adoption.",
    outlook:
      "Microsoft's near-term growth outlook remains strong, driven by cloud services and AI integration across its product portfolio. The company is well-positioned to monetize AI capabilities through existing enterprise relationships. Potential headwinds include cloud growth normalization, regulatory scrutiny of acquisitions and market position, and macroeconomic pressures affecting enterprise IT spending. Long-term growth depends on successful AI monetization and maintaining competitiveness in cloud infrastructure.",
    citations: [
      {
        title: "Microsoft FY23 Q4 Earnings Report",
        source: "Microsoft Investor Relations",
        url: "#",
      },
      {
        title: "Microsoft Copilot: AI Integration Across the Product Suite",
        source: "The Verge",
        url: "#",
      },
      {
        title: "Cloud Infrastructure Market Share Analysis Q2 2023",
        source: "Canalys Research",
        url: "#",
      },
    ],
  },
}

export default function PerplexitySummary({ assetId }: { assetId: string }) {
  const summaryData = mockSummaries[assetId as keyof typeof mockSummaries] || {
    fundamentals: "",
    recentDevelopments: "",
    outlook: "",
    citations: [],
  }

  return (
    <div>
      <h3 className="text-xl font-semibold text-blue-400 flex items-center gap-2 mb-6">
        <BookOpen className="h-5 w-5" />
        Perplexity AI-Powered Summary
      </h3>

      <Tabs defaultValue="fundamentals" className="w-full">
        <TabsList className="bg-gray-800 w-full justify-start mb-6 p-1 rounded-lg">
          <TabsTrigger
            value="fundamentals"
            className="data-[state=active]:bg-blue-600 data-[state=active]:text-white rounded-md text-gray-400"
          >
            <TrendingUp className="mr-2 h-4 w-4" />
            Fundamentals
          </TabsTrigger>
          <TabsTrigger
            value="developments"
            className="data-[state=active]:bg-blue-600 data-[state=active]:text-white rounded-md text-gray-400"
          >
            <AlertTriangle className="mr-2 h-4 w-4" />
            Recent Developments
          </TabsTrigger>
          <TabsTrigger
            value="outlook"
            className="data-[state=active]:bg-blue-600 data-[state=active]:text-white rounded-md text-gray-400"
          >
            <Lightbulb className="mr-2 h-4 w-4" />
            Outlook
          </TabsTrigger>
        </TabsList>

        <TabsContent value="fundamentals" className="mt-0">
          <div className="bg-gray-800/50 p-6 rounded-lg mb-4">
            <p className="text-gray-300 leading-relaxed">{summaryData.fundamentals}</p>
          </div>
        </TabsContent>

        <TabsContent value="developments" className="mt-0">
          <div className="bg-gray-800/50 p-6 rounded-lg mb-4">
            <p className="text-gray-300 leading-relaxed">{summaryData.recentDevelopments}</p>
          </div>
        </TabsContent>

        <TabsContent value="outlook" className="mt-0">
          <div className="bg-gray-800/50 p-6 rounded-lg mb-4">
            <p className="text-gray-300 leading-relaxed">{summaryData.outlook}</p>
          </div>
        </TabsContent>
      </Tabs>

      <div className="mt-8">
        <h3 className="text-lg font-semibold text-blue-400 mb-3">Sources & Citations</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {summaryData.citations.map((citation, index) => (
            <div
              key={index}
              className="flex items-start gap-2 bg-gray-800/50 p-4 rounded-lg hover:bg-gray-800 transition-colors"
            >
              <ExternalLink className="h-4 w-4 text-blue-400 mt-1 flex-shrink-0" />
              <div>
                <a
                  href={citation.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-blue-400 hover:text-blue-300"
                >
                  {citation.title}
                </a>
                <div className="text-sm text-gray-400">{citation.source}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
