import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import AuthLayout, { Brand } from "../../layouts/AuthLayout";
import { useAuth } from "../../hooks/useAuth.js";
import { PasswordInput } from "../../components/postulantes/formControls.jsx";

const inputClass =
  "h-14 w-full rounded-[8px] border border-border bg-surface px-5 text-base text-text-soft outline-none transition placeholder:text-text-soft focus:border-action focus:ring-4 focus:ring-action/10";

function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [error, setError] = useState(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm();

  const onSubmit = async (data) => {
    setError(null);
    try {
      const result = await login(data);
      // Si debe cambiar contraseña, ir a la página de cambio; si no, al dashboard
      const destination = result.mustChangePassword
        ? "/cambiar-password"
        : result.rol === "Colaborador"
          ? "/informes"
          : "/dashboard";
      navigate(destination, { replace: true, state: { fromLogin: true } });
    } catch (err) {
      setError(err.response?.data?.message || "Error al iniciar sesión");
    }
  };

  return (
    <AuthLayout>
      <Brand />
      <div className="mt-8 w-full max-w-[522px] lg:mt-10">
        <h1 className="text-4xl font-bold tracking-[-0.05em] sm:text-[40px]">
          ¡Bienvenido!
        </h1>
        <p className="mt-2 text-base text-text-soft sm:text-lg">
          Inicia sesión para registrar o evaluar candidatos.
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

          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-text-main">
              Correo o usuario
            </span>
            <input
              className={inputClass}
              type="text"
              placeholder="correo@empresa.com o usuario"
              {...register("usuario", {
                required: "El correo o usuario es requerido",
              })}
            />
            {errors.usuario && (
              <span className="mt-1 block text-xs font-semibold text-danger">
                {errors.usuario.message}
              </span>
            )}
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-text-main">
              Contraseña
            </span>
            <PasswordInput
              registration={register("password", {
                required: "La contraseña es requerida",
              })}
              placeholder="Ingresa tu contraseña"
              className={inputClass}
              error={errors.password?.message}
            />
          </label>

          <div className="flex flex-col gap-4 pt-0.5 text-sm sm:flex-row sm:items-center sm:justify-between sm:text-base">
            <label className="flex min-h-10 w-fit cursor-pointer items-center gap-2 py-1.5 text-text-soft">
              <input
                className="h-4 w-4 accent-action"
                defaultChecked
                name="remember"
                type="checkbox"
              />
              Recordarme
            </label>
            <a
              className="font-medium text-action transition hover:text-action"
              href="/recuperar"
            >
              ¿Olvidaste tu contraseña?
            </a>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-1 h-14 w-full rounded-[8px] bg-ink text-base font-semibold text-white transition cursor-pointer hover:bg-ink focus:outline-none focus:ring-4 focus:ring-ink/25 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? "Ingresando..." : "Iniciar sesión"}
          </button>
        </form>
      </div>
      <p className="mt-auto pt-8 text-center text-sm text-text-soft sm:text-base lg:pt-6">
        Uso exclusivo para personal autorizado de Recursos Humanos.
      </p>
    </AuthLayout>
  );
}

export default Login;
