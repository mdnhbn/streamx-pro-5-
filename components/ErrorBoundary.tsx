
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6 text-center">
          <AlertTriangle size={48} className="text-red-500 mb-4" />
          <h1 className="text-xl font-bold mb-2">Something went wrong</h1>
          <p className="text-gray-400 text-sm mb-6 max-w-xs break-words">
            {this.state.error?.message || 'An unexpected error occurred during startup.'}
          </p>
          <button
            onClick={() => {
                localStorage.clear(); // Clear potentially corrupted data
                window.location.reload();
            }}
            className="bg-red-600 text-white px-6 py-3 rounded-full font-bold flex items-center gap-2 active:scale-95 transition-transform"
          >
            <RefreshCw size={18} /> Reset & Reload
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
