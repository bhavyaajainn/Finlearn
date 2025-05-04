"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { User, KeyRound, Mail, UserPlus, X, LogIn, LogOut } from "lucide-react"
import { useAppDispatch, useAppSelector } from "@/app/store/hooks"
import { 
  signInWithEmail, 
  signUpWithEmail, 
  signInWithGoogle, 
  signOut,
  checkAuthState
} from "@/app/store/slices/authSlice"

// Tab interface
type TabType = "signin" | "signup"

export default function UserAvatar() {
  // Redux
  const dispatch = useAppDispatch()
  const { user, loading, error } = useAppSelector((state) => state.auth)
  
  // Local state
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<TabType>("signin")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  // Check authentication state on mount
  useEffect(() => {
    dispatch(checkAuthState())
  }, [dispatch])

  // Toggle modal visibility
  const toggleModal = () => {
    setIsModalOpen(!isModalOpen)
  }

  // Switch between signin and signup tabs
  const switchTab = (tab: TabType) => {
    setActiveTab(tab)
  }
  
  // Reset form fields when modal is closed
  useEffect(() => {
    if (!isModalOpen) {
      setEmail("")
      setPassword("")
    }
  }, [isModalOpen])

  // Authentication handlers
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    await dispatch(signInWithEmail({ email, password }))
    if (!error) {
      setIsModalOpen(false)
    }
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    await dispatch(signUpWithEmail({ email, password }))
    if (!error) {
      setIsModalOpen(false)
    }
  }

  const handleGoogleSignIn = async () => {
    await dispatch(signInWithGoogle())
    if (!error) {
      setIsModalOpen(false)
    }
  }

  const handleSignOut = () => {
    dispatch(signOut())
  }

  // If loading, show a loading indicator
  if (loading) {
    return (
      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-zinc-800">
        <span className="animate-spin h-4 w-4 border-2 border-blue-400 border-t-transparent rounded-full"></span>
      </div>
    )
  }

  return (
    <>
      {/* Avatar button */}
      <button
        onClick={user ? handleSignOut : toggleModal}
        className={`flex items-center justify-center w-8 h-8 rounded-full ${
          user ? "bg-blue-600 hover:bg-blue-700" : "bg-zinc-800 hover:bg-zinc-700"
        } transition-colors`}
        aria-label="User profile"
      >
        {user ? (
          <LogOut size={16} className="text-white" />
        ) : (
          <User size={16} className="text-blue-400" />
        )}
      </button>

      {/* Modal */}
      <AnimatePresence>
        {isModalOpen && !user && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
              onClick={toggleModal}
            />

            {/* Modal content */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ type: "spring", duration: 0.5 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-xl p-6 z-50"
            >
              {/* Close button */}
              <button
                onClick={toggleModal}
                className="absolute top-4 right-4 text-gray-400 hover:text-white"
              >
                <X size={20} />
              </button>

              {/* Error message */}
              {error && (
                <div className="mb-4 p-3 bg-red-400/10 border border-red-400/20 rounded-md text-red-400 text-sm">
                  {error}
                </div>
              )}

              {/* Tabs */}
              <div className="flex mb-6 border-b border-zinc-800">
                <button
                  onClick={() => switchTab("signin")}
                  className={`flex items-center px-4 py-2 font-medium ${
                    activeTab === "signin"
                      ? "text-blue-400 border-b-2 border-blue-400"
                      : "text-gray-400 hover:text-gray-200"
                  }`}
                >
                  <LogIn size={16} className="mr-2" />
                  Sign In
                </button>
                <button
                  onClick={() => switchTab("signup")}
                  className={`flex items-center px-4 py-2 font-medium ${
                    activeTab === "signup"
                      ? "text-blue-400 border-b-2 border-blue-400"
                      : "text-gray-400 hover:text-gray-200"
                  }`}
                >
                  <UserPlus size={16} className="mr-2" />
                  Sign Up
                </button>
              </div>

              {/* Sign in form */}
              {activeTab === "signin" && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  <h2 className="text-xl font-bold text-white mb-4">Welcome back</h2>
                  <form onSubmit={handleSignIn} className="space-y-4">
                    <div className="space-y-2">
                      <label htmlFor="signin-email" className="block text-sm font-medium text-gray-300">
                        Email
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                          <Mail size={16} className="text-gray-400" />
                        </div>
                        <input
                          id="signin-email"
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="w-full pl-10 pr-4 py-2 bg-zinc-800 border border-zinc-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                          placeholder="you@example.com"
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="signin-password" className="block text-sm font-medium text-gray-300">
                        Password
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                          <KeyRound size={16} className="text-gray-400" />
                        </div>
                        <input
                          id="signin-password"
                          type="password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="w-full pl-10 pr-4 py-2 bg-zinc-800 border border-zinc-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                          placeholder="••••••••"
                          required
                        />
                      </div>
                    </div>
                    <button
                      type="submit"
                      className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
                    >
                      Sign In
                    </button>
                  </form>
                  <div className="mt-4">
                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-zinc-700"></div>
                      </div>
                      <div className="relative flex justify-center text-sm">
                        <span className="px-2 bg-zinc-900 text-gray-400">Or continue with</span>
                      </div>
                    </div>
                    <div className="mt-4">
                      <button
                        onClick={handleGoogleSignIn}
                        className="w-full px-4 py-2 border border-zinc-700 rounded-md hover:bg-zinc-800 transition-colors flex items-center justify-center"
                      >
                        <svg viewBox="0 0 24 24" width="16" height="16" className="mr-2">
                          <g transform="matrix(1, 0, 0, 1, 27.009001, -39.238998)">
                            <path fill="#4285F4" d="M -3.264 51.509 C -3.264 50.719 -3.334 49.969 -3.454 49.239 L -14.754 49.239 L -14.754 53.749 L -8.284 53.749 C -8.574 55.229 -9.424 56.479 -10.684 57.329 L -10.684 60.329 L -6.824 60.329 C -4.564 58.239 -3.264 55.159 -3.264 51.509 Z" />
                            <path fill="#34A853" d="M -14.754 63.239 C -11.514 63.239 -8.804 62.159 -6.824 60.329 L -10.684 57.329 C -11.764 58.049 -13.134 58.489 -14.754 58.489 C -17.884 58.489 -20.534 56.379 -21.484 53.529 L -25.464 53.529 L -25.464 56.619 C -23.494 60.539 -19.444 63.239 -14.754 63.239 Z" />
                            <path fill="#FBBC05" d="M -21.484 53.529 C -21.734 52.809 -21.864 52.039 -21.864 51.239 C -21.864 50.439 -21.724 49.669 -21.484 48.949 L -21.484 45.859 L -25.464 45.859 C -26.284 47.479 -26.754 49.299 -26.754 51.239 C -26.754 53.179 -26.284 54.999 -25.464 56.619 L -21.484 53.529 Z" />
                            <path fill="#EA4335" d="M -14.754 43.989 C -12.984 43.989 -11.404 44.599 -10.154 45.789 L -6.734 42.369 C -8.804 40.429 -11.514 39.239 -14.754 39.239 C -19.444 39.239 -23.494 41.939 -25.464 45.859 L -21.484 48.949 C -20.534 46.099 -17.884 43.989 -14.754 43.989 Z" />
                          </g>
                        </svg>
                        Sign in with Google
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Sign up form */}
              {activeTab === "signup" && (
                <motion.div
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  transition={{ duration: 0.2 }}
                >
                  <h2 className="text-xl font-bold text-white mb-4">Create an account</h2>
                  <form onSubmit={handleSignUp} className="space-y-4">
                    <div className="space-y-2">
                      <label htmlFor="signup-email" className="block text-sm font-medium text-gray-300">
                        Email
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                          <Mail size={16} className="text-gray-400" />
                        </div>
                        <input
                          id="signup-email"
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="w-full pl-10 pr-4 py-2 bg-zinc-800 border border-zinc-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                          placeholder="you@example.com"
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="signup-password" className="block text-sm font-medium text-gray-300">
                        Password
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                          <KeyRound size={16} className="text-gray-400" />
                        </div>
                        <input
                          id="signup-password"
                          type="password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="w-full pl-10 pr-4 py-2 bg-zinc-800 border border-zinc-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                          placeholder="••••••••"
                          required
                        />
                      </div>
                    </div>
                    <button
                      type="submit"
                      className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
                    >
                      Sign Up
                    </button>
                  </form>
                  <div className="mt-4">
                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-zinc-700"></div>
                      </div>
                      <div className="relative flex justify-center text-sm">
                        <span className="px-2 bg-zinc-900 text-gray-400">Or continue with</span>
                      </div>
                    </div>
                    <div className="mt-4">
                      <button
                        onClick={handleGoogleSignIn}
                        className="w-full px-4 py-2 border border-zinc-700 rounded-md hover:bg-zinc-800 transition-colors flex items-center justify-center"
                      >
                        <svg viewBox="0 0 24 24" width="16" height="16" className="mr-2">
                          <g transform="matrix(1, 0, 0, 1, 27.009001, -39.238998)">
                            <path fill="#4285F4" d="M -3.264 51.509 C -3.264 50.719 -3.334 49.969 -3.454 49.239 L -14.754 49.239 L -14.754 53.749 L -8.284 53.749 C -8.574 55.229 -9.424 56.479 -10.684 57.329 L -10.684 60.329 L -6.824 60.329 C -4.564 58.239 -3.264 55.159 -3.264 51.509 Z" />
                            <path fill="#34A853" d="M -14.754 63.239 C -11.514 63.239 -8.804 62.159 -6.824 60.329 L -10.684 57.329 C -11.764 58.049 -13.134 58.489 -14.754 58.489 C -17.884 58.489 -20.534 56.379 -21.484 53.529 L -25.464 53.529 L -25.464 56.619 C -23.494 60.539 -19.444 63.239 -14.754 63.239 Z" />
                            <path fill="#FBBC05" d="M -21.484 53.529 C -21.734 52.809 -21.864 52.039 -21.864 51.239 C -21.864 50.439 -21.724 49.669 -21.484 48.949 L -21.484 45.859 L -25.464 45.859 C -26.284 47.479 -26.754 49.299 -26.754 51.239 C -26.754 53.179 -26.284 54.999 -25.464 56.619 L -21.484 53.529 Z" />
                            <path fill="#EA4335" d="M -14.754 43.989 C -12.984 43.989 -11.404 44.599 -10.154 45.789 L -6.734 42.369 C -8.804 40.429 -11.514 39.239 -14.754 39.239 C -19.444 39.239 -23.494 41.939 -25.464 45.859 L -21.484 48.949 C -20.534 46.099 -17.884 43.989 -14.754 43.989 Z" />
                          </g>
                        </svg>
                        Sign up with Google
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}