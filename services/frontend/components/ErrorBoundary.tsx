import React, { Component, ReactNode, ErrorInfo } from 'react'
import { withRouter, NextRouter } from 'next/router'

interface Props {
  children: ReactNode
  router: NextRouter
}

interface State {
  hasError: boolean
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)

    // Define a state variable to track whether is an error or not
    this.state = { hasError: false }
  }
  
  static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI
    return { hasError: true }
  }
  
  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // You can use your own error logging service here
    console.error('ErrorBoundary caught an error:', error, errorInfo)
  }
  
  render() {
    // Check if the error is thrown
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-8 text-center">
            <h2 className="mb-4 text-3xl font-bold text-gray-900">Oops, there is an error!</h2>
            <p className="mb-6 text-gray-600">Something went wrong. Please try refreshing the page or go back home.</p>
            <button
              type="button"
              className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-lg transition-colors"
              onClick={() => window.location.assign('/')}
            >
              Go back home
            </button>
          </div>
        </div>
      )
    }

    // Return children components in case of no error
    return this.props.children
  }
}

export default withRouter(ErrorBoundary)
