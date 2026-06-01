import { Component } from 'react';
import { Link } from 'react-router-dom';

export default class ErrorBoundary extends Component {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidUpdate(prevProps) {
    const { resetKey } = this.props;
    if (resetKey !== undefined && resetKey !== prevProps.resetKey && this.state.hasError) {
      this.setState({ hasError: false, error: null });
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 text-center">
          <h1 className="text-2xl font-bold text-sand-900 dark:text-amber-50 mb-2">Something went wrong</h1>
          <p className="text-sand-600 dark:text-sand-300 mb-6 max-w-md">
            {this.state.error?.message || 'Please try another page or refresh.'}
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <button
              type="button"
              className="btn-outline"
              onClick={() => this.setState({ hasError: false, error: null })}
            >
              Try again
            </button>
            <Link to="/" className="btn-primary" onClick={() => this.setState({ hasError: false, error: null })}>
              Go to Home
            </Link>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
