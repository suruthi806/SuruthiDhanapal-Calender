import React, { useState, useEffect } from 'react'
import {
  startOfMonth, endOfMonth, startOfWeek, endOfWeek,
  addDays, format, addMonths, subMonths, isSameMonth,
  isSameDay
} from 'date-fns'
import eventsData from '../events.json'

const toKey = (date) => format(date, 'yyyy-MM-dd')

function buildMonthMatrix(currentMonth) {
  const startMonth = startOfMonth(currentMonth)
  const endMonth = endOfMonth(currentMonth)
  const startDate = startOfWeek(startMonth, { weekStartsOn: 0 })
  const endDate = endOfWeek(endMonth, { weekStartsOn: 0 })

  const rows = []
  let day = startDate
  while (day <= endDate) {
    const week = []
    for (let i = 0; i < 7; i++) {
      week.push(day)
      day = addDays(day, 1)
    }
    rows.push(week)
  }
  return rows
}

function parseEvents(list) {
  const map = {}
  list.forEach(ev => {
    const dateKey = ev.date
    if (!map[dateKey]) map[dateKey] = []
    map[dateKey].push(ev)
  })
  return map
}

export default function Calendar() {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [today] = useState(new Date())
  const [eventsMap, setEventsMap] = useState({})

  useEffect(() => {
    setEventsMap(parseEvents(eventsData))
  }, [])

  const monthMatrix = buildMonthMatrix(currentMonth)
  const monthLabel = format(currentMonth, 'MMMM yyyy')

  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1))
  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1))

  const detectConflicts = (evs) => {
    if (!evs || evs.length < 2) return {}
    const conflicts = {}
    for (let i = 0; i < evs.length; i++) {
      for (let j = i + 1; j < evs.length; j++) {
        const a = evs[i], b = evs[j]
        if (a.time && b.time && a.time === b.time) {
          conflicts[i] = true
          conflicts[j] = true
        }
      }
    }
    return conflicts
  }

  return (
    <div className="calendar-card">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
        <div className="flex items-center gap-2 sm:order-1 order-2 mt-2 sm:mt-0">
          <button onClick={prevMonth} className="bg-blue-500 text-white px-3 py-1 rounded-md font-semibold hover:bg-blue-600">
            &lt; Prev
          </button>
          <button onClick={nextMonth} className="bg-blue-500 text-white px-3 py-1 rounded-md font-semibold hover:bg-blue-600">
            Next &gt;
          </button>
        </div>
        <div className="text-xl font-bold sm:order-2 order-1 text-center sm:text-left">{monthLabel}</div>
      </div>

      <div className="weekday-row">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
          <div key={d} className="weekday">{d}</div>
        ))}
      </div>

      <div className="month-grid">
        {monthMatrix.map((week, wi) => (
          <div key={wi} className="week-row">
            {week.map((day, di) => {
              const dayKey = toKey(day)
              const dayEvents = eventsMap[dayKey] || []
              const conflicts = detectConflicts(dayEvents)
              const isToday = isSameDay(day, today)
              const inMonth = isSameMonth(day, currentMonth)

              return (
                <div key={di} className={`day-cell ${inMonth ? '' : 'muted'}`}>
                  <div className={`date-number ${isToday ? 'today' : ''}`}>{format(day, 'd')}</div>
                  <div className="events-list">
                    {dayEvents.slice(0, 3).map((ev, idx) => (
                      <div key={idx} className={`event-pill ${conflicts[idx] ? 'conflict' : ''}`}>
                        <div className="ev-title">{ev.title}</div>
                        {ev.time && <div className="ev-time">{ev.time}</div>}
                      </div>
                    ))}
                    {dayEvents.length > 3 && (
                      <div className="more-indicator">+{dayEvents.length - 3} more</div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        ))}
      </div>

      <div className="legend">
        <div><span className="legend-box"></span> Event</div>
        <div><span className="legend-box conflict-box"></span> Conflict</div>
        <div><span className="legend-box today-box"></span> Today</div>
      </div>
    </div>
  )
}
