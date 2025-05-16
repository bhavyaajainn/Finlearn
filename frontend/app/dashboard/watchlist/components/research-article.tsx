import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"

interface ArticleSection {
    title: string
    content: string
}

interface Recommendation {
    rating: string
    reasoning: string
    risk_level: string
    time_horizon: string
}

interface ResearchArticle {
    title: string
    summary: string
    introduction: string
    sections: ArticleSection[]
    recommendation: Recommendation
    conclusion: string
}

interface ResearchArticleProps {
    article: ResearchArticle
}

export default function ResearchArticle({ article }: ResearchArticleProps) {
    const getRecommendationColor = (rating: string) => {
        switch (rating.toLowerCase()) {
            case "buy":
                return "bg-green-900/30 text-green-400"
            case "sell":
                return "bg-red-900/30 text-red-400"
            case "hold":
                return "bg-blue-900/30 text-blue-400"
            default:
                return "bg-gray-800 text-gray-300"
        }
    }

    const getRiskColor = (risk: string) => {
        switch (risk.toLowerCase()) {
            case "high":
                return "bg-red-900/30 text-red-400"
            case "medium":
                return "bg-yellow-900/30 text-yellow-400"
            case "low":
                return "bg-green-900/30 text-green-400"
            default:
                return "bg-gray-800 text-gray-300"
        }
    }

    return (
        <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
                <div className="flex flex-wrap gap-2 mb-2">
                    <Badge className={getRecommendationColor(article.recommendation.rating)}>
                        {article.recommendation.rating}
                    </Badge>
                    <Badge className={getRiskColor(article.recommendation.risk_level)}>
                        {article.recommendation.risk_level} Risk
                    </Badge>
                    <Badge className="bg-gray-800 text-gray-300">{article.recommendation.time_horizon}</Badge>
                </div>
                <CardTitle className="text-xl font-bold text-blue-400">{article.title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="bg-gray-800 p-4 rounded-lg">
                    <p className="text-gray-300 italic">{article.summary}</p>
                </div>

                <div>
                    <h3 className="text-lg font-semibold mb-2">Introduction</h3>
                    <p className="text-gray-300">{article.introduction.replace(/\[([^\]]+)\]\{[^}]+\}/g, "$1")}</p>
                </div>

                {article.sections.map((section, index) => (
                    <div key={index}>
                        <h3 className="text-lg font-semibold mb-2">{section.title}</h3>
                        <p className="text-gray-300">{section.content.replace(/\[([^\]]+)\]\{[^}]+\}/g, "$1")}</p>
                    </div>
                ))}

                <Separator className="bg-gray-800" />

                <div className="bg-gray-800 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold mb-2">Recommendation</h3>
                    <p className="text-gray-300 mb-4">{article.recommendation.reasoning}</p>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <p className="text-sm text-gray-400">Rating</p>
                            <p className="font-medium">{article.recommendation.rating}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-400">Risk Level</p>
                            <p className="font-medium">{article.recommendation.risk_level}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-400">Time Horizon</p>
                            <p className="font-medium">{article.recommendation.time_horizon}</p>
                        </div>
                    </div>
                </div>

                <div>
                    <h3 className="text-lg font-semibold mb-2">Conclusion</h3>
                    <p className="text-gray-300">{article.conclusion}</p>
                </div>
            </CardContent>
        </Card>
    )
}
