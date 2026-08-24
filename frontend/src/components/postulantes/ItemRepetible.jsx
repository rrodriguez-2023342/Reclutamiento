import { X } from 'lucide-react'

function ItemRepetible({ title, onRemove, children }) {
  return <article className="relative rounded-2xl border border-[#dce3ee] bg-[#fbfcfe] p-4 sm:p-5"><div className="mb-4 flex items-center justify-between gap-3"><h3 className="font-bold text-[#071b3b]">{title}</h3><button type="button" onClick={onRemove} className="flex h-9 w-9 items-center justify-center rounded-lg text-[#65758f] transition hover:bg-red-50 hover:text-red-600 cursor-pointer" aria-label={`Eliminar ${title}`}><X className="h-5 w-5" /></button></div>{children}</article>
}

export default ItemRepetible
