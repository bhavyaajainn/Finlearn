"use client"

import { useState } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { useAppDispatch } from '@/app/store/hooks'
import { signOut } from '@/app/store/slices/authSlice'
import { User, LogOut, ChevronDown, Menu, X } from 'lucide-react'

export default function DashboardNavbar() {
  const dispatch = useAppDispatch()
  const router = useRouter()
  const pathname = usePathname()
  const [showDropdown, setShowDropdown] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const handleLogout = async () => {
    try {
      await dispatch(signOut()).unwrap()
      router.push('/')
    } catch (err) {
      console.error("Logout failed:", err)
    }
  }

  const toggleDropdown = () => {
    setShowDropdown(!showDropdown)
  }

  const isActiveLink = (path: string) => {
    return pathname === path
  }

  const handleNavigation = (path: string) => {
    // Scroll to top before navigation
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    // Small delay to ensure scroll completes, then navigate
    setTimeout(() => {
      router.push(path);
    }, 100);
  }

  const handleLinkClick = (path: string, closeMenu?: boolean) => {
    if (closeMenu) {
      setMobileMenuOpen(false);
    }
    handleNavigation(path);
  }

  return (
    <nav className="bg-black border-b border-zinc-900 sticky top-0 z-40">
      <div className="container max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <button 
              onClick={() => handleNavigation('/')}
              className="text-2xl font-bold text-white hover:text-blue-400 transition-colors"
            >
              FinLearn <span className="text-blue-400">AI</span>
            </button>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            <button
              onClick={() => handleNavigation('/dashboard')}
              className={`${isActiveLink('/dashboard') ? 'text-blue-400' : 'text-gray-300'} hover:text-blue-400 transition-colors`}
            >
              Dashboard
            </button>
            <button
              onClick={() => handleNavigation('/dashboard/watchlist')}
              className={`${isActiveLink('/dashboard/watchlist') ? 'text-blue-400' : 'text-gray-300'} hover:text-blue-400 transition-colors`}
            >
              Watchlist
            </button>
            <button
              onClick={() => handleNavigation('/dashboard/learning')}
              className={`${isActiveLink('/dashboard/learning') ? 'text-blue-400' : 'text-gray-300'} hover:text-blue-400 transition-colors`}
            >
              Learning Hub
            </button>

            {/* Avatar with Dropdown */}
            <div className="relative">
              <button
                onClick={toggleDropdown}
                className="flex items-center space-x-2 text-gray-300 hover:text-white"
              >
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-600">
                  <User size={16} className="text-white" />
                </div>
                <ChevronDown size={16} className={`transition-transform ${showDropdown ? 'rotate-180' : ''}`} />
              </button>

              {/* Dropdown Menu */}
              {showDropdown && (
                <div className="absolute right-0 mt-2 w-48 py-1 bg-zinc-900 border border-zinc-800 rounded-md shadow-lg z-50">
                  <button
                    onClick={() => {
                      setShowDropdown(false);
                      handleNavigation('/dashboard/profile');
                    }}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-zinc-800"
                  >
                    <div className="flex items-center">
                      <User size={14} className="mr-2" />
                      <span>Profile</span>
                    </div>
                  </button>
                  <div className="border-t border-zinc-800 my-1"></div>
                  <button
                    onClick={() => {
                      handleLogout()
                      setShowDropdown(false)
                    }}
                    className="block w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-zinc-800"
                  >
                    <div className="flex items-center">
                      <LogOut size={14} className="mr-2" />
                      <span>Logout</span>
                    </div>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-gray-300 hover:text-white"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-zinc-900 border-b border-zinc-800 px-4 py-4">
          <div className="flex flex-col space-y-4">
            <button
              onClick={() => handleLinkClick('/dashboard', true)}
              className={`${isActiveLink('/dashboard') ? 'text-blue-400' : 'text-gray-300'} hover:text-blue-400 text-left`}
            >
              Dashboard
            </button>
            <button
              onClick={() => handleLinkClick('/dashboard/watchlist', true)}
              className={`${isActiveLink('/dashboard/watchlist') ? 'text-blue-400' : 'text-gray-300'} hover:text-blue-400 text-left`}
            >
              Watchlist
            </button>
            <button
              onClick={() => handleLinkClick('/dashboard/learning', true)}
              className={`${isActiveLink('/dashboard/learning') ? 'text-blue-400' : 'text-gray-300'} hover:text-blue-400 text-left`}
            >
              Learning Hub
            </button>
            <div className="border-t border-zinc-800 pt-4">
              <button
                onClick={() => handleLinkClick('/dashboard/profile', true)}
                className="block text-gray-300 hover:text-blue-400 mb-2 text-left w-full"
              >
                <div className="flex items-center">
                  <User size={16} className="mr-2" />
                  <span>Profile</span>
                </div>
              </button>
              <button
                onClick={() => {
                  handleLogout()
                  setMobileMenuOpen(false)
                }}
                className="flex items-center text-red-400 hover:text-red-300 w-full text-left"
              >
                <LogOut size={16} className="mr-2" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}