import { cn } from '../../utils/cn'

export function Tabs({ tabs, activeTab, onChange }) {
  return (
    <div className="flex max-w-full flex-wrap gap-1 overflow-x-auto rounded-md bg-slate-100 p-1">
      {tabs.map((tab) => (
        <button
          key={tab.value}
          type="button"
          className={cn(
            'h-7 whitespace-nowrap rounded px-2.5 text-xs font-semibold text-slate-600 transition',
            activeTab === tab.value && 'bg-white text-brand-700 shadow-sm',
          )}
          onClick={() => onChange(tab.value)}
        >
          {tab.label}
        </button>
      ))}
    </div>
  )
}
