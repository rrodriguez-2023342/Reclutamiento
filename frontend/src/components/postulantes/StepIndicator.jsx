const steps = [
  ["Datos personales", "Paso 1"],
  ["Puesto y perfil", "Paso 2"],
  ["Salud y economía", "Paso 3"],
  ["Datos familiares", "Paso 4"],
  ["Educación", "Paso 5"],
  ["Experiencia laboral", "Paso 6"],
  ["Referencias", "Paso 7"],
  ["Documentos", "Paso 8"],
];

function StepIndicator({ currentStep, maxStep, onGoTo }) {
  return (
    <nav
      className="overflow-x-auto rounded-[10px] border border-border bg-surface px-5 py-6 shadow-none"
      aria-label="Progreso del formulario"
    >
      <ol className="flex min-w-[1050px] items-center justify-between gap-3">
        {steps.map(([label, stepLabel], index) => {
          const step = index + 1;
          const available = step <= maxStep;
          const active = step === currentStep;
          const done = step < currentStep;
          return (
            <li key={step} className="flex min-w-0 flex-1 items-center gap-3">
              <button
                type="button"
                disabled={!available}
                onClick={() => onGoTo(step)}
                className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full font-bold transition cursor-pointer ${active ? "bg-action text-white" : done ? "bg-ink text-white" : "bg-neutral-bg text-text-soft"} disabled:cursor-default`}
              >
                {step}
              </button>
              <button
                type="button"
                disabled={!available}
                onClick={() => onGoTo(step)}
                className={`min-w-0 text-left text-sm cursor-pointer disabled:cursor-default ${active ? "text-text-main" : "text-text-soft"}`}
              >
                <span className="block font-bold">{stepLabel}</span>
                <span className="block leading-tight">{label}</span>
              </button>
              {step < steps.length && (
                <span className="h-px flex-1 bg-border" />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

export default StepIndicator;
