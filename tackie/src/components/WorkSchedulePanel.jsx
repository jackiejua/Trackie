import React, { useMemo, useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { differenceInMinutes, endOfWeek, format, isWithinInterval, parseISO, startOfWeek } from 'date-fns';
import { addWorkShift, db, deleteWorkShift } from '../db';

const EMPTY_ITEMS = [];

function getShiftHours(startTime, endTime) {
  const [startHour, startMinute] = startTime.split(':').map(Number);
  const [endHour, endMinute] = endTime.split(':').map(Number);

  const startDate = new Date();
  startDate.setHours(startHour, startMinute, 0, 0);

  const endDate = new Date();
  endDate.setHours(endHour, endMinute, 0, 0);

  const minutes = differenceInMinutes(endDate, startDate);
  return minutes > 0 ? minutes / 60 : 0;
}

function WorkSchedulePanel() {
  const shiftsQuery = useLiveQuery(() => db.workShifts.orderBy('date').reverse().toArray());
  const shifts = shiftsQuery ?? EMPTY_ITEMS;

  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('17:00');
  const [location, setLocation] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');

  const weeklyStats = useMemo(() => {
    const rangeStart = startOfWeek(new Date(), { weekStartsOn: 0 });
    const rangeEnd = endOfWeek(new Date(), { weekStartsOn: 0 });

    const thisWeekShifts = shifts.filter((shift) => {
      const shiftDate = parseISO(shift.date);
      return isWithinInterval(shiftDate, { start: rangeStart, end: rangeEnd });
    });

    const dayTotals = thisWeekShifts.reduce((acc, shift) => {
      const key = format(parseISO(shift.date), 'EEEE');
      acc[key] = (acc[key] || 0) + getShiftHours(shift.startTime, shift.endTime);
      return acc;
    }, {});

    const totalHours = thisWeekShifts.reduce((sum, shift) => {
      return sum + getShiftHours(shift.startTime, shift.endTime);
    }, 0);

    return { totalHours, dayTotals, thisWeekShifts };
  }, [shifts]);

  const handleAddShift = async (e) => {
    e.preventDefault();
    setError('');

    try {
      await addWorkShift({ date, startTime, endTime, location, notes });
      setLocation('');
      setNotes('');
    } catch (err) {
      setError(err.message || 'Unable to save work shift.');
    }
  };

  return (
    <div className="space-y-6 text-black">
      <section className="bg-white border border-gray-200 rounded-3xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-black italic">Work Schedule</h2>
          <span className="text-xs font-bold uppercase tracking-wide text-gray-500">
            {format(new Date(), 'MMMM d')}
          </span>
        </div>

        {error && (
          <p className="mb-3 p-2 text-sm text-red-700 bg-red-100 border border-red-200 rounded">
            {error}
          </p>
        )}

        <form onSubmit={handleAddShift} className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label htmlFor="shift-date" className="block text-xs font-bold text-gray-600 mb-1">Date</label>
            <input
              id="shift-date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full border border-gray-300 rounded-xl p-2"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label htmlFor="shift-start" className="block text-xs font-bold text-gray-600 mb-1">Start</label>
              <input
                id="shift-start"
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full border border-gray-300 rounded-xl p-2"
              />
            </div>
            <div>
              <label htmlFor="shift-end" className="block text-xs font-bold text-gray-600 mb-1">End</label>
              <input
                id="shift-end"
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full border border-gray-300 rounded-xl p-2"
              />
            </div>
          </div>

          <div>
            <label htmlFor="shift-location" className="block text-xs font-bold text-gray-600 mb-1">Location (optional)</label>
            <input
              id="shift-location"
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Store #14"
              className="w-full border border-gray-300 rounded-xl p-2"
            />
          </div>

          <div>
            <label htmlFor="shift-notes" className="block text-xs font-bold text-gray-600 mb-1">Notes (optional)</label>
            <input
              id="shift-notes"
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Closing shift"
              className="w-full border border-gray-300 rounded-xl p-2"
            />
          </div>

          <div className="md:col-span-2 flex justify-end">
            <button
              type="submit"
              className="px-5 py-2 bg-black text-[#a3e635] font-black rounded-xl hover:opacity-90 transition-opacity"
            >
              Add Shift
            </button>
          </div>
        </form>
      </section>

      <section className="bg-[#161616] border border-gray-800 rounded-3xl p-6 text-white">
        <h3 className="text-xl font-black mb-4">This Week</h3>
        <p className="text-3xl font-black text-[#a3e635] mb-4">{weeklyStats.totalHours.toFixed(1)} hrs</p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {Object.keys(weeklyStats.dayTotals).length === 0 && (
            <p className="text-sm text-gray-400 col-span-full">No shifts logged for this week yet.</p>
          )}
          {Object.entries(weeklyStats.dayTotals).map(([day, hours]) => (
            <div key={day} className="bg-[#0f0f0f] border border-gray-700 rounded-2xl p-3">
              <p className="text-xs text-gray-400">{day}</p>
              <p className="text-lg font-black text-white">{hours.toFixed(1)}h</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-white border border-gray-200 rounded-3xl p-6">
        <h3 className="text-xl font-black italic mb-4">Logged Shifts</h3>
        <div className="space-y-3">
          {shifts.length === 0 && <p className="text-sm text-gray-500">No shifts logged yet.</p>}
          {shifts.map((shift) => {
            const hours = getShiftHours(shift.startTime, shift.endTime);
            return (
              <article key={shift.id} className="border border-gray-200 rounded-2xl p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-bold text-gray-900">
                      {format(parseISO(shift.date), 'EEEE, MMM d')} • {shift.startTime} - {shift.endTime}
                    </p>
                    <p className="text-sm text-gray-600 mt-1">{hours.toFixed(1)} hours</p>
                    {shift.location && <p className="text-xs text-gray-500 mt-1">Location: {shift.location}</p>}
                    {shift.notes && <p className="text-xs text-gray-500">{shift.notes}</p>}
                  </div>
                  <button
                    onClick={() => deleteWorkShift(shift.id)}
                    className="text-gray-400 hover:text-red-500 transition-colors text-lg font-bold"
                    aria-label="Delete shift"
                  >
                    ×
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      </section>
    </div>
  );
}

export default WorkSchedulePanel;
