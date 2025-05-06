import React from 'react'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ChevronRight } from 'lucide-react'

const MotivationCard = () => {

    return (
        <div className="flex">
            <Card className="bg-black border-blue-900 text-white">
                <CardHeader>
                    <CardTitle className="text-blue-400">Motivation of the Day</CardTitle>
                </CardHeader>
                <CardContent>
                    <blockquote className="border-l-4 border-blue-600 pl-4 italic text-lg text-gray-200">
                        "An investment in knowledge pays the best interest."
                    </blockquote>
                    <p className="text-right text-gray-400">— Rohan Singla </p>
                </CardContent>
                <CardFooter>
                    <Button variant="link" asChild className="text-blue-400 hover:text-blue-300 p-0">
                        <Link href={"google.com"}>
                            Read the story behind this quote <ChevronRight className="ml-1 h-4 w-4" />
                        </Link>
                    </Button>
                </CardFooter>
            </Card>
        </div>
    )
}

export default MotivationCard