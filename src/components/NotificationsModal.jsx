export default function NotificationsModal({ onClose }) {
  const notifications = [
    {
      id: 1,
      title: 'Trip Starting Soon!',
      message: 'Grand European Summer starts in 10 days. Check your activity schedule.',
      time: '2 hours ago',
      icon: 'flight_takeoff',
      type: 'reminder'
    },
    {
      id: 2,
      title: 'Budget Alert',
      message: 'Tokyo stop has reached 85% of planned daily budget.',
      time: '1 day ago',
      icon: 'account_balance_wallet',
      type: 'alert'
    },
    {
      id: 3,
      title: 'New Activity Added',
      message: 'Eiffel Tower Summit Access confirmed for Paris stop.',
      time: '3 days ago',
      icon: 'check_circle',
      type: 'info'
    }
  ]

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-on-background/40 backdrop-blur-xs animate-fade">
      <div className="bg-surface w-full max-w-sm h-full shadow-2xl border-l border-outline-variant/30 flex flex-col animate-rise">
        {/* Header */}
        <div className="p-4 border-b border-outline-variant/30 flex items-center justify-between bg-surface-container-lowest">
          <div className="flex items-center gap-2 font-display font-bold text-base text-primary">
            <span className="material-symbols-outlined text-coral">notifications</span>
            <span>Notifications</span>
          </div>
          <button onClick={onClose} className="p-1 rounded-full text-on-surface-variant hover:bg-surface-container">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {notifications.map((n) => (
            <div key={n.id} className="p-3 bg-surface-container-lowest rounded-xl border border-outline-variant/20 shadow-xs flex items-start gap-3">
              <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${
                n.type === 'alert' ? 'bg-error-container text-error' : n.type === 'reminder' ? 'bg-secondary-container/30 text-secondary' : 'bg-primary-container/20 text-primary'
              }`}>
                <span className="material-symbols-outlined text-lg">{n.icon}</span>
              </div>
              <div className="flex-1">
                <h5 className="font-semibold text-xs text-on-surface">{n.title}</h5>
                <p className="text-xs text-on-surface-variant mt-0.5 leading-snug">{n.message}</p>
                <span className="text-[10px] text-outline mt-1.5 block">{n.time}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
