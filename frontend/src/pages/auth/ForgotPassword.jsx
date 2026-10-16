import { useState } from 'react'
import { useForm } from 'react-hook-form'
import AuthLayout, { Brand } from '../../layouts/AuthLayout'
import { useAuth } from '../../hooks/useAuth.js'

const inputClass =
  'h-14 w-full rounded-[8px] border border-border bg-surface px-5 text-base text-text-soft outline-none transition placeholder:text-text-soft focus:border-action focus:ring-4 focus:ring-action/10'

function ForgotPassword() {
  const { forgotPassword } = useAuth()
  const [status, setStatus] = useState('idle') // idle, loading, success, error
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm()

  const onSubmit = async (data) => {
    setStatus('loading')
    try {
      await forgotPassword(data.correo)
      setStatus('success')
    } catch {
      setStatus('error')
    }
  }

  return (
    <AuthLayout>
      <Brand />
      <div className="mt-8 w-full max-w-[522px] lg:mt-10">
        <h1 className="text-4xl font-bold tracking-[-0.05em] sm:text-[40px]">¿Olvidaste tu contraseña?</h1>
        <p className="mt-2 text-base text-text-soft sm:text-lg">
          Ingresa tu correo y te enviaremos un enlace para restablecerla.
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-7 space-y-4" noValidate>
          {status === 'success' && (
            <p className="rounded-[8px] bg-success-bg px-4 py-3 text-sm font-semibold text-success">
              Si el correo existe, recibirás un enlace para restablecer tu contraseña.
            </p>
          )}
          {status === 'error' && (
            <p className="rounded-[8px] bg-danger-bg px-4 py-3 text-sm font-semibold text-danger">
              Error al enviar el correo. Intenta de nuevo.
            </p>
          )}

          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-text-main">Correo electrónico</span>
            <input
              className={inputClass}
              type="email"
              placeholder="email@gmail.com"
              {...register('correo', {
                required: 'El correo es requerido',
                pattern: { value: /^\S+@\S+\.\S+$/, message: 'Ingresa un correo válido' },
              })}
            />
            {errors.correo && (
              <span className="mt-1 block text-xs font-semibold text-danger">
                {errors.correo.message}
              </span>
            )}
          </label>

          <button
            type="submit"
            disabled={isSubmitting || status === 'loading'}
            className="mt-1 h-14 w-full rounded-[8px] cursor-pointer bg-ink text-base font-semibold text-white transition hover:bg-ink focus:outline-none focus:ring-4 focus:ring-ink/25 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {status === 'loading' ? 'Enviando...' : 'Enviar enlace'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            type="button"
            onClick={() => window.history.back()}
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
  )
}

export default ForgotPassword
