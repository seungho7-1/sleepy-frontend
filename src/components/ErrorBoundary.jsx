import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    // Check for chunk loading error (Vite lazy load failure)
    const isChunkLoadFailed = error?.message?.match(/Failed to fetch dynamically imported module/i) ||
                              error?.name === 'ChunkLoadError';
                              
    if (isChunkLoadFailed) {
      // Avoid infinite reload loop using session storage
      const chunkFailedKey = 'chunk_failed_reload';
      if (!sessionStorage.getItem(chunkFailedKey)) {
        sessionStorage.setItem(chunkFailedKey, 'true');
        window.location.reload();
        return;
      } else {
        sessionStorage.removeItem(chunkFailedKey); // reset after failing twice
      }
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', padding: '2rem', textAlign: 'center' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem', color: '#333' }}>
            페이지를 불러오는데 문제가 발생했습니다.
          </h2>
          <p style={{ color: '#666', marginBottom: '2rem' }}>
            일시적인 네트워크 오류이거나 새 업데이트가 반영 중일 수 있습니다.
          </p>
          <button 
            onClick={() => window.location.reload()}
            style={{ padding: '0.8rem 1.5rem', background: 'var(--primary-color)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}
          >
            새로고침
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
