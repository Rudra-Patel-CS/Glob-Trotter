import { Link } from 'react-router-dom'

export default function EmptyState({ title, description, icon = 'explore_off', actionText, actionLink, onAction }) {
  return (
    <div className="flex flex-col items-center justify-center p-8 sm:p-12 text-center bg-surface-container-lowest border border-dashed border-outline-variant/50 rounded-2xl my-6 max-w-lg mx-auto">
      <div className="w-16 h-16 rounded-full bg-primary-container/10 text-primary flex items-center justify-center mb-4">
        <span className="material-symbols-outlined text-4xl">{icon}</span>
      </div>
      <h3 className="font-display font-bold text-lg text-on-surface mb-1">{title}</h3>
      <p className="font-sans text-sm text-on-surface-variant max-w-sm mb-6 leading-relaxed">{description}</p>
      
      {actionText && actionLink && (
        <Link
          to={actionLink}
          className="bg-coral hover:bg-coral-hover text-white font-semibold text-xs px-5 py-2.5 rounded-lg shadow-sm hover:shadow-[0_10px_30px_rgba(15,118,110,0.12)] hover:-translate-y-0.5 transition-all inline-flex items-center gap-2"
        >
          <span className="material-symbols-outlined text-base">add</span>
          {actionText}
        </Link>
      )}

      {actionText && onAction && !actionLink && (
        <button
          onClick={onAction}
          className="bg-coral hover:bg-coral-hover text-white font-semibold text-xs px-5 py-2.5 rounded-lg shadow-sm hover:shadow-[0_10px_30px_rgba(15,118,110,0.12)] hover:-translate-y-0.5 transition-all inline-flex items-center gap-2"
        >
          <span className="material-symbols-outlined text-base">add</span>
          {actionText}
        </button>
      )}
    </div>
  )
}
