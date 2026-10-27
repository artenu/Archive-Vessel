export function MasterPageHeader({ eyebrow = 'Admin', title, description, action }) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div>
        {eyebrow ? <p className="text-xs font-semibold uppercase text-brand-700">{eyebrow}</p> : null}
        <h1 className="mt-1 text-xl font-semibold text-slate-950">{title}</h1>
        {description ? <p className="mt-1 text-sm text-slate-500">{description}</p> : null}
      </div>
      {action}
    </div>
  )
}
