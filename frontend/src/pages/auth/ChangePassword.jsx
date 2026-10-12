import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import AuthLayout, { Brand } from "../../layouts/AuthLayout";
import { useAuth } from "../../hooks/useAuth.js";
import { PasswordInput } from "../../components/postulantes/formControls.jsx";

const inputClass =
  "h-14 w-full rounded-[8px] border border-border bg-surface px-5 text-base text-text-soft outline-none transition placeholder:text-text-soft focus:border-action focus:ring-4 focus:ring-action/10";

function ChangePassword() {
  const navigate = useNavigate();
  const { user, changePassword } = useAuth();
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm();

  const isFirstLogin = user?.mustChangePassword;
  const onSubmit = async (data) => {
    setError(null);
    try {
      await changePassword(data);
      setSuccess(true);
      setTimeout(() => navigate("/dashboard", { replace: true }), 1500);
    } catch (err) {
      setError(err.response?.data?.message || "Error al cambiar la contraseña");
    }
  };

  return (
    <AuthLayout>
      <Brand />
      <div className="mt-8 w-full max-w-[522px] lg:mt-10">
        <h1 className="text-4xl font-bold tracking-[-0.05em] sm:text-[40px]">
          {isFirstLogin ? "Establece tu contraseña" : "Cambiar contraseña"}
        </h1>
        <p className="mt-2 text-base text-text-soft sm:text-lg">
          {isFirstLogin
            ? "Ingresa la contraseña temporal y define tu nueva contraseña."
            : "Ingresa tu contraseña actual y la nueva."}
        </p>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="mt-7 space-y-4"
          noValidate
        >
          {error && (
            <p className="rounded-[8px] bg-danger-bg px-4 py-3 text-sm font-semibold text-danger">
              {error}
            </p>
          )}
          {success && (
            <p className="rounded-[8px] bg-success-bg px-4 py-3 text-sm font-semibold text-success">
              Contraseña actualizada correctamente. Redirigiendo...
            </p>
          )}

          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-text-main">
              {isFirstLogin ? "Contraseña temporal" : "Contraseña actual"}
            </span>
            <PasswordInput
              registration={register("currentPassword", {
                required: "Este campo es requerido",
              })}
              placeholder={
                isFirstLogin
                  ? "Ingresa la contraseña temporal"
                  : "Ingresa tu contraseña actual"
              }
              className={inputClass}
              error={errors.currentPassword?.message}
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-text-main">
              Nueva contraseña
            </span>
            <PasswordInput
              registration={register("newPassword", {
                required: "La nueva contraseña es requerida",
                minLength: { value: 6, message: "Mínimo 6 caracteres" },
              })}
              placeholder="Mínimo 6 caracteres"
              className={inputClass}
              error={errors.newPassword?.message}
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-text-main">
              Confirmar nueva contraseña
            </span>
            <PasswordInput
              registration={register("confirmPassword", {
                required: "Confirma la contraseña",
                validate: (value) =>
                  value === getValues("newPassword") ||
                  "Las contraseñas no coinciden",
              })}
              placeholder="Repite la nueva contraseña"
              className={inputClass}
              error={errors.confirmPassword?.message}
            />
          </label>

          <button
            type="submit"
            disabled={isSubmitting || success}
            className="mt-1 h-14 w-full rounded-[8px] bg-ink cursor-pointer text-base font-semibold text-white transition hover:bg-ink focus:outline-none focus:ring-4 focus:ring-ink/25 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting
              ? "Actualizando..."
              : isFirstLogin
                ? "Establecer contraseña"
                : "Actualizar contraseña"}
          </button>
        </form>
      </div>
      <p className="mt-auto pt-8 text-center text-sm text-text-soft sm:text-base lg:pt-6">
        Uso exclusivo para personal autorizado de Recursos Humanos.
      </p>
    </AuthLayout>
  );
}

export default ChangePassword;
