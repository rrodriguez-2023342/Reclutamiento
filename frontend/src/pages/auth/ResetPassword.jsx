import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import AuthLayout, { Brand } from "../../layouts/AuthLayout";
import { useAuth } from "../../hooks/useAuth.js";
import { PasswordInput } from "../../components/postulantes/formControls.jsx";

const inputClass =
  "h-14 w-full rounded-[8px] border border-border bg-surface px-5 text-base text-text-soft outline-none transition placeholder:text-text-soft focus:border-action focus:ring-4 focus:ring-action/10";

function ResetPassword() {
  const navigate = useNavigate();
  const { token } = useParams();
  const { resetPassword } = useAuth();
  const [status, setStatus] = useState("idle"); // idle, loading, success, error
  const [errorMessage, setErrorMessage] = useState("");
  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm();

  const onSubmit = async (data) => {
    setStatus("loading");
    try {
      await resetPassword(token, data.newPassword);
      setStatus("success");
      setTimeout(() => navigate("/login", { replace: true }), 2000);
    } catch (error) {
      setStatus("error");
      setErrorMessage(
        error.response?.status === 401
          ? "El enlace es inválido o expiró. Solicita uno nuevo."
          : error.response?.data?.message ||
              "No fue posible restablecer la contraseña. Revisa tu conexión e inténtalo de nuevo.",
      );
    }
  };

  return (
    <AuthLayout>
      <Brand />
      <div className="mt-8 w-full max-w-[522px] lg:mt-10">
        <h1 className="text-4xl font-bold tracking-[-0.05em] sm:text-[40px]">
          Restablecer contraseña
        </h1>
        <p className="mt-2 text-base text-text-soft sm:text-lg">
          Ingresa tu nueva contraseña.
        </p>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="mt-7 space-y-4"
          noValidate
        >
          {status === "success" && (
            <p className="rounded-[8px] bg-success-bg px-4 py-3 text-sm font-semibold text-success">
              Contraseña restablecida correctamente. Redirigiendo al login...
            </p>
          )}
          {status === "error" && (
            <p className="rounded-[8px] bg-danger-bg px-4 py-3 text-sm font-semibold text-danger">
              {errorMessage}
            </p>
          )}

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
            disabled={isSubmitting || status === "success"}
            className="mt-1 h-14 w-full rounded-[8px] bg-ink cursor-pointer text-base font-semibold text-white transition hover:bg-ink focus:outline-none focus:ring-4 focus:ring-ink/25 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {status === "success"
              ? "Redirigiendo..."
              : "Restablecer contraseña"}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            type="button"
            onClick={() => navigate("/login")}
            className="inline-flex min-h-10 cursor-pointer items-center px-2 text-sm font-medium text-action transition hover:text-action"
          >
            Volver al login
          </button>
        </div>
      </div>
      <p className="mt-auto pt-8 text-center text-sm text-text-soft sm:text-base lg:pt-6">
        Uso exclusivo para personal autorizado de Recursos Humanos.
      </p>
    </AuthLayout>
  );
}

export default ResetPassword;
