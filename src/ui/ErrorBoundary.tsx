/**
 * ANT BRAIN — Global Error Boundary & Health Recovery
 * Prevents blank screens and fatal crashes by capturing unhandled React runtime errors,
 * displaying diagnostics, and providing graceful fallback recovery actions.
 */

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertOctagon, RotateCcw, Monitor, RefreshCw, Terminal } from 'lucide-react';

interface Props {
  children: ReactNode;
  onResetSimulation?: () => void;
  onFallbackTo2D?: () => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorDetailsOpen: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
    errorDetailsOpen: false,
  };

  public static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('Ant Brain ErrorBoundary captured error:', error, errorInfo);
    this.setState({ errorInfo });
  }

  private handleReload = (): void => {
    window.location.reload();
  };

  private handleRecover = (): void => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    if (this.props.onResetSimulation) {
      this.props.onResetSimulation();
    }
  };

  public render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div className="w-screen h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-6 select-none font-sans">
          <div className="max-w-xl w-full bg-slate-900 border border-rose-500/60 rounded-3xl p-6 shadow-2xl backdrop-blur-xl flex flex-col gap-4">
            {/* Header */}
            <div className="flex items-center gap-3 border-b border-slate-800 pb-3">
              <div className="p-2.5 rounded-2xl bg-rose-950/80 border border-rose-500/50 text-rose-400">
                <AlertOctagon className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-slate-100 font-heading tracking-wide">
                  ANTWIRE OBSERVATORY — DIAGNOSTIC RECOVERY
                </h1>
                <p className="text-xs text-rose-300">
                  A rendering or component lifecycle exception occurred. The failsafe system prevented a blank screen.
                </p>
              </div>
            </div>

            {/* Error Message */}
            <div className="bg-slate-950 p-3.5 rounded-2xl border border-rose-950 text-xs font-mono text-rose-200 overflow-x-auto">
              <p className="font-bold text-rose-400 mb-1">
                {this.state.error?.name || 'RuntimeError'}: {this.state.error?.message || 'Unknown Exception'}
              </p>
              {this.state.errorInfo?.componentStack && (
                <pre className="text-[10px] text-slate-500 max-h-36 overflow-y-auto mt-2">
                  {this.state.errorInfo.componentStack}
                </pre>
              )}
            </div>

            {/* Recovery Actions */}
            <div className="grid grid-cols-2 gap-2.5 pt-2">
              <button
                onClick={this.handleRecover}
                className="py-2.5 px-4 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg transition-all"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Recover & Restart Sim</span>
              </button>

              {this.props.onFallbackTo2D && (
                <button
                  onClick={() => {
                    this.props.onFallbackTo2D?.();
                    this.handleRecover();
                  }}
                  className="py-2.5 px-4 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg transition-all"
                >
                  <Monitor className="w-4 h-4" />
                  <span>Switch to 2D Canvas</span>
                </button>
              )}

              <button
                onClick={this.handleReload}
                className="col-span-2 py-2 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs flex items-center justify-center gap-2 transition-all"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Hard Reload Browser Window</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
