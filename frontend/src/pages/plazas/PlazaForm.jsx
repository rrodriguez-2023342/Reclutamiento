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
          className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-[8px] border border-border bg-surface text-text-main transition hover:bg-neutral-bg"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold tracking-[-0.04em] text-text-main sm:text-3xl">
            {title}
          </h1>
          <p className="mt-1 text-text-soft">
            Define la información y disponibilidad de la plaza.
          </p>
        </div>
      </div>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="rounded-[10px] border border-border bg-surface p-6 shadow-none sm:p-8"
      >
        {serverError && (
          <div
            role="alert"
            className="mb-6 rounded-[10px] border border-danger bg-danger-bg px-5 py-4 font-semibold text-danger"
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
                <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-base font-semibold text-text-soft">
                  {simbolo}
                </span>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  {...register("salario_min", { valueAsNumber: true })}
                  placeholder="0.00"
                  className="h-14 w-full rounded-[8px] border border-border bg-surface pl-10 pr-4 text-base text-text-main outline-none transition focus:border-action focus:ring-2 focus:ring-action/15"
                />
              </div>
            </Field>
            <Field
              label={`Salario máximo (${simbolo})`}
              error={errors.salario_max?.message}
            >
              <div className="relative">
                <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-base font-semibold text-text-soft">
                  {simbolo}
                </span>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  {...register("salario_max", { valueAsNumber: true })}
                  placeholder="0.00"
                  className="h-14 w-full rounded-[8px] border border-border bg-surface pl-10 pr-4 text-base text-text-main outline-none transition focus:border-action focus:ring-2 focus:ring-action/15"
                />
              </div>
            </Field>
          </div>
          <label className="flex cursor-pointer items-center gap-3 rounded-[8px] border border-border px-4 py-4 text-text-main">
            <input
              type="checkbox"
              {...register("activo")}
              className="h-5 w-5 cursor-pointer accent-action"
            />
            <span className="font-semibold">Plaza activa</span>
          </label>
        </div>
        <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={() => navigate("/plazas")}
            className="h-14 cursor-pointer rounded-[10px] border border-border px-6 font-bold text-text-soft transition hover:bg-neutral-bg"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="flex h-14 cursor-pointer items-center justify-center gap-2 rounded-[10px] bg-action px-7 font-bold text-white transition hover:bg-ink disabled:cursor-not-allowed disabled:opacity-60"
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
