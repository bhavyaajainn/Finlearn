"use client"

import { Card, CardContent } from "@/components/ui/card"
import { motion } from "framer-motion"
import { Github, Linkedin } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

interface TeamMemberProps {
  name: string
  role: string
  image: string
  github?: string
  linkedin?: string
}

export default function TeamMember({ name, role, image, github, linkedin }: TeamMemberProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      viewport={{ once: true, margin: "-100px" }}
      className="h-full"
    >
      <Card className="bg-zinc-900 border-zinc-800 overflow-hidden hover:shadow-md hover:shadow-blue-900/10 transition-shadow h-full flex flex-col p-0">
        <div className="aspect-square relative w-full">
          <Image src={image || "/placeholder.svg"} alt={name} fill className="object-cover" />
        </div>
        <CardContent className="p-3 sm:p-4 flex-1">
          <h3 className="text-base sm:text-lg font-semibold text-white">{name}</h3>
          <p className="text-xs sm:text-sm text-gray-400 mb-2 sm:mb-3">{role}</p>
          <div className="flex space-x-3">
            {github && (
              <Link
                href={github}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-blue-400 transition-colors"
              >
                <Github size={16} className="sm:h-[18px] sm:w-[18px]" />
              </Link>
            )}
            {linkedin && (
              <Link
                href={linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-blue-400 transition-colors"
              >
                <Linkedin size={16} className="sm:h-[18px] sm:w-[18px]" />
              </Link>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}