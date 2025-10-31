import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    this.setState({
      error,
      errorInfo
    });

    // Log to your error tracking service here
    // Example: Sentry.captureException(error);
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-2xl p-8 max-w-2xl w-full">
            <div className="flex items-center gap-4 mb-6">
              <div className="bg-red-100 p-4 rounded-full">
                <AlertCircle className="text-red-600" size={48} />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-800">
                  कुछ गलत हो गया
                </h1>
                <p className="text-xl text-gray-600">
                  Something went wrong
                </p>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <p className="text-gray-700 mb-4">
                <strong className="block mb-2">Hindi:</strong>
                डैशबोर्ड लोड करते समय एक त्रुटि हुई। कृपया पृष्ठ को ताज़ा करें या बाद में पुनः प्रयास करें।
              </p>
              <p className="text-gray-700">
                <strong className="block mb-2">English:</strong>
                An error occurred while loading the dashboard. Please refresh the page or try again later.
              </p>
            </div>

            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="bg-red-50 rounded-lg p-4 mb-6">
                <summary className="cursor-pointer font-semibold text-red-800 mb-2">
                  Error Details (Development Only)
                </summary>
                <pre className="text-xs overflow-auto bg-white p-3 rounded border border-red-200">
                  {this.state.error.toString()}
                  {this.state.errorInfo && this.state.errorInfo.componentStack}
                </pre>
              </details>
            )}

            <div className="flex gap-4">
              <button
                onClick={this.handleReload}
                className="flex-1 flex items-center justify-center gap-2 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition font-semibold"
              >
                <RefreshCw size={20} />
                <span>Refresh Page / पेज ताज़ा करें</span>
              </button>
            </div>

            <div className="mt-6 text-center text-sm text-gray-500">
              <p>
                If the problem persists, please contact support.<br />
                यदि समस्या बनी रहती है, तो कृपया सहायता से संपर्क करें।
              </p>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;