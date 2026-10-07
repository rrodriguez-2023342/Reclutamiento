import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { ArrowLeft, Save } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  Field,
  Input,
  Select,
  Textarea,
} from "../../components/postulantes/formControls.jsx";
import {
  defaultPlazaValues,
  plazaSchema,
} from "../../validators/plazas.validator.js";

const MONEDAS = {
  QUETZAL: { label: "Quetzales (GTQ)", simbolo: "Q" },
  DOLAR: { label: "Dólares (USD)", simbolo: "$" },
};

function PlazaForm({
  title,
  submitLabel,
  initialValues,
  loading = false,
  serverError,
  onSubmit,
}) {
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(plazaSchema),
    defaultValues: initialValues || defaultPlazaValues,
  });

  useEffect(() => {
    if (initialValues) reset({ ...defaultPlazaValues, ...initialValues });
  }, [initialValues, reset]);

  const submitting = loading || isSubmitting;
  const tipoMoneda = watch("tipo_moneda") || "QUETZAL";
  const simbolo = MONEDAS[tipoMoneda]?.simbolo || "Q";

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-6 flex items-center gap-4">
        <button
          type="button"
          onClick={() => navigate("/plazas")}
          aria-label="Volver a plazas"
          className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-xl border border-[#dce3ee] bg-white text-[#071b3b] transition hover:bg-[#f0f4fa]"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold tracking-[-0.04em] text-[#071b3b] sm:text-3xl">
            {title}
          </h1>
          <p className="mt-1 text-[#5b6e8b]">
            Define la información y disponibilidad de la plaza.
          </p>
        </div>
      </div>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="rounded-[26px] bg-white p-6 shadow-[0_10px_24px_rgba(20,43,89,0.06)] sm:p-8"
      >
        {serverError && (
          <div
            role="alert"
            className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 font-semibold text-red-600"
          >
            {serverError}
          </div>
        )}
        <div className="grid gap-5">
          <Field label="Nombre de la plaza *" error={errors.nombre?.message}>
            <Input
              registration={register("nombre")}
              placeholder="Ej. Desarrollador Junior"
            />
          </Field>
          <Field label="Descripción" error={errors.descripcion?.message}>
            <Textarea
              registration={register("descripcion")}
              placeholder="Describe las responsabilidades y requisitos principales."
            />
          </Field>
          <Field label="Tipo de moneda" error={errors.tipo_moneda?.message}>
            <Select registration={register("tipo_moneda")}>
              <option value="QUETZAL">Quetzales (GTQ)</option>
              <option value="DOLAR">Dólares (USD)</option>
            </Select>
          </Field>
          <div className="grid gap-5 sm:grid-cols-2">
            <Field
              label={`Salario mínimo (${simbolo})`}
              error={errors.salario_min?.message}
            >
              <div className="relative">
                <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-base font-semibold text-[#5b6e8b]">
                  {simbolo}
                </span>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  {...register("salario_min", { valueAsNumber: true })}
                  placeholder="0.00"
                  className="h-14 w-full rounded-xl border border-[#dce3ee] bg-white pl-10 pr-4 text-base text-[#071b3b] outline-none transition focus:border-[#3162e9] focus:ring-2 focus:ring-[#3162e9]/15"
                />
              </div>
            </Field>
            <Field
              label={`Salario máximo (${simbolo})`}
              error={errors.salario_max?.message}
            >
              <div className="relative">
                <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-base font-semibold text-[#5b6e8b]">
                  {simbolo}
                </span>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  {...register("salario_max", { valueAsNumber: true })}
                  placeholder="0.00"
                  className="h-14 w-full rounded-xl border border-[#dce3ee] bg-white pl-10 pr-4 text-base text-[#071b3b] outline-none transition focus:border-[#3162e9] focus:ring-2 focus:ring-[#3162e9]/15"
                />
              </div>
            </Field>
          </div>
          <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-[#dce3ee] px-4 py-4 text-[#071b3b]">
            <input
              type="checkbox"
              {...register("activo")}
              className="h-5 w-5 cursor-pointer accent-[#3162e9]"
            />
            <span className="font-semibold">Plaza activa</span>
          </label>
        </div>
        <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={() => navigate("/plazas")}
            className="h-14 cursor-pointer rounded-2xl border border-[#dce3ee] px-6 font-bold text-[#5b6e8b] transition hover:bg-[#f0f4fa]"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="flex h-14 cursor-pointer items-center justify-center gap-2 rounded-2xl bg-[#3162e9] px-7 font-bold text-white transition hover:bg-[#183fca] disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Save className="h-5 w-5" />
            {submitting ? "Guardando..." : submitLabel}
          </button>
        </div>
      </form>
    </div>
  );
}

export default PlazaForm;
