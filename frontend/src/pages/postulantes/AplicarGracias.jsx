import { CheckCircle2 } from "lucide-react";

function AplicarGracias() {
  return (
    <div className="min-h-screen bg-bg flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-md text-center">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-success-bg">
          <CheckCircle2 className="h-12 w-12 text-success" strokeWidth={2} />
        </div>
        <h1 className="text-3xl font-bold tracking-[-0.04em] text-text-main">¡Postulación Enviada!</h1>
        <p className="mt-4 text-text-soft">
          Hemos recibido tu formulario correctamente. Si indicaste tu correo, recibirás un mensaje de confirmación.
        </p>
        <p className="mt-2 text-sm text-text-soft">
          Nuestro equipo revisará tu postulación y te contactará pronto.
        </p>
      </div>
    </div>
  );
}

export default AplicarGracias;
