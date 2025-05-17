import React from 'react'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ChevronRight, Quote } from 'lucide-react'
import { motion } from 'framer-motion'

const MotivationCard = () => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >
            <Card className="bg-black border-blue-900/50 text-white hover:border-blue-500/50 transition-all duration-300">
                <CardHeader className="pb-2">
                    <CardTitle className="text-white flex items-center gap-2 text-base">
                        <Quote className="h-4 w-4 text-blue-400" />
                        Motivation of the Day
                    </CardTitle>
                </CardHeader>
                <CardContent className="pb-2">
                    <blockquote className="border-l-4 border-blue-600 pl-4 italic text-base text-gray-200 mb-2">
                        "An investment in knowledge pays the best interest."
                    </blockquote>
                    <p className="text-gray-400 text-sm">— Benjamin Franklin</p>
                </CardContent>
                <CardFooter className="pt-0">
                    <Button variant="link" className="text-blue-400 hover:text-blue-300 p-0 text-xs">
                        Read the story <ChevronRight className="ml-1 h-3 w-3" />
                    </Button>
                </CardFooter>
            </Card>
        </motion.div>
    )
}

export default MotivationCard
