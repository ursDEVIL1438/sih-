import React from 'react';

interface State { hasError: boolean; error?: any; }

export class ErrorBoundary extends React.Component<{ children: React.ReactNode }, State> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: undefined };
  }

  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }

  componentDidCatch(error: any, info: any) {
    // Log to console for developer
    console.error('[ErrorBoundary] Caught error:', error, info);
  }

  render() {
    if (this.state.hasError) {
      const err = this.state.error;
      return (
        <div style={{ padding: 20, color: '#fff', background: '#06070a', height: '100%', overflow: 'auto' }}>
          <h2 style={{ color: '#ff6b6b' }}>Application Error</h2>
          <pre style={{ whiteSpace: 'pre-wrap', color: '#f8f8f2' }}>{String(err && (err.stack || err.message || err))}</pre>
          <p style={{ color: '#9ca3af' }}>This error was captured by an Error Boundary. Please paste the stack above into the chat so I can fix it.</p>
        </div>
      );
    }
    return this.props.children as any;
  }
}

export default ErrorBoundary;
