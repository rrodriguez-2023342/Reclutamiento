import { ChevronDown, Eye, EyeOff, Search, X } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { Controller } from "react-hook-form";

export function Field({ label, error, children, className = "" }) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-2 block text-sm font-semibold text-text-main">
        {label}
      </span>
      {children}
      {error && (
        <span className="mt-1 block text-xs font-semibold text-danger">
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
            <label className="flex items-center gap-2 text-sm text-text-soft cursor-pointer">
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
                className="h-4 w-4 accent-action cursor-pointer"
              />
              <span>{opt.label}</span>
            </label>
          )}
        />
      ))}
    </div>
  );
}

export function Radio({ control, name, value: radioValue, label, className = "", disabled = false, required = false }) {
  return (
    <Controller
      name={name}
      control={control}
      rules={{ required: required ? "Este campo es requerido" : false }}
      render={({ field: { onChange, onBlur, value } }) => (
        <label className={`flex items-center gap-2 text-sm text-text-soft cursor-pointer ${className}`}>
          <input
            type="radio"
            name={name}
            value={radioValue}
            checked={value === radioValue}
            onChange={(e) => {
              const booleanValue = e.target.value === 'true';
              onChange({ target: { ...e.target, value: booleanValue } });
              onBlur?.(e);
            }}
            onBlur={onBlur}
            disabled={disabled}
            className="h-4 w-4 accent-action cursor-pointer"
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
        className="h-14 w-full rounded-[8px] border border-border bg-surface px-4 text-base text-text-main outline-none transition placeholder:text-text-soft focus:border-action focus:ring-2 focus:ring-action/15"
      />
      {error && (
        <span className="mt-1 block text-xs font-semibold text-danger">
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
        className="min-h-28 w-full rounded-[8px] border border-border bg-surface px-4 py-3 text-base text-text-main outline-none transition placeholder:text-text-soft focus:border-action focus:ring-2 focus:ring-action/15"
      />
      {error && (
        <span className="mt-1 block text-xs font-semibold text-danger">
          {error}
        </span>
      )}
    </>
  );
}

export function Select({ registration, error, children, onChange, ...props }) {
  return (
    <>
      <div className="relative">
        <select
          {...registration}
          {...props}
          onChange={(event) => {
            registration?.onChange?.(event);
            onChange?.(event);
          }}
          className="h-14 w-full appearance-none rounded-[8px] border border-border bg-surface px-4 pr-10 text-base text-text-main outline-none transition focus:border-action focus:ring-2 focus:ring-action/15"
        >
          {children}
        </select>
        <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-text-soft" />
      </div>
      {error && (
        <span className="mt-1 block text-xs font-semibold text-danger">
          {error}
        </span>
      )}
    </>
  );
}

export function BooleanField({ label, value, onChange }) {
  return (
    <div>
      <p className="mb-2 text-sm font-semibold text-text-main">{label}</p>
      <div className="flex gap-5">
        <label className="flex items-center gap-2 text-sm text-text-soft">
          <input
            type="radio"
            checked={value === true}
            onChange={() => onChange(true)}
            className="h-4 w-4 accent-action"
          />
          Sí
        </label>
        <label className="flex items-center gap-2 text-sm text-text-soft">
          <input
            type="radio"
            checked={value === false}
            onChange={() => onChange(false)}
            className="h-4 w-4 accent-action"
          />
          No
        </label>
      </div>
    </div>
  );
}

export function AffiliationField({
  label,
  value,
  onChange,
  especificarRegistration,
}) {
  return (
    <div>
      <BooleanField label={label} value={value} onChange={onChange} />
      {value === true && (
        <Field label="Especifique" className="mt-3">
          <Input
            registration={especificarRegistration}
            maxLength={255}
          />
        </Field>
      )}
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
          className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-text-soft transition hover:text-text-main cursor-pointer"
        >
          {show ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
        </button>
      </div>
      {error && (
        <span className="mt-1 block text-xs font-semibold text-danger">
          {error}
        </span>
      )}
    </>
  );
}

function SearchableSelectInner({
  options,
  placeholder,
  value,
  onChange,
  onBlur,
  disabled,
  error,
  className,
  valueAsNumber,
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const ref = useRef(null);
  const inputRef = useRef(null);

  const selected = options.find((o) => String(o.value) === String(value ?? ""));
  const displayValue = selected ? selected.label : "";

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filtered = options.filter((o) =>
    o.label.toLowerCase().includes(query.toLowerCase()),
  );

  const handleSelect = (val) => {
    const finalValue = valueAsNumber && val !== "" ? Number(val) : val;
    onChange(finalValue);
    onBlur?.();
    setQuery("");
    setOpen(false);
  };

  const handleInputChange = (e) => {
    setQuery(e.target.value);
  };

  const handleFocus = () => {
    if (!disabled) setOpen(true);
  };

  const handleClick = () => {
    if (!disabled) {
      setOpen(true);
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  };

  const handleClear = (e) => {
    e.stopPropagation();
    onChange("");
    onBlur?.();
  };

  return (
    <div ref={ref} className={`relative ${className}`}>
      <div
        onClick={handleClick}
        className={`flex h-14 cursor-pointer items-center rounded-[10px] border border-border bg-surface px-4 text-base font-semibold text-text-main transition focus-within:border-action focus-within:ring-2 focus-within:ring-action/15 ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
      >
        <input
          ref={inputRef}
          value={open ? query : displayValue}
          onChange={handleInputChange}
          onFocus={handleFocus}
          placeholder={placeholder}
          className="h-full w-full bg-transparent outline-none placeholder:text-text-soft"
          readOnly={!open && !!displayValue}
          disabled={disabled}
          tabIndex={-1}
        />
        {displayValue && !open && !disabled && (
          <button
            type="button"
            onClick={handleClear}
            className="ml-1 cursor-pointer p-1 text-text-soft hover:text-text-main"
          >
            <X className="h-4 w-4" />
          </button>
        )}
        <ChevronDown className="ml-1 h-5 w-5 shrink-0 text-text-soft" />
        {open && <Search className="ml-1 h-5 w-5 shrink-0 text-text-soft" />}
      </div>
      {open && !disabled && (
        <ul className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-[8px] border border-border bg-surface py-1 shadow-lg">
          {filtered.length === 0 && (
            <li className="px-4 py-3 text-sm text-text-soft">
              Sin resultados
            </li>
          )}
          {filtered.map((o) => (
            <li
              key={o.value}
              role="option"
              aria-selected={String(o.value) === String(value ?? "")}
            >
              <button
                type="button"
                onMouseDown={(event) => event.preventDefault()}
                onClick={(event) => {
                  event.preventDefault();
                  handleSelect(o.value);
                }}
                className={`w-full cursor-pointer px-4 py-3 text-left text-base transition hover:bg-neutral-bg ${
                  String(o.value) === String(value ?? "")
                    ? "font-semibold text-action bg-neutral-bg"
                    : "text-text-main"
                }`}
              >
                {o.label}
              </button>
            </li>
          ))}
        </ul>
      )}
      {error && (
        <span className="mt-1 block text-xs font-semibold text-danger">
          {error}
        </span>
      )}
    </div>
  );
}

export function SearchableSelect({
  control,
  name,
  options,
  placeholder,
  error,
  disabled = false,
  className = "",
  rules,
  valueAsNumber = false,
}) {
  return (
    <Controller
      name={name}
      control={control}
      rules={rules}
      render={({ field: { onChange, onBlur, value }, fieldState: { error: fieldError } }) => (
        <SearchableSelectInner
          options={options}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          disabled={disabled}
          error={error || fieldError?.message}
          className={className}
          valueAsNumber={valueAsNumber}
        />
      )}
    />
  );
}
