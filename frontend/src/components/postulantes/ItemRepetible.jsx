import { X } from 'lucide-react'

function ItemRepetible({ title, onRemove, children }) {
  return <article className="relative rounded-[10px] border border-border bg-neutral-bg p-4 sm:p-5"><div className="mb-4 flex items-center justify-between gap-3"><h3 className="font-bold text-text-main">{title}</h3><button type="button" onClick={onRemove} className="flex h-9 w-9 items-center justify-center rounded-lg text-text-soft transition hover:bg-danger-bg hover:text-danger cursor-pointer" aria-label={`Eliminar ${title}`}><X className="h-5 w-5" /></button></div>{children}</article>
}

export default ItemRepetible
