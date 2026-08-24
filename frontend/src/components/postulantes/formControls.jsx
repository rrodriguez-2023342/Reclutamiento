import { ChevronDown } from 'lucide-react'

export function Field({ label, error, children, className = '' }) {
  return <label className={`block ${className}`}><span className="mb-2 block text-sm font-semibold text-[#071b3b]">{label}</span>{children}{error && <span className="mt-1 block text-xs font-semibold text-red-500">{error}</span>}</label>
}

export function Input({ registration, error, ...props }) {
  return <><input {...registration} {...props} className="h-14 w-full rounded-xl border border-[#dce3ee] bg-white px-4 text-base text-[#071b3b] outline-none transition placeholder:text-[#91a0b7] focus:border-[#3162e9] focus:ring-2 focus:ring-[#3162e9]/15" />{error && <span className="mt-1 block text-xs font-semibold text-red-500">{error}</span>}</>
}

export function Textarea({ registration, error, ...props }) {
  return <><textarea {...registration} {...props} className="min-h-28 w-full rounded-xl border border-[#dce3ee] bg-white px-4 py-3 text-base text-[#071b3b] outline-none transition placeholder:text-[#91a0b7] focus:border-[#3162e9] focus:ring-2 focus:ring-[#3162e9]/15" />{error && <span className="mt-1 block text-xs font-semibold text-red-500">{error}</span>}</>
}

export function Select({ registration, error, children }) {
  return <><div className="relative"><select {...registration} className="h-14 w-full appearance-none rounded-xl border border-[#dce3ee] bg-white px-4 pr-10 text-base text-[#071b3b] outline-none transition focus:border-[#3162e9] focus:ring-2 focus:ring-[#3162e9]/15">{children}</select><ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#65758f]" /></div>{error && <span className="mt-1 block text-xs font-semibold text-red-500">{error}</span>}</>
}

export function BooleanField({ label, value, onChange }) {
  return <div><p className="mb-2 text-sm font-semibold text-[#071b3b]">{label}</p><div className="flex gap-5"><label className="flex items-center gap-2 text-sm text-[#5b6e8b]"><input type="radio" checked={value === true} onChange={() => onChange(true)} className="h-4 w-4 accent-[#3162e9]" />Sí</label><label className="flex items-center gap-2 text-sm text-[#5b6e8b]"><input type="radio" checked={value === false} onChange={() => onChange(false)} className="h-4 w-4 accent-[#3162e9]" />No</label></div></div>
}
