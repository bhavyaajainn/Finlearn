"use client"

import { Users, Building, Calendar, Award, Briefcase } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

// Mock management data
const generateManagementData = (asset: { name: string; ticker: string; type: string }) => {
  if (asset.type === "stock") {
    return {
      ceo: {
        name: "John Smith",
        title: "Chief Executive Officer",
        since: "2015",
        background: "Former CTO at Tech Innovations, MBA from Stanford",
        image: "/placeholder.svg?height=100&width=100",
      },
      executives: [
        {
          name: "Sarah Johnson",
          title: "Chief Financial Officer",
          since: "2018",
          background: "20+ years in finance, previously at Goldman Sachs",
          image: "/placeholder.svg?height=100&width=100",
        },
        {
          name: "Michael Chen",
          title: "Chief Technology Officer",
          since: "2019",
          background: "PhD in Computer Science, led R&D at Future Tech",
          image: "/placeholder.svg?height=100&width=100",
        },
        {
          name: "Lisa Rodriguez",
          title: "Chief Operating Officer",
          since: "2017",
          background: "Operations expert, streamlined global supply chain",
          image: "/placeholder.svg?height=100&width=100",
        },
      ],
      company: {
        founded: "1985",
        headquarters: "Cupertino, CA",
        employees: "150,000+",
        industry: "Technology",
        keyProducts: ["Product A", "Product B", "Product C"],
      },
    }
  } else if (asset.type === "crypto") {
    return {
      founder: {
        name: "Alex Nakamoto",
        title: "Founder",
        since: "2017",
        background: "Cryptography expert, previously at Security Systems Inc.",
        image: "/placeholder.svg?height=100&width=100",
      },
      team: [
        {
          name: "Elena Vitalik",
          title: "Lead Developer",
          since: "2018",
          background: "Blockchain architect, contributed to multiple protocols",
          image: "/placeholder.svg?height=100&width=100",
        },
        {
          name: "David Buterin",
          title: "Head of Research",
          since: "2019",
          background: "PhD in Distributed Systems, academic background",
          image: "/placeholder.svg?height=100&width=100",
        },
      ],
      project: {
        launched: "2017",
        governance: "Decentralized Autonomous Organization",
        nodes: "10,000+",
        consensus: "Proof of Stake",
        keyFeatures: ["Smart Contracts", "DeFi Integration", "Cross-chain Compatibility"],
      },
    }
  } else {
    // ETF
    return {
      manager: {
        name: "Robert Williams",
        title: "Fund Manager",
        since: "2012",
        background: "25+ years in asset management, CFA charterholder",
        image: "/placeholder.svg?height=100&width=100",
      },
      team: [
        {
          name: "Patricia Lee",
          title: "Senior Portfolio Manager",
          since: "2015",
          background: "Former hedge fund analyst, expertise in sector allocation",
          image: "/placeholder.svg?height=100&width=100",
        },
      ],
      fund: {
        established: "2010",
        assets: "$45 billion",
        holdings: "500+",
        strategy: "Passive Index Tracking",
        topHoldings: ["Company A", "Company B", "Company C", "Company D", "Company E"],
      },
    }
  }
}

interface AssetManagementProps {
  asset: {
    name: string
    ticker: string
    type: string
  }
}

export default function AssetManagement({ asset }: AssetManagementProps) {
  const managementData = generateManagementData(asset)

  return (
    <div>
      <h3 className="font-medium mb-4">
        {asset.type === "stock" ? "Company Management" : asset.type === "crypto" ? "Project Team" : "Fund Management"}
      </h3>

      <div className="space-y-6">
        {/* Leadership Section */}
        <div className="border border-blue-900/20 rounded-lg p-4">
          {asset.type === "stock" && managementData.ceo && (
            <div className="flex items-start space-x-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={managementData.ceo.image || "/placeholder.svg"} alt={managementData.ceo.name} />
                <AvatarFallback>{managementData.ceo.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div>
                <h4 className="font-medium">{managementData.ceo.name}</h4>
                <p className="text-sm text-blue-500">{managementData.ceo.title}</p>
                <div className="flex items-center text-sm text-muted-foreground mt-1">
                  <Calendar className="h-3 w-3 mr-1" />
                  <span>Since {managementData.ceo.since}</span>
                </div>
                <p className="text-sm mt-2">{managementData.ceo.background}</p>
              </div>
            </div>
          )}

          {asset.type === "crypto" && managementData.founder && (
            <div className="flex items-start space-x-4">
              <Avatar className="h-16 w-16">
                <AvatarImage
                  src={managementData.founder.image || "/placeholder.svg"}
                  alt={managementData.founder.name}
                />
                <AvatarFallback>{managementData.founder.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div>
                <h4 className="font-medium">{managementData.founder.name}</h4>
                <p className="text-sm text-blue-500">{managementData.founder.title}</p>
                <div className="flex items-center text-sm text-muted-foreground mt-1">
                  <Calendar className="h-3 w-3 mr-1" />
                  <span>Since {managementData.founder.since}</span>
                </div>
                <p className="text-sm mt-2">{managementData.founder.background}</p>
              </div>
            </div>
          )}

          {asset.type === "etf" && managementData.manager && (
            <div className="flex items-start space-x-4">
              <Avatar className="h-16 w-16">
                <AvatarImage
                  src={managementData.manager.image || "/placeholder.svg"}
                  alt={managementData.manager.name}
                />
                <AvatarFallback>{managementData.manager.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div>
                <h4 className="font-medium">{managementData.manager.name}</h4>
                <p className="text-sm text-blue-500">{managementData.manager.title}</p>
                <div className="flex items-center text-sm text-muted-foreground mt-1">
                  <Calendar className="h-3 w-3 mr-1" />
                  <span>Since {managementData.manager.since}</span>
                </div>
                <p className="text-sm mt-2">{managementData.manager.background}</p>
              </div>
            </div>
          )}
        </div>

        {/* Team Section */}
        <div>
          <h4 className="font-medium text-sm mb-3">
            {asset.type === "stock" ? "Executive Team" : asset.type === "crypto" ? "Core Team" : "Management Team"}
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(asset.type === "stock"
              ? managementData.executives
              : asset.type === "crypto"
                ? managementData.team
                : managementData.team
            )?.map((member, index) => (
              <div key={index} className="border border-blue-900/20 rounded-lg p-3 flex items-center space-x-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={member.image || "/placeholder.svg"} alt={member.name} />
                  <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <h5 className="font-medium text-sm">{member.name}</h5>
                  <p className="text-xs text-blue-500">{member.title}</p>
                  <p className="text-xs text-muted-foreground">Since {member.since}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Organization Info */}
        <div>
          <h4 className="font-medium text-sm mb-3">
            {asset.type === "stock"
              ? "Company Information"
              : asset.type === "crypto"
                ? "Project Information"
                : "Fund Information"}
          </h4>

          <div className="border border-blue-900/20 rounded-lg p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {asset.type === "stock" && managementData.company && (
                <>
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-2 text-blue-500" />
                    <div>
                      <p className="text-xs text-muted-foreground">Founded</p>
                      <p className="text-sm">{managementData.company.founded}</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <Building className="h-4 w-4 mr-2 text-blue-500" />
                    <div>
                      <p className="text-xs text-muted-foreground">Headquarters</p>
                      <p className="text-sm">{managementData.company.headquarters}</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <Users className="h-4 w-4 mr-2 text-blue-500" />
                    <div>
                      <p className="text-xs text-muted-foreground">Employees</p>
                      <p className="text-sm">{managementData.company.employees}</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <Briefcase className="h-4 w-4 mr-2 text-blue-500" />
                    <div>
                      <p className="text-xs text-muted-foreground">Industry</p>
                      <p className="text-sm">{managementData.company.industry}</p>
                    </div>
                  </div>
                </>
              )}

              {asset.type === "crypto" && managementData.project && (
                <>
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-2 text-blue-500" />
                    <div>
                      <p className="text-xs text-muted-foreground">Launched</p>
                      <p className="text-sm">{managementData.project.launched}</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <Users className="h-4 w-4 mr-2 text-blue-500" />
                    <div>
                      <p className="text-xs text-muted-foreground">Governance</p>
                      <p className="text-sm">{managementData.project.governance}</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <Building className="h-4 w-4 mr-2 text-blue-500" />
                    <div>
                      <p className="text-xs text-muted-foreground">Active Nodes</p>
                      <p className="text-sm">{managementData.project.nodes}</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <Award className="h-4 w-4 mr-2 text-blue-500" />
                    <div>
                      <p className="text-xs text-muted-foreground">Consensus</p>
                      <p className="text-sm">{managementData.project.consensus}</p>
                    </div>
                  </div>
                </>
              )}

              {asset.type === "etf" && managementData.fund && (
                <>
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-2 text-blue-500" />
                    <div>
                      <p className="text-xs text-muted-foreground">Established</p>
                      <p className="text-sm">{managementData.fund.established}</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <Briefcase className="h-4 w-4 mr-2 text-blue-500" />
                    <div>
                      <p className="text-xs text-muted-foreground">Assets Under Management</p>
                      <p className="text-sm">{managementData.fund.assets}</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <Building className="h-4 w-4 mr-2 text-blue-500" />
                    <div>
                      <p className="text-xs text-muted-foreground">Number of Holdings</p>
                      <p className="text-sm">{managementData.fund.holdings}</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <Award className="h-4 w-4 mr-2 text-blue-500" />
                    <div>
                      <p className="text-xs text-muted-foreground">Investment Strategy</p>
                      <p className="text-sm">{managementData.fund.strategy}</p>
                    </div>
                  </div>
                </>
              )}
            </div>

            <div className="mt-4">
              <p className="text-xs text-muted-foreground mb-2">
                {asset.type === "stock" ? "Key Products" : asset.type === "crypto" ? "Key Features" : "Top Holdings"}
              </p>
              <div className="flex flex-wrap gap-2">
                {(asset.type === "stock"
                  ? managementData.company?.keyProducts
                  : asset.type === "crypto"
                    ? managementData.project?.keyFeatures
                    : managementData.fund?.topHoldings
                )?.map((item, index) => (
                  <span
                    key={index}
                    className="inline-block px-2 py-1 text-xs rounded-full bg-blue-950/30 border border-blue-900/20"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
