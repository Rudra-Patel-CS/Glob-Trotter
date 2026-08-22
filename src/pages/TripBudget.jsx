import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { supabase, SEED_EXPENSES } from '../lib/supabase'
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts'

export default function TripBudget() {
  const { id } = useParams()

  const [trip, setTrip] = useState(null)
  const [expenses, setExpenses] = useState([])
  const [budgetLimit, setBudgetLimit] = useState(1800)
  const [loading, setLoading] = useState(true)

  // Add / Edit expense modal
  const [showExpenseModal, setShowExpenseModal] = useState(false)
  const [category, setCategory] = useState('stay')
  const [amount, setAmount] = useState('')
  const [note, setNote] = useState('')

  const [stops, setStops] = useState([])
  const [stopActivities, setStopActivities] = useState([])

  useEffect(() => {
    async function loadBudget() {
      setLoading(true)
      try {
        const { data: tripData } = await supabase.from('trips').select('*').eq('id', id).single()
        setTrip(tripData || { id, name: 'Grand European Summer', currency: 'USD', start_date: '2026-09-01', end_date: '2026-09-14' })

        const { data: expData } = await supabase.from('expenses').select('*').eq('trip_id', id)
        setExpenses(expData && expData.length ? expData : SEED_EXPENSES.filter(e => e.trip_id === id))

        const { data: stopData } = await supabase.from('stops').select('*').eq('trip_id', id)
        const currentStops = stopData && stopData.length ? stopData : [
          { id: 's1', trip_id: id, city_id: 'c1', start_date: '2026-09-01', end_date: '2026-09-05' },
          { id: 's2', trip_id: id, city_id: 'c3', start_date: '2026-09-06', end_date: '2026-09-10' }
        ]
        setStops(currentStops)

        const stopIds = currentStops.map(s => s.id)
        const { data: saData } = await supabase.from('stop_activities').select('*')
        if (saData) {
          setStopActivities(saData.filter(sa => stopIds.includes(sa.stop_id)))
        }
      } catch (err) {
        console.error('Error loading budget:', err)
      } finally {
        setLoading(false)
      }
    }
    loadBudget()
  }, [id])

  const handleAddExpense = async (e) => {
    e.preventDefault()
    if (!amount) return
    const newExp = {
      id: 'e_' + Date.now(),
      trip_id: id,
      category,
      amount: Number(amount),
      note
    }
    await supabase.from('expenses').insert([newExp])
    setExpenses([...expenses, newExp])
    setShowExpenseModal(false)
    setAmount('')
    setNote('')
  }

  const handleDeleteExpense = async (expId) => {
    await supabase.from('expenses').delete().eq('id', expId)
    setExpenses(expenses.filter(e => e.id !== expId))
  }

  // Combine line-item expenses & stop activities for total cost calculation
  const totalLineExpenses = expenses.reduce((sum, e) => sum + Number(e.amount), 0)
  const totalActivityExpenses = stopActivities.reduce((sum, sa) => sum + Number(sa.cost_override || 0), 0)
  const totalCost = totalLineExpenses + totalActivityExpenses
  const daysCount = 14
  const avgCostPerDay = Math.round(totalCost / daysCount)
  const isOverbudget = totalCost > budgetLimit

  // Donut chart category data combining line expenses + activity expenses
  const CATEGORY_COLORS = {
    stay: '#0f766e',
    transport: '#fe7488',
    activity: '#bfab56',
    meal: '#6e5e0d',
    other: '#6e7977'
  }

  const categoryTotals = expenses.reduce((acc, e) => {
    acc[e.category] = (acc[e.category] || 0) + Number(e.amount)
    return acc
  }, {})
  if (totalActivityExpenses > 0) {
    categoryTotals['activity'] = (categoryTotals['activity'] || 0) + totalActivityExpenses
  }

  const donutData = Object.keys(categoryTotals).map(cat => ({
    name: cat.toUpperCase(),
    value: categoryTotals[cat],
    color: CATEGORY_COLORS[cat] || '#0f766e'
  }))

  // Dynamic Bar Chart: Compute daily spending aggregated from stop_activities scheduled_date & general expenses
  const dailyMap = {}
  stopActivities.forEach(sa => {
    const dateKey = sa.scheduled_date || '2026-09-02'
    dailyMap[dateKey] = (dailyMap[dateKey] || 0) + Number(sa.cost_override || 0)
  })

  // Distribute general line expenses evenly across active days
  const activeDates = Object.keys(dailyMap).length ? Object.keys(dailyMap).sort() : ['2026-09-01', '2026-09-02', '2026-09-03', '2026-09-04', '2026-09-05', '2026-09-06', '2026-09-07']
  const baseLinePerDay = Math.round(totalLineExpenses / Math.max(activeDates.length, 1))

  const barData = activeDates.map((dateStr, idx) => ({
    day: `Day ${idx + 1}`,
    date: dateStr,
    spend: (dailyMap[dateStr] || 0) + baseLinePerDay
  }))

  return (
    <div className="max-w-[1280px] mx-auto space-y-8 animate-fade">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link to={`/trips/${id}`} className="text-xs font-semibold text-primary hover:underline flex items-center gap-1">
            <span className="material-symbols-outlined text-sm">arrow_back</span>
            <span>Back to Itinerary</span>
          </Link>
          <h1 className="font-display font-bold text-3xl text-on-surface tracking-tight mt-1">
            Budget Breakdown: {trip?.name}
          </h1>
          <p className="font-sans text-sm text-on-surface-variant">
            Track expenses, daily averages & category allocations
          </p>
        </div>

        <button
          onClick={() => setShowExpenseModal(true)}
          className="bg-coral hover:bg-coral-hover text-white font-semibold text-xs px-5 py-2.5 rounded-lg shadow-sm hover:shadow-[0_10px_30px_rgba(251,113,133,0.35)] transition-all flex items-center gap-2 self-start sm:self-auto"
        >
          <span className="material-symbols-outlined text-base">add</span>
          <span>Add Line-Item Expense</span>
        </button>
      </div>

      {/* Overbudget Banner */}
      {isOverbudget && (
        <div className="p-4 bg-error-container text-on-error-container rounded-2xl border border-error/30 flex items-center justify-between shadow-xs animate-rise">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-2xl text-error">warning</span>
            <div>
              <h4 className="font-bold text-xs">Overbudget Alert Banner</h4>
              <p className="text-xs text-on-error-container/80">
                Total spend (${totalCost}) exceeds your target budget limit (${budgetLimit}) by ${totalCost - budgetLimit}.
              </p>
            </div>
          </div>
          <button
            onClick={() => setBudgetLimit(totalCost + 500)}
            className="px-3 py-1.5 bg-error text-white font-bold text-xs rounded-lg hover:bg-red-800 transition-colors"
          >
            Adjust Target
          </button>
        </div>
      )}

      {/* Metric Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-surface-container-lowest p-5 rounded-2xl border border-outline-variant/30 shadow-xs">
          <div className="text-xs text-on-surface-variant font-semibold">Total Trip Cost</div>
          <div className="font-display font-bold text-2xl text-primary mt-1">${totalCost} USD</div>
          <div className="text-[11px] text-on-surface-variant/80 mt-1">Across all logged items</div>
        </div>

        <div className="bg-surface-container-lowest p-5 rounded-2xl border border-outline-variant/30 shadow-xs">
          <div className="text-xs text-on-surface-variant font-semibold">Average Per Day</div>
          <div className="font-display font-bold text-2xl text-on-surface mt-1">${avgCostPerDay} USD/day</div>
          <div className="text-[11px] text-on-surface-variant/80 mt-1">Based on {daysCount} days duration</div>
        </div>

        <div className="bg-surface-container-lowest p-5 rounded-2xl border border-outline-variant/30 shadow-xs">
          <div className="text-xs text-on-surface-variant font-semibold">Target Budget Limit</div>
          <div className="font-display font-bold text-2xl text-on-surface mt-1">${budgetLimit} USD</div>
          <div className="text-[11px] text-on-surface-variant/80 mt-1">
            {isOverbudget ? '⚠️ Target Exceeded' : '✅ Within Budget'}
          </div>
        </div>
      </div>

      {/* Recharts Section: Donut Chart & Daily Bar Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Donut Chart: Spend by Category */}
        <div className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant/30 shadow-xs space-y-4">
          <div>
            <h3 className="font-display font-bold text-base text-on-surface">Category Breakdown (Donut Chart)</h3>
            <p className="text-xs text-on-surface-variant">Expense distribution by bucket</p>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={donutData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={60} outerRadius={85} paddingAngle={4}>
                  {donutData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`$${value}`, 'Amount']} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Bar Chart: Daily Spend */}
        <div className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant/30 shadow-xs space-y-4">
          <div>
            <h3 className="font-display font-bold text-base text-on-surface">Daily Spend Trend (Bar Chart)</h3>
            <p className="text-xs text-on-surface-variant">Daily expenditure pattern across itinerary</p>
          </div>

          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData}>
                <XAxis dataKey="day" stroke="#6e7977" fontSize={11} />
                <YAxis stroke="#6e7977" fontSize={11} />
                <Tooltip formatter={(val) => [`$${val}`, 'Daily Total']} />
                <Bar dataKey="spend" fill="#a93349" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Line-Item Expense List */}
      <div className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant/30 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-outline-variant/20 pb-3">
          <h3 className="font-display font-bold text-base text-on-surface">All Line-Item Expenses ({expenses.length})</h3>
          <button
            onClick={() => setShowExpenseModal(true)}
            className="text-xs font-bold text-primary hover:underline"
          >
            + Add Expense
          </button>
        </div>

        <div className="space-y-2">
          {expenses.map((exp) => (
            <div key={exp.id} className="p-3 bg-surface rounded-xl border border-outline-variant/20 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-lg bg-primary-container/10 text-primary flex items-center justify-center font-bold text-xs capitalize">
                  {exp.category[0].toUpperCase()}
                </span>
                <div>
                  <div className="font-bold text-xs text-on-surface">{exp.note || 'Expense Item'}</div>
                  <div className="text-[10px] text-on-surface-variant capitalize">Category: {exp.category}</div>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <span className="font-bold text-sm text-on-surface">${exp.amount}</span>
                <button
                  onClick={() => handleDeleteExpense(exp.id)}
                  className="p-1 text-error hover:bg-error-container/30 rounded transition-colors"
                >
                  <span className="material-symbols-outlined text-base">delete</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add Expense Modal */}
      {showExpenseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-on-background/60 backdrop-blur-xs animate-fade">
          <form onSubmit={handleAddExpense} className="bg-surface p-6 rounded-2xl shadow-2xl max-w-md w-full space-y-4 border border-outline-variant/30 animate-rise">
            <div className="flex items-center justify-between border-b border-outline-variant/20 pb-3">
              <h3 className="font-display font-bold text-lg text-on-surface">Add Expense Item</h3>
              <button type="button" onClick={() => setShowExpenseModal(false)} className="text-on-surface-variant hover:text-on-surface">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div>
              <label className="block text-xs font-semibold text-on-surface mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-surface-container-lowest border border-outline-variant/60 rounded-lg text-on-surface"
              >
                <option value="stay">Stay / Hotel</option>
                <option value="transport">Transport / Flight / Train</option>
                <option value="activity">Activity / Tour</option>
                <option value="meal">Meal / Dining</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-on-surface mb-1">Amount ($ USD)</label>
              <input
                type="number"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="150"
                className="w-full px-3 py-2 text-xs bg-surface-container-lowest border border-outline-variant/60 rounded-lg text-on-surface"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-on-surface mb-1">Note / Description</label>
              <input
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="e.g. Paris Hotel reservation"
                className="w-full px-3 py-2 text-xs bg-surface-container-lowest border border-outline-variant/60 rounded-lg text-on-surface"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-coral hover:bg-coral-hover text-white font-semibold text-xs py-2.5 rounded-lg shadow-sm"
            >
              Save Line Item
            </button>
          </form>
        </div>
      )}
    </div>
  )
}
