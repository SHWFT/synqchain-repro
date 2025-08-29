"use client";

import React from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error: Error; reset: () => void }>;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Error Boundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      const FallbackComponent = this.props.fallback || DefaultErrorFallback;
      
      return (
        <FallbackComponent 
          error={this.state.error!} 
          reset={() => this.setState({ hasError: false, error: undefined })}
        />
      );
    }

    return this.props.children;
  }
}

function DefaultErrorFallback({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
            <AlertTriangle className="w-6 h-6 text-destructive" />
          </div>
          <CardTitle>Something went wrong</CardTitle>
          <CardDescription>
            An unexpected error occurred. Please try refreshing the page.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <details className="text-sm">
            <summary className="cursor-pointer text-muted-foreground mb-2">
              Error details
            </summary>
            <pre className="bg-muted p-2 rounded text-xs overflow-auto">
              {error.message}
            </pre>
          </details>
          
          <div className="flex gap-2">
            <Button 
              onClick={reset} 
              variant="outline" 
              className="flex-1"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
            <Button 
              onClick={() => window.location.reload()} 
              className="flex-1"
            >
              Refresh Page
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}






