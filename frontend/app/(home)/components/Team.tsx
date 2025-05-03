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
    >
      <Card className="bg-zinc-900 border-zinc-800 overflow-hidden">
        <div className="aspect-square relative">
          <Image src={image || "/placeholder.svg"} alt={name} fill className="object-cover" />
        </div>
        <CardContent className="pt-4">
          <h3 className="text-lg font-semibold text-white">{name}</h3>
          <p className="text-gray-400 text-sm mb-3">{role}</p>
          <div className="flex space-x-3">
            {github && (
              <Link
                href={github}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-blue-400"
              >
                <Github size={18} />
              </Link>
            )}
            {linkedin && (
              <Link
                href={linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-blue-400"
              >
                <Linkedin size={18} />
              </Link>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
