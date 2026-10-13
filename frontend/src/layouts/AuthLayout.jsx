import { BriefcaseBusiness } from 'lucide-react'

function AuthLayout({ children }) {
  return (
    <main className="flex h-dvh items-center justify-center overflow-hidden bg-bg px-4 py-4 font-sans text-text-main sm:px-8 sm:py-6">
      <section className="grid h-full w-full max-w-[1296px] overflow-hidden rounded-[10px] border border-border bg-surface shadow-none lg:grid-cols-2">
        <div className="flex min-h-0 flex-col px-7 py-6 sm:px-12 sm:py-10 lg:px-16 lg:py-14">
          {children}
        </div>
        <aside className="relative hidden items-center justify-center overflow-hidden bg-ink px-10 py-10 text-center text-white lg:flex">
          <div className="absolute h-[420px] w-[420px] rounded-full bg-surface/[0.07] xl:h-[472px] xl:w-[472px]" />
          <div className="relative z-10 flex w-full max-w-[432px] flex-col items-center justify-center">
            <h2 className="text-3xl font-bold leading-tight tracking-[-0.04em] text-balance xl:text-[36px]">Digitaliza la contratación</h2>
            <p className="mt-3 max-w-[470px] text-lg leading-7 text-white/75 text-pretty">Llena las solicitudes de empleo en tiempo real. Agiliza tus evaluaciones presenciales hoy mismo.</p>
          </div>
        </aside>
      </section>
    </main>
  )
}

export function Brand() {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-14 w-14 items-center justify-center rounded-[10px] bg-action text-white"><BriefcaseBusiness className="h-7 w-7" strokeWidth={2.1} /></div>
      <div><p className="text-[22px] font-extrabold leading-none tracking-[-0.045em]">GH<span className="font-script">Corp.</span></p><p className="mt-1 text-sm text-text-soft">Gestión de Candidatos</p></div>
    </div>
  )
}

export default AuthLayout
