"use client"

import React, { Component, ErrorInfo, ReactNode } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { AlertCircle, Home, RefreshCw } from 'lucide-react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
  errorInfo: ErrorInfo | null
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    }
  }

  static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI
    return {
      hasError: true,
      error,
      errorInfo: null,
    }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // You can log the error to an error reporting service here
    console.error('Error caught by ErrorBoundary:', error, errorInfo)
    this.setState({
      error,
      errorInfo,
    })
  }

  resetError = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    })
  }

  render(): ReactNode {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback
      }

      // Default fallback UI
      return (
        <div className="min-h-screen bg-black flex items-center justify-center p-4">
          <Card className="bg-zinc-900 border-zinc-800 w-full max-w-md">
            <CardContent className="pt-6">
              <div className="mb-6 flex items-center justify-center">
                <div className="h-20 w-20 rounded-full bg-red-500/10 flex items-center justify-center">
                  <AlertCircle className="h-10 w-10 text-red-500" />
                </div>
              </div>
              
              <h2 className="text-2xl font-bold text-white text-center mb-2">
                Something went wrong
              </h2>
              
              <p className="text-gray-400 text-center mb-6">
                An error occurred while displaying this view.
              </p>
              
              {this.state.error && (
                <div className="mb-6 p-4 bg-zinc-800 rounded-md overflow-auto">
                  <p className="text-red-400 text-sm font-mono">
                    {this.state.error.toString()}
                  </p>
                </div>
              )}
              
              <div className="flex flex-col sm:flex-row gap-3">
                <Button 
                  onClick={this.resetError} 
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Try again
                </Button>
                
                <Button 
                  onClick={() => window.location.href = '/'} 
                  variant="outline" 
                  className="flex-1 border-blue-500 bg-zinc-800 text-white hover:bg-zinc-700"
                >
                  <Home className="mr-2 h-4 w-4" />
                  Go home
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )
    }

    // When there's no error, render children normally
    return this.props.children
  }
}

export default ErrorBoundary