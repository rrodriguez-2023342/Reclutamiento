import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import AuthLayout, { Brand } from '../../layouts/AuthLayout'
import { useAuth } from '../../hooks/useAuth.js'

const inputClass =
  'h-14 w-full rounded-xl border border-[#d9e0eb] bg-white px-5 text-base text-[#0b2146] outline-none transition placeholder:text-[#7b879b] focus:border-[#3162e9] focus:ring-4 focus:ring-[#3162e9]/10'

function ChangePassword() {
  const navigate = useNavigate()
  const { user, changePassword } = useAuth()
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)
  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm()

  const isFirstLogin = user?.mustChangePassword
  const onSubmit = async (data) => {
    setError(null)
    try {
      await changePassword(data)
      setSuccess(true)
      setTimeout(() => navigate('/dashboard', { replace: true }), 1500)
    } catch (err) {
      setError(err.response?.data?.message || 'Error al cambiar la contraseña')
    }
  }

  return (
    <AuthLayout>
      <Brand />
      <div className="mt-8 w-full max-w-[522px] lg:mt-10">
        <h1 className="text-4xl font-bold tracking-[-0.05em] sm:text-[40px]">
          {isFirstLogin ? 'Establece tu contraseña' : 'Cambiar contraseña'}
        </h1>
        <p className="mt-2 text-base text-[#65738c] sm:text-lg">
          {isFirstLogin
            ? 'Ingresa la contraseña temporal y define tu nueva contraseña.'
            : 'Ingresa tu contraseña actual y la nueva.'}
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-7 space-y-4" noValidate>
          {error && (
            <p className="rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-600">
              {error}
            </p>
          )}
          {success && (
            <p className="rounded-xl bg-green-50 px-4 py-3 text-sm font-semibold text-green-600">
              Contraseña actualizada correctamente. Redirigiendo...
            </p>
          )}

          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-[#071b3b]">
              {isFirstLogin ? 'Contraseña temporal' : 'Contraseña actual'}
            </span>
            <input
              className={inputClass}
              type="password"
              placeholder={isFirstLogin ? 'Ingresa la contraseña temporal' : 'Ingresa tu contraseña actual'}
              {...register('currentPassword', { required: 'Este campo es requerido' })}
            />
            {errors.currentPassword && (
              <span className="mt-1 block text-xs font-semibold text-red-500">
                {errors.currentPassword.message}
              </span>
            )}
          </label>

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
            disabled={isSubmitting || success}
            className="mt-1 h-14 w-full rounded-xl bg-[#1e3a8a] cursor-pointer text-base font-semibold text-white transition hover:bg-[#182f70] focus:outline-none focus:ring-4 focus:ring-[#1e3a8a]/25 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? 'Actualizando...' : isFirstLogin ? 'Establecer contraseña' : 'Actualizar contraseña'}
          </button>
        </form>
      </div>
      <p className="mt-auto pt-8 text-center text-sm text-[#71809a] sm:text-base lg:pt-6">
        Uso exclusivo para personal autorizado de Recursos Humanos.
      </p>
    </AuthLayout>
  )
}

export default ChangePassword
