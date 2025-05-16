"use client"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { CalendarDays, MapPin, Briefcase, Award, TrendingUp, Users } from "lucide-react"

// Mock management data
const mockManagement = {
  "1": {
    // Apple
    executives: [
      {
        name: "Tim Cook",
        position: "Chief Executive Officer",
        since: "2011",
        background: "Previously COO at Apple. Worked at Compaq and IBM.",
        imageUrl: "/placeholder.svg?height=100&width=100",
        achievements: [
          "Grew Apple to $2T+ valuation",
          "Expanded services business",
          "Navigated supply chain challenges",
        ],
      },
      {
        name: "Luca Maestri",
        position: "Chief Financial Officer",
        since: "2014",
        background: "Previously CFO at Xerox. Worked at Nokia Siemens Networks.",
        imageUrl: "/placeholder.svg?height=100&width=100",
        achievements: [
          "Managed record share buyback program",
          "Optimized tax structure",
          "Maintained strong balance sheet",
        ],
      },
      {
        name: "Craig Federighi",
        position: "SVP Software Engineering",
        since: "2012",
        background: "Rejoined Apple in 2009. Previously at NeXT and Apple.",
        imageUrl: "/placeholder.svg?height=100&width=100",
        achievements: [
          "Led iOS and macOS development",
          "Unified Apple's software platforms",
          "Enhanced privacy features",
        ],
      },
    ],
    companyInfo: {
      founded: "1976",
      headquarters: "Cupertino, California, USA",
      employees: "154,000+",
      governance: "Board of 8 directors with diverse backgrounds",
      keyInitiatives: ["Carbon neutrality by 2030", "Privacy-focused product design", "Services expansion"],
    },
  },
  "2": {
    // Tesla
    executives: [
      {
        name: "Elon Musk",
        position: "Chief Executive Officer",
        since: "2008",
        background: "Co-founder of PayPal, SpaceX, Neuralink, and The Boring Company.",
        imageUrl: "/placeholder.svg?height=100&width=100",
        achievements: [
          "Scaled Tesla to mass production",
          "Pioneered electric vehicle adoption",
          "Expanded into energy products",
        ],
      },
      {
        name: "Zachary Kirkhorn",
        position: "Chief Financial Officer",
        since: "2019",
        background: "Joined Tesla in 2010. Previously at McKinsey & Company.",
        imageUrl: "/placeholder.svg?height=100&width=100",
        achievements: ["Improved financial stability", "Managed capital for expansion", "Reduced production costs"],
      },
      {
        name: "Drew Baglino",
        position: "SVP Powertrain and Energy Engineering",
        since: "2019",
        background: "Joined Tesla in 2006. Mechanical engineering background.",
        imageUrl: "/placeholder.svg?height=100&width=100",
        achievements: ["Advanced battery technology", "Improved powertrain efficiency", "Scaled energy products"],
      },
    ],
    companyInfo: {
      founded: "2003",
      headquarters: "Austin, Texas, USA",
      employees: "110,000+",
      governance: "Board of 7 directors with close ties to CEO",
      keyInitiatives: ["Full Self-Driving development", "Battery production scaling", "Robotics (Optimus)"],
    },
  },
  "3": {
    // Bitcoin
    executives: [
      {
        name: "Satoshi Nakamoto",
        position: "Creator (Pseudonymous)",
        since: "2009",
        background: "Unknown. Created Bitcoin and authored the original whitepaper.",
        imageUrl: "/placeholder.svg?height=100&width=100",
        achievements: [
          "Created first successful cryptocurrency",
          "Solved double-spending problem",
          "Designed proof-of-work consensus",
        ],
      },
    ],
    companyInfo: {
      founded: "2009",
      headquarters: "Decentralized (No central location)",
      employees: "N/A (Open-source community)",
      governance: "Decentralized consensus through nodes and miners",
      keyInitiatives: ["Scaling solutions (Lightning Network)", "Privacy enhancements", "Institutional adoption"],
    },
  },
  "4": {
    // Ethereum
    executives: [
      {
        name: "Vitalik Buterin",
        position: "Co-Founder",
        since: "2015",
        background: "Programmer and writer. Co-founded Bitcoin Magazine.",
        imageUrl: "/placeholder.svg?height=100&width=100",
        achievements: [
          "Created Ethereum concept",
          "Led transition to Proof of Stake",
          "Advanced blockchain capabilities",
        ],
      },
      {
        name: "Joseph Lubin",
        position: "Co-Founder",
        since: "2015",
        background: "Founded ConsenSys. Previously at Goldman Sachs.",
        imageUrl: "/placeholder.svg?height=100&width=100",
        achievements: [
          "Built Ethereum ecosystem",
          "Expanded enterprise adoption",
          "Funded key infrastructure projects",
        ],
      },
    ],
    companyInfo: {
      founded: "2015",
      headquarters: "Decentralized (No central location)",
      employees: "N/A (Open-source community)",
      governance: "Ethereum Foundation and community governance",
      keyInitiatives: ["Scaling (Layer 2 solutions)", "Ethereum 2.0 implementation", "DeFi and NFT ecosystem growth"],
    },
  },
  "5": {
    // Microsoft
    executives: [
      {
        name: "Satya Nadella",
        position: "Chief Executive Officer",
        since: "2014",
        background: "Joined Microsoft in 1992. Previously led Cloud and Enterprise group.",
        imageUrl: "/placeholder.svg?height=100&width=100",
        achievements: [
          "Transformed Microsoft to cloud-first",
          "Revitalized company culture",
          "Executed strategic acquisitions",
        ],
      },
      {
        name: "Amy Hood",
        position: "Chief Financial Officer",
        since: "2013",
        background: "Joined Microsoft in 2002. Previously in investment banking at Goldman Sachs.",
        imageUrl: "/placeholder.svg?height=100&width=100",
        achievements: [
          "Managed capital allocation strategy",
          "Improved financial transparency",
          "Supported cloud transition",
        ],
      },
      {
        name: "Scott Guthrie",
        position: "EVP Cloud + AI Group",
        since: "2014",
        background: "Joined Microsoft in 1997. Led .NET platform development.",
        imageUrl: "/placeholder.svg?height=100&width=100",
        achievements: ["Scaled Azure cloud platform", "Advanced AI capabilities", "Expanded developer tools"],
      },
    ],
    companyInfo: {
      founded: "1975",
      headquarters: "Redmond, Washington, USA",
      employees: "181,000+",
      governance: "Board of 12 directors with diverse backgrounds",
      keyInitiatives: ["AI integration across products", "Carbon negative by 2030", "Hybrid work solutions"],
    },
  },
}

export default function ManagementOverview({ assetId }: { assetId: string }) {
  const managementData = mockManagement[assetId as keyof typeof mockManagement] || {
    executives: [],
    companyInfo: {
      founded: "",
      headquarters: "",
      employees: "",
      governance: "",
      keyInitiatives: [],
    },
  }

  const isCrypto = assetId === "3" || assetId === "4"

  return (
    <div>
      <h3 className="text-xl font-semibold text-blue-400 mb-6">
        {isCrypto ? "Project Overview" : "Management & Company Overview"}
      </h3>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className={`${isCrypto ? "lg:col-span-1" : "lg:col-span-2"}`}>
          <h3 className="text-lg font-semibold text-blue-400 mb-4">
            {isCrypto ? "Key Contributors" : "Executive Leadership"}
          </h3>

          <div className="space-y-6">
            {managementData.executives.map((executive, index) => (
              <div key={index} className="flex gap-4 bg-gray-800/50 p-4 rounded-lg hover:bg-gray-800 transition-colors">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={executive.imageUrl || "/placeholder.svg"} alt={executive.name} />
                  <AvatarFallback className="bg-blue-900 text-blue-200">
                    {executive.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1">
                  <h4 className="font-semibold text-lg text-white">{executive.name}</h4>
                  <div className="flex items-center gap-2 mb-2">
                    <Badge className="bg-blue-900 text-blue-200 hover:bg-blue-800">{executive.position}</Badge>
                    <span className="text-sm text-gray-400">Since {executive.since}</span>
                  </div>
                  <p className="text-gray-300 text-sm mb-2">{executive.background}</p>

                  <div className="mt-2">
                    <h5 className="text-sm font-medium text-gray-400 mb-1">Key Achievements:</h5>
                    <ul className="text-sm text-gray-300">
                      {executive.achievements.map((achievement, i) => (
                        <li key={i} className="flex items-start gap-2 mb-1">
                          <Award className="h-4 w-4 text-blue-400 mt-0.5 flex-shrink-0" />
                          <span>{achievement}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-1">
          <h3 className="text-lg font-semibold text-blue-400 mb-4">
            {isCrypto ? "Project Information" : "Company Information"}
          </h3>

          <div className="bg-gray-800/50 p-4 rounded-lg space-y-4">
            <div className="flex items-start gap-3">
              <CalendarDays className="h-5 w-5 text-blue-400 mt-0.5" />
              <div>
                <div className="text-sm text-gray-400">Founded</div>
                <div className="text-gray-300">{managementData.companyInfo.founded}</div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <MapPin className="h-5 w-5 text-blue-400 mt-0.5" />
              <div>
                <div className="text-sm text-gray-400">Headquarters</div>
                <div className="text-gray-300">{managementData.companyInfo.headquarters}</div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Users className="h-5 w-5 text-blue-400 mt-0.5" />
              <div>
                <div className="text-sm text-gray-400">{isCrypto ? "Community" : "Employees"}</div>
                <div className="text-gray-300">{managementData.companyInfo.employees}</div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Briefcase className="h-5 w-5 text-blue-400 mt-0.5" />
              <div>
                <div className="text-sm text-gray-400">Governance</div>
                <div className="text-gray-300">{managementData.companyInfo.governance}</div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <TrendingUp className="h-5 w-5 text-blue-400 mt-0.5" />
              <div>
                <div className="text-sm text-gray-400">Key Initiatives</div>
                <ul className="text-gray-300 list-disc list-inside">
                  {managementData.companyInfo.keyInitiatives.map((initiative, index) => (
                    <li key={index} className="ml-1">
                      {initiative}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
