import { Component } from 'react'

class ErrorBoundary extends Component {
  state = { hasError: false }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error inesperado al mostrar la aplicación:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <main className="flex min-h-dvh items-center justify-center bg-bg p-6 font-sans text-text-main">
          <section className="w-full max-w-lg rounded-[10px] border border-danger bg-surface p-8 text-center">
            <h1 className="text-xl font-bold">Ocurrió un error inesperado</h1>
            <p role="alert" className="mt-3 text-text-soft">
              No se pudo mostrar esta pantalla. Recarga la página para intentarlo de nuevo.
            </p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="mt-5 rounded-[8px] bg-action px-5 py-3 font-semibold text-white transition hover:bg-ink"
            >
              Recargar página
            </button>
          </section>
        </main>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
