import { useState, useEffect } from 'react';
import api from './lib/api';
import './App.css';

interface HealthResponse {
  status: string;
  timestamp: string;
  service: string;
}

interface APIInfo {
  name: string;
  version: string;
  description: string;
  endpoints: {
    docs: string;
    health: string;
  };
}

function App() {
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [apiInfo, setApiInfo] = useState<APIInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkAPI = async () => {
      try {
        setLoading(true);
        setError(null);

        // Test health endpoint
        const healthResponse = await api.health.get();
        if (healthResponse.data) {
          setHealth(healthResponse.data as HealthResponse);
        }

        // Test API info endpoint
        const infoResponse = await api.api.info.get();
        if (infoResponse.data) {
          setApiInfo(infoResponse.data as APIInfo);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to connect to API');
        console.error('API connection error:', err);
      } finally {
        setLoading(false);
      }
    };

    checkAPI();
  }, []);

  return (
    <div className="App">
      <header className="App-header">
        <h1>🦊 AttentiveId</h1>
        <p className="subtitle">Attentive Schedule Reservation System</p>

        <div className="status-container">
          <h2>🔗 API Connection Test</h2>

          {loading && <p className="loading">Connecting to API...</p>}

          {error && (
            <div className="error">
              <p>❌ Error: {error}</p>
              <p className="hint">
                Make sure the API server is running on port 3000
                <br />
                Run: <code>bun run dev:api</code>
              </p>
            </div>
          )}

          {!loading && !error && health && (
            <div className="success">
              <h3>✅ API Connected!</h3>
              <div className="info-box">
                <h4>Health Status:</h4>
                <pre>{JSON.stringify(health, null, 2)}</pre>
              </div>
              {apiInfo && (
                <div className="info-box">
                  <h4>API Information:</h4>
                  <pre>{JSON.stringify(apiInfo, null, 2)}</pre>
                </div>
              )}
              <div className="links">
                <a
                  href="http://localhost:3000/swagger"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="link-button"
                >
                  📚 View API Docs (Swagger)
                </a>
              </div>
            </div>
          )}
        </div>

        <div className="next-steps">
          <h3>✨ Type Safety Verified!</h3>
          <p>
            The Elysia backend and React frontend are now communicating
            with <strong>full end-to-end type safety</strong> via Eden Treaty! 🎉
          </p>
          <p className="hint">
            Try modifying the API endpoints and see TypeScript autocomplete in action!
          </p>
        </div>
      </header>
    </div>
  );
}

export default App;
