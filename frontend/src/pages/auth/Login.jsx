import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import AuthLayout, { Brand } from '../../layouts/AuthLayout'
import { useAuth } from '../../hooks/useAuth.js'

const inputClass =
  'h-14 w-full rounded-xl border border-[#d9e0eb] bg-white px-5 text-base text-[#0b2146] outline-none transition placeholder:text-[#7b879b] focus:border-[#3162e9] focus:ring-4 focus:ring-[#3162e9]/10'

function Login() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [error, setError] = useState(null)
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm()

  const onSubmit = async (data) => {
    setError(null)
    try {
      await login(data)
      navigate('/dashboard', { replace: true })
    } catch (err) {
      setError(err.response?.data?.message || 'Error al iniciar sesión')
    }
  }

  return (
    <AuthLayout>
      <Brand />
      <div className="mt-8 w-full max-w-[522px] lg:mt-10">
        <h1 className="text-4xl font-bold tracking-[-0.05em] sm:text-[40px]">¡Bienvenido!</h1>
        <p className="mt-2 text-base text-[#65738c] sm:text-lg">
          Inicia sesión para registrar o evaluar candidatos.
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-7 space-y-4" noValidate>
          {error && (
            <p className="rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-600">
              {error}
            </p>
          )}

          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-[#071b3b]">
              Correo electrónico
            </span>
            <input
              className={inputClass}
              type="email"
              placeholder="email@gmail.com"
              {...register('usuario', {
                required: 'El correo es requerido',
                pattern: {
                  value: /^\S+@\S+\.\S+$/,
                  message: 'Ingresa un correo válido',
                },
              })}
            />
            {errors.usuario && (
              <span className="mt-1 block text-xs font-semibold text-red-500">
                {errors.usuario.message}
              </span>
            )}
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-[#071b3b]">Contraseña</span>
            <input
              className={inputClass}
              type="password"
              placeholder="Ingresa tu contraseña"
              {...register('password', { required: 'La contraseña es requerida' })}
            />
            {errors.password && (
              <span className="mt-1 block text-xs font-semibold text-red-500">
                {errors.password.message}
              </span>
            )}
          </label>

          <div className="flex flex-col gap-4 pt-0.5 text-sm sm:flex-row sm:items-center sm:justify-between sm:text-base">
            <label className="flex w-fit cursor-pointer items-center gap-2 text-[#687893]">
              <input className="h-4 w-4 accent-[#3162e9]" defaultChecked name="remember" type="checkbox" />
              Recordarme
            </label>
            <a className="font-medium text-[#315cf5] transition hover:text-[#183fca]" href="#recuperar-contrasena">
              ¿Olvidaste tu contraseña?
            </a>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-1 h-14 w-full rounded-xl bg-[#1e3a8a] text-base font-semibold text-white transition cursor-pointer hover:bg-[#182f70] focus:outline-none focus:ring-4 focus:ring-[#1e3a8a]/25 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? 'Ingresando...' : 'Iniciar sesión'}
          </button>
        </form>
      </div>
      <p className="mt-auto pt-8 text-center text-sm text-[#71809a] sm:text-base lg:pt-6">
        Uso exclusivo para personal autorizado de Recursos Humanos.
      </p>
    </AuthLayout>
  )
}

export default Login