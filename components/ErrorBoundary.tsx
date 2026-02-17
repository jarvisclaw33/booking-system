'use client';

import { Component, ReactNode } from 'react';
import { AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center dark:border-red-900/40 dark:bg-red-950/40">
          <div className="flex justify-center mb-4">
            <AlertCircle className="h-12 w-12 text-red-600 dark:text-red-300" />
          </div>
          <h2 className="text-lg font-semibold text-red-900 mb-2 dark:text-red-200">
            Ein Fehler ist aufgetreten
          </h2>
          <p className="text-sm text-red-700 mb-4 dark:text-red-300">
            {this.state.error?.message || 'Ein unbekannter Fehler ist aufgetreten'}
          </p>
          <Button
            onClick={() => {
              this.setState({ hasError: false, error: null });
              window.location.reload();
            }}
            variant="default"
          >
            Seite neu laden
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}
