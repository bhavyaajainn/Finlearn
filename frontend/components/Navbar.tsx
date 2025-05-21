"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Menu, X } from "lucide-react"
import UserAvatar from "./UserAvatar"

interface NavbarProps {
    showAuthModal?: boolean;
    setShowAuthModal?: (show: boolean) => void;
}

export default function Navbar({ showAuthModal, setShowAuthModal }: NavbarProps) {
    const [isMenuOpen, setIsMenuOpen] = useState(false)

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen)
    } 
    useEffect(() => {
        if (showAuthModal) {
            
            if (setShowAuthModal) {
                
                
                setTimeout(() => {
                    setShowAuthModal(false)
                }, 100)
            }
        }
    }, [showAuthModal, setShowAuthModal])

    
    const handleTryItNow = () => {
        if (setShowAuthModal) {
            setShowAuthModal(true)
        }
    }

    return (
        <nav className="bg-black border-b border-zinc-900 sticky top-0 z-40">
            <div className="container max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    <div className="flex items-center">
                        <Link href="/" className="text-2xl font-bold text-white">
                            FinLearn <span className="text-blue-400">AI</span>
                        </Link>
                    </div>
                    <div className="hidden md:flex items-center space-x-8">
                        <Link href="#features" className="text-gray-300 hover:text-blue-400 transition-colors">
                            Features
                        </Link>
                        <Link href="#technology" className="text-gray-300 hover:text-blue-400 transition-colors">
                            HowItWorks
                        </Link>
                        <Link href="#team" className="text-gray-300 hover:text-blue-400 transition-colors">
                            Team
                        </Link>
                        <Link href="#roadmap" className="text-gray-300 hover:text-blue-400 transition-colors">
                            Plans
                        </Link>
                        {/* Modified to trigger auth modal */}
                        <Button 
                            className="bg-blue-600 hover:bg-blue-700 text-white"
                            onClick={handleTryItNow}
                        >
                            Try It Now
                        </Button>
                        <UserAvatar externalTrigger={showAuthModal} />
                    </div>
                    <div className="md:hidden flex items-center space-x-4">
                        <UserAvatar externalTrigger={showAuthModal} />
                        <button
                            type="button"
                            className="text-gray-300 hover:text-white"
                            onClick={toggleMenu}
                            aria-label="Toggle menu"
                        >
                            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    </div>
                </div>
            </div>
            {isMenuOpen && (
                <div className="md:hidden bg-zinc-900 border-b border-zinc-800">
                    <div className="container max-w-6xl mx-auto px-4 py-4 space-y-4">
                        <Link
                            href="#features"
                            className="block text-gray-300 hover:text-blue-400 transition-colors"
                            onClick={toggleMenu}
                        >
                            Features
                        </Link>
                        <Link
                            href="#technology"
                            className="block text-gray-300 hover:text-blue-400 transition-colors"
                            onClick={toggleMenu}
                        >
                            Technology
                        </Link>
                        <Link
                            href="#team"
                            className="block text-gray-300 hover:text-blue-400 transition-colors"
                            onClick={toggleMenu}
                        >
                            Team
                        </Link>
                        <Link
                            href="#roadmap"
                            className="block text-gray-300 hover:text-blue-400 transition-colors"
                            onClick={toggleMenu}
                        >
                            Roadmap
                        </Link>
                        <Button 
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                            onClick={() => {
                                handleTryItNow()
                                toggleMenu()
                            }}
                        >
                            Try It Now
                        </Button>
                    </div>
                </div>
            )}
        </nav>
    )
}