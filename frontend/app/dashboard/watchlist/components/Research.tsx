"use client"

import { useState } from "react"
import { Calendar, Clock, Download, Mail } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"

// Mock research data
const researchData = [
  {
    id: "1",
    asset: "Apple Inc. (AAPL)",
    date: "May 1, 2023",
    summary:
      "Apple continues to show strong performance in its services segment, with revenue growing 20% year-over-year. The company's focus on expanding its ecosystem and increasing user engagement is paying off, with the average revenue per user increasing by 15%. However, there are concerns about slowing iPhone sales in key markets and potential supply chain disruptions affecting production capacity.",
    keyPoints: [
      "Services revenue reached $20.8 billion, up 20% YoY",
      "iPhone sales declined 5% in China market",
      "New product announcements expected in September",
      "Regulatory challenges in EU could impact App Store revenue",
    ],
    sentiment: "neutral",
  },
  {
    id: "2",
    asset: "Bitcoin (BTC)",
    date: "May 1, 2023",
    summary:
      "Bitcoin has shown increased stability in recent weeks, trading in a narrow range despite broader market volatility. Institutional adoption continues to grow, with several major financial institutions launching Bitcoin-related investment products. On-chain metrics show accumulation by long-term holders, which historically has preceded price appreciation. However, regulatory uncertainty remains a concern in several key markets.",
    keyPoints: [
      "30-day volatility at lowest level in 2 years",
      "Institutional holdings increased by 15%",
      "Mining difficulty reached all-time high",
      "Regulatory clarity improving in US market",
    ],
    sentiment: "positive",
  },
  {
    id: "3",
    asset: "Tesla, Inc. (TSLA)",
    date: "May 1, 2023",
    summary:
      "Tesla reported mixed quarterly results, with vehicle deliveries slightly below expectations but strong margins compared to industry peers. The company's energy business is showing promising growth, with storage deployments doubling year-over-year. Competition in the EV market is intensifying, particularly in China and Europe, which could pressure Tesla's market share. The company's Full Self-Driving technology continues to advance but faces regulatory scrutiny.",
    keyPoints: [
      "Vehicle deliveries reached 422,000, up 18% YoY but below estimates",
      "Automotive gross margin of 25.9%, industry-leading",
      "Energy storage deployments up 100% YoY",
      "New Gigafactory announced for Asian market",
    ],
    sentiment: "neutral",
  },
]

export default function WeeklyResearch() {
  const [emailSubscribed, setEmailSubscribed] = useState(false)

  const handleSubscribe = () => {
    setEmailSubscribed(true)
  }

  return (
    <div className="space-y-6">
      <Card className="border-blue-900/20 bg-black">
        <CardHeader>
          <CardTitle className="text-xl">Weekly Research Reports</CardTitle>
          <CardDescription>AI-powered deep dives on your watchlisted assets</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <Calendar className="h-5 w-5 mr-2 text-blue-500" />
                <h3 className="font-medium">Latest Reports (May 1, 2023)</h3>
              </div>
              <Button variant="outline" size="sm" className="flex items-center">
                <Download className="h-4 w-4 mr-2" />
                Download All
              </Button>
            </div>

            <Tabs defaultValue={researchData[0].id}>
              <TabsList className="mb-4">
                {researchData.map((report,i) => (
                  <TabsTrigger key={i} value={report.id}>
                    {report.asset.split(" ")[0]}
                  </TabsTrigger>
                ))}
              </TabsList>

              {researchData.map((report,i) => (
                <TabsContent key={i} value={report.id}>
                  <Card className="border-blue-900/20 bg-black">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle>{report.asset}</CardTitle>
                        <Badge
                          variant="outline"
                          className={`capitalize ${
                            report.sentiment === "positive"
                              ? "text-green-500 border-green-500/20"
                              : report.sentiment === "negative"
                                ? "text-red-500 border-red-500/20"
                                : "text-yellow-500 border-yellow-500/20"
                          }`}
                        >
                          {report.sentiment}
                        </Badge>
                      </div>
                      <CardDescription className="flex items-center">
                        <Clock className="h-3 w-3 mr-1" />
                        {report.date}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm mb-4">{report.summary}</p>
                      <h4 className="font-medium text-sm mb-2">Key Points</h4>
                      <ul className="space-y-2">
                        {report.keyPoints.map((point, index) => (
                          <li key={index} className="text-sm flex items-start">
                            <span className="text-blue-500 mr-2">•</span>
                            {point}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                    <CardFooter>
                      <Button variant="outline" size="sm" className="w-full">
                        <Download className="h-4 w-4 mr-2" />
                        Download Report
                      </Button>
                    </CardFooter>
                  </Card>
                </TabsContent>
              ))}
            </Tabs>
          </div>

          <Card className="border-blue-900/20 bg-blue-950/10">
            <CardHeader>
              <CardTitle className="text-lg">Email Subscription</CardTitle>
              <CardDescription>Get weekly research reports delivered to your inbox</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Mail className="h-5 w-5 mr-2 text-blue-500" />
                  <div>
                    <h4 className="font-medium text-sm">Weekly Delivery</h4>
                    <p className="text-xs text-muted-foreground">Every Monday at 9:00 AM</p>
                  </div>
                </div>
                <Button
                  variant={emailSubscribed ? "outline" : "default"}
                  onClick={handleSubscribe}
                  disabled={emailSubscribed}
                >
                  {emailSubscribed ? "Subscribed" : "Subscribe"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  )
}
