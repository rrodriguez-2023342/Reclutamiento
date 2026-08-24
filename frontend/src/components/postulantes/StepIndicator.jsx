const steps = [
  ['Datos personales', 'Paso 1'], ['Puesto y perfil', 'Paso 2'], ['Salud y economía', 'Paso 3'], ['Datos familiares', 'Paso 4'], ['Educación', 'Paso 5'], ['Experiencia laboral', 'Paso 6'], ['Referencias', 'Paso 7'],
]

function StepIndicator({ currentStep, maxStep, onGoTo }) {
  return <nav className="overflow-x-auto rounded-[26px] bg-white px-5 py-6 shadow-[0_10px_24px_rgba(20,43,89,0.06)]" aria-label="Progreso del formulario"><ol className="flex min-w-[920px] items-center justify-between gap-3">{steps.map(([label, stepLabel], index) => { const step = index + 1; const available = step <= maxStep; const active = step === currentStep; const done = step < currentStep; return <li key={step} className="flex min-w-0 flex-1 items-center gap-3"><button type="button" disabled={!available} onClick={() => onGoTo(step)} className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full font-bold transition cursor-pointer ${active ? 'bg-[#3162e9] text-white' : done ? 'bg-[#1e3a8a] text-white' : 'bg-[#f0f4fa] text-[#65758f]'} disabled:cursor-default`}>{step}</button><button type="button" disabled={!available} onClick={() => onGoTo(step)} className={`min-w-0 text-left text-sm cursor-pointer disabled:cursor-default ${active ? 'text-[#071b3b]' : 'text-[#65758f]'}`}><span className="block font-bold">{stepLabel}</span><span className="block leading-tight">{label}</span></button>{step < steps.length && <span className="h-px flex-1 bg-[#dce3ee]" />}</li> })}</ol></nav>
}

export default StepIndicator
