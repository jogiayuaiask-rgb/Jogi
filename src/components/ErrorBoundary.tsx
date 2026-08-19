import { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onReset?: () => void;
  title?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({ errorInfo });
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    if (this.props.onReset) {
      this.props.onReset();
    } else {
      window.location.reload();
    }
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-[#051919] text-white flex items-center justify-center p-4">
          <div className="glass-panel max-w-lg w-full bg-[#0D2E2E]/90 border border-rose-500/30 rounded-2xl p-8 shadow-2xl space-y-6 text-center">
            <div className="w-16 h-16 rounded-2xl bg-rose-500/20 text-[#E85D75] border border-rose-500/40 flex items-center justify-center mx-auto shadow-inner">
              <AlertTriangle className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h2 className="text-xl font-bold font-headline text-white">
                {this.props.title || "Something went wrong in application rendering"}
              </h2>
              <p className="text-xs text-white/70 font-body leading-relaxed">
                An unexpected error occurred while processing or rendering UI components. Our intelligent recovery system has caught the fault to prevent data loss.
              </p>
            </div>

            {this.state.error && (
              <div className="bg-black/40 p-3 rounded-xl border border-white/10 text-left font-mono text-[11px] text-rose-300 overflow-x-auto max-h-32">
                <code>{this.state.error.toString()}</code>
              </div>
            )}

            <div className="flex justify-center gap-3 pt-2">
              <button
                onClick={this.handleReset}
                className="px-5 py-2.5 rounded-xl bg-[#D4AF37] hover:bg-[#E5C158] text-[#051919] font-bold text-xs font-headline flex items-center gap-2 shadow-lg transition-all"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Reset Component</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
