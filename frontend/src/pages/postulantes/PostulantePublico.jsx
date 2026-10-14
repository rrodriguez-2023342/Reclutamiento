import FormularioPostulante from "../../components/postulantes/FormularioPostulante.jsx";

function PostulantePublico() {
  return (
    <div className="min-h-screen bg-bg flex flex-col">
      <header className="border-b border-border bg-surface px-6 py-4">
        <div className="mx-auto max-w-4xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-[8px] bg-action text-white">
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.1}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-[-0.04em] text-text-main">GH<span className="font-script">Corp.</span></h1>
              <p className="text-xs text-text-soft">Portal de Postulación</p>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 px-4 py-8">
        <div className="mx-auto max-w-4xl">
          <div className="mb-8 text-center">
            <h2 className="text-3xl font-bold tracking-[-0.04em] text-text-main">Formulario de Postulación</h2>
            <p className="mt-2 text-text-soft">
              Complete todos los campos requeridos. Los datos serán tratados con confidencialidad.
            </p>
          </div>

          <FormularioPostulante isPublic />

          <p className="mt-6 text-center text-sm text-text-soft">
            Al enviar este formulario, aceptas el tratamiento de tus datos personales según nuestra política de privacidad.
          </p>
        </div>
      </main>

      <footer className="border-t border-border bg-surface px-6 py-4">
        <p className="text-center text-sm text-text-soft">
          GH<span className="font-script">Corp.</span> - Sistema de Gestión de Reclutamiento
        </p>
      </footer>
    </div>
  );
}

export default PostulantePublico;
