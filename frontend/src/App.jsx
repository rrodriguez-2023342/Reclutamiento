import { useEffect, useState } from 'react'
import axios from 'axios'

function App() {
  const [data, setData] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    axios
      .get('/api/health')
      .then((res) => setData(res.data))
      .catch((err) => setError(err.message))
  }, [])

  return (
    <main
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'system-ui, sans-serif',
      }}
    >
      <div
        style={{
          padding: '2rem 3rem',
          borderRadius: '12px',
          border: '1px solid #e5e4e7',
          boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
          textAlign: 'center',
        }}
      >
        <h1 style={{ marginTop: 0 }}>Conexión con el backend</h1>

        {error && (
          <p
            style={{
              color: '#b91c1c',
              background: '#fef2f2',
              padding: '8px 16px',
              borderRadius: '8px',
            }}
          >
            Error: {error}
          </p>
        )}

        {!error && !data && <p>Verificando conexión con el backend…</p>}

        {!error && data && (
          <>
            <p
              style={{
                display: 'inline-block',
                color: '#15803d',
                background: '#f0fdf4',
                padding: '8px 16px',
                borderRadius: '8px',
                fontWeight: 600,
              }}
            >
              Conexión OK
            </p>
            <p>Status: {data.status}</p>
            <p style={{ fontFamily: 'monospace' }}>Timestamp: {data.timestamp}</p>
          </>
        )}
      </div>
    </main>
  )
}

export default App