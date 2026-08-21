import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import AuthLayout, { Brand } from '../../layouts/AuthLayout'
import { useAuth } from '../../hooks/useAuth.js'

const inputClass =
  'h-14 w-full rounded-xl border border-[#d9e0eb] bg-white px-5 text-base text-[#0b2146] outline-none transition placeholder:text-[#7b879b] focus:border-[#3162e9] focus:ring-4 focus:ring-[#3162e9]/10'

function ResetPassword() {
  const navigate = useNavigate()
  const { token } = useParams()
  const { resetPassword } = useAuth()
  const [status, setStatus] = useState('idle') // idle, loading, success, error
  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm()

  const onSubmit = async (data) => {
    setStatus('loading')
    try {
      await resetPassword(token, data.newPassword)
      setStatus('success')
      setTimeout(() => navigate('/login', { replace: true }), 2000)
    } catch {
      setStatus('error')
    }
  }

  return (
    <AuthLayout>
      <Brand />
      <div className="mt-8 w-full max-w-[522px] lg:mt-10">
        <h1 className="text-4xl font-bold tracking-[-0.05em] sm:text-[40px]">Restablecer contraseña</h1>
        <p className="mt-2 text-base text-[#65738c] sm:text-lg">
          Ingresa tu nueva contraseña.
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-7 space-y-4" noValidate>
          {status === 'success' && (
            <p className="rounded-xl bg-green-50 px-4 py-3 text-sm font-semibold text-green-600">
              Contraseña restablecida correctamente. Redirigiendo al login...
            </p>
          )}
          {status === 'error' && (
            <p className="rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-600">
              Token inválido o expirado. Solicita un nuevo enlace.
            </p>
          )}

          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-[#071b3b]">Nueva contraseña</span>
            <input
              className={inputClass}
              type="password"
              placeholder="Mínimo 6 caracteres"
              {...register('newPassword', {
                required: 'La nueva contraseña es requerida',
                minLength: { value: 6, message: 'Mínimo 6 caracteres' },
              })}
            />
            {errors.newPassword && (
              <span className="mt-1 block text-xs font-semibold text-red-500">
                {errors.newPassword.message}
              </span>
            )}
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-[#071b3b]">Confirmar nueva contraseña</span>
            <input
              className={inputClass}
              type="password"
              placeholder="Repite la nueva contraseña"
              {...register('confirmPassword', {
                required: 'Confirma la contraseña',
                validate: (value) => value === getValues('newPassword') || 'Las contraseñas no coinciden',
              })}
            />
            {errors.confirmPassword && (
              <span className="mt-1 block text-xs font-semibold text-red-500">
                {errors.confirmPassword.message}
              </span>
            )}
          </label>

          <button
            type="submit"
            disabled={isSubmitting || status === 'success'}
            className="mt-1 h-14 w-full rounded-xl bg-[#1e3a8a] cursor-pointer text-base font-semibold text-white transition hover:bg-[#182f70] focus:outline-none focus:ring-4 focus:ring-[#1e3a8a]/25 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {status === 'success' ? 'Redirigiendo...' : 'Restablecer contraseña'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            type="button"
            onClick={() => navigate('/login')}
            className="text-sm font-medium cursor-pointer text-[#315cf5] transition hover:text-[#183fca]"
          >
            Volver al login
          </button>
        </div>
      </div>
      <p className="mt-auto pt-8 text-center text-sm text-[#71809a] sm:text-base lg:pt-6">
        Uso exclusivo para personal autorizado de Recursos Humanos.
      </p>
    </AuthLayout>
  )
}

export default ResetPassword
