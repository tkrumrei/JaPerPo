import { Component, type ErrorInfo, type ReactNode } from 'react';
import { Button } from './Button';
import { Card, CardDescription, CardTitle } from './Card';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    if (import.meta.env.DEV) {
      console.error('ErrorBoundary:', error, info);
    }
  }

  private handleReset = () => {
    this.setState({ error: null });
  };

  render() {
    if (!this.state.error) return this.props.children;
    if (this.props.fallback) return this.props.fallback;
    return (
      <div className="flex min-h-[60vh] items-center justify-center p-6">
        <Card className="max-w-md">
          <CardTitle>Etwas ist schiefgelaufen</CardTitle>
          <CardDescription className="mt-2">
            Es ist ein unerwarteter Fehler aufgetreten. Bitte versuche es erneut.
          </CardDescription>
          <pre className="mt-3 max-h-32 overflow-auto rounded-xl bg-surface p-3 text-xs text-text-muted">
            {this.state.error.message}
          </pre>
          <div className="mt-4 flex justify-end">
            <Button onClick={this.handleReset}>Erneut versuchen</Button>
          </div>
        </Card>
      </div>
    );
  }
}
