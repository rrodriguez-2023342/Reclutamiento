import { ChevronDown, Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { Controller } from "react-hook-form";

export function Field({ label, error, children, className = "" }) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-2 block text-sm font-semibold text-[#071b3b]">
        {label}
      </span>
      {children}
      {error && (
        <span className="mt-1 block text-xs font-semibold text-red-500">
          {error}
        </span>
      )}
    </label>
  );
}

export function RadioGroup({ control, name, options, className = "", disabled = false, required = false }) {
  return (
    <div className={className} role="radiogroup" aria-required={required}>
      {options.map((opt) => (
        <Controller
          key={opt.value}
          name={name}
          control={control}
          rules={{ required: required ? "Este campo es requerido" : false }}
          render={({ field: { onChange, onBlur, value } }) => (
            <label className="flex items-center gap-2 text-sm text-[#5b6e8b] cursor-pointer">
              <input
                type="radio"
                name={name}
                value={opt.value}
                checked={value === opt.value}
                onChange={(e) => {
                  const booleanValue = e.target.value === 'true';
                  onChange({ target: { ...e.target, value: booleanValue } });
                  onBlur?.(e);
                }}
                onBlur={onBlur}
                disabled={disabled}
                className="h-4 w-4 accent-[#3162e9] cursor-pointer"
              />
              <span>{opt.label}</span>
            </label>
          )}
        />
      ))}
    </div>
  );
}

export function Radio({ control, name, value, label, className = "", disabled = false, required = false }) {
  return (
    <Controller
      name={name}
      control={control}
      rules={{ required: required ? "Este campo es requerido" : false }}
      render={({ field: { onChange, onBlur, value } }) => (
        <label className={`flex items-center gap-2 text-sm text-[#5b6e8b] cursor-pointer ${className}`}>
          <input
            type="radio"
            name={name}
            value={value}
            checked={value === value}
            onChange={(e) => {
              const booleanValue = e.target.value === 'true';
              onChange({ target: { ...e.target, value: booleanValue } });
              onBlur?.(e);
            }}
            onBlur={onBlur}
            disabled={disabled}
            className="h-4 w-4 accent-[#3162e9] cursor-pointer"
          />
          <span>{label}</span>
        </label>
      )}
    />
  );
}

export function Input({ registration, error, ...props }) {
  return (
    <>
      <input
        {...registration}
        {...props}
        className="h-14 w-full rounded-xl border border-[#dce3ee] bg-white px-4 text-base text-[#071b3b] outline-none transition placeholder:text-[#91a0b7] focus:border-[#3162e9] focus:ring-2 focus:ring-[#3162e9]/15"
      />
      {error && (
        <span className="mt-1 block text-xs font-semibold text-red-500">
          {error}
        </span>
      )}
    </>
  );
}

export function Textarea({ registration, error, ...props }) {
  return (
    <>
      <textarea
        {...registration}
        {...props}
        className="min-h-28 w-full rounded-xl border border-[#dce3ee] bg-white px-4 py-3 text-base text-[#071b3b] outline-none transition placeholder:text-[#91a0b7] focus:border-[#3162e9] focus:ring-2 focus:ring-[#3162e9]/15"
      />
      {error && (
        <span className="mt-1 block text-xs font-semibold text-red-500">
          {error}
        </span>
      )}
    </>
  );
}

export function Select({ registration, error, children }) {
  return (
    <>
      <div className="relative">
        <select
          {...registration}
          className="h-14 w-full appearance-none rounded-xl border border-[#dce3ee] bg-white px-4 pr-10 text-base text-[#071b3b] outline-none transition focus:border-[#3162e9] focus:ring-2 focus:ring-[#3162e9]/15"
        >
          {children}
        </select>
        <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#65758f]" />
      </div>
      {error && (
        <span className="mt-1 block text-xs font-semibold text-red-500">
          {error}
        </span>
      )}
    </>
  );
}

export function BooleanField({ label, value, onChange }) {
  return (
    <div>
      <p className="mb-2 text-sm font-semibold text-[#071b3b]">{label}</p>
      <div className="flex gap-5">
        <label className="flex items-center gap-2 text-sm text-[#5b6e8b]">
          <input
            type="radio"
            checked={value === true}
            onChange={() => onChange(true)}
            className="h-4 w-4 accent-[#3162e9]"
          />
          Sí
        </label>
        <label className="flex items-center gap-2 text-sm text-[#5b6e8b]">
          <input
            type="radio"
            checked={value === false}
            onChange={() => onChange(false)}
            className="h-4 w-4 accent-[#3162e9]"
          />
          No
        </label>
      </div>
    </div>
  );
}

export function PasswordInput({
  registration,
  error,
  className = "",
  ...props
}) {
  const [show, setShow] = useState(false);
  return (
    <>
      <div className="relative">
        <input
          {...registration}
          type={show ? "text" : "password"}
          className={`${className} pr-11`}
          {...props}
        />
        <button
          type="button"
          onClick={() => setShow((v) => !v)}
          tabIndex={-1}
          className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-[#65758f] transition hover:text-[#071b3b] cursor-pointer"
        >
          {show ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
        </button>
      </div>
      {error && (
        <span className="mt-1 block text-xs font-semibold text-red-500">
          {error}
        </span>
      )}
    </>
  );
}
