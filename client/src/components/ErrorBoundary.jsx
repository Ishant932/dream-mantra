import { Component } from 'react';
import { Link } from 'react-router-dom';
import { isChunkLoadError } from '../utils/lazyWithRetry';

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

  handleRetry = () => {
    if (isChunkLoadError(this.state.error)) {
      window.location.reload();
      return;
    }
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      const staleBuild = isChunkLoadError(this.state.error);
      return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 text-center">
          <h1 className="text-2xl font-bold text-sand-900 dark:text-amber-50 mb-2">Something went wrong</h1>
          <p className="text-sand-600 dark:text-sand-300 mb-6 max-w-md">
            {staleBuild
              ? 'The site was just updated. Refresh the page to load the latest version.'
              : this.state.error?.message || 'Please try another page or refresh.'}
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <button
              type="button"
              className="btn-primary"
              onClick={this.handleRetry}
            >
              {staleBuild ? 'Refresh page' : 'Try again'}
            </button>
            <Link to="/" className="btn-outline" onClick={() => this.setState({ hasError: false, error: null })}>
              Go to Home
            </Link>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
