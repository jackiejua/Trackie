import React from 'react';
import { format } from 'date-fns';

function ClassSchedule({ classes, todos, workShifts = [] }) {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const today = format(new Date(), 'EEEE'); // e.g., "Monday"

  const getShiftHours = (shift) => {
    const [startHour, startMinute] = shift.startTime.split(':').map(Number);
    const [endHour, endMinute] = shift.endTime.split(':').map(Number);
    const startTotalMinutes = startHour * 60 + startMinute;
    const endTotalMinutes = endHour * 60 + endMinute;
    const minutes = endTotalMinutes - startTotalMinutes;
    return minutes > 0 ? minutes / 60 : 0;
  };

  // 1. Group classes by the day they meet
  const classesByDay = days.reduce((acc, day) => {
    acc[day] = classes
      .filter(cls => cls.day.includes(day) || cls.day === 'MWF' && ['Monday', 'Wednesday', 'Friday'].includes(day) || cls.day === 'TTh' && ['Tuesday', 'Thursday'].includes(day))
      .sort((a, b) => (a.time > b.time ? 1 : -1)); // Sort by time
    return acc;
  }, {});

  // 2. Map assignments to their respective classes
  const todosByClassId = todos.reduce((acc, todo) => {
    if (todo.classId) {
      acc[todo.classId] = acc[todo.classId] || [];
      acc[todo.classId].push(todo);
    }
    return acc;
  }, {});

  const workShiftsByDay = days.reduce((acc, day) => {
    acc[day] = workShifts
      .filter((shift) => format(new Date(`${shift.date}T00:00:00`), 'EEEE') === day)
      .sort((a, b) => {
        if (a.date === b.date) {
          return a.startTime.localeCompare(b.startTime);
        }
        return a.date.localeCompare(b.date);
      });
    return acc;
  }, {});

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg">
      <h3 className="text-2xl font-semibold text-gray-800 mb-4 border-b pb-2">
        Weekly Schedule
      </h3>
      <p className="text-sm text-gray-600 mb-4">
        Today is <span className="font-bold text-indigo-600">{today}</span>
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {days.map(day => (
          <div key={day} className={`p-4 rounded-xl ${day === today ? 'bg-indigo-100 border-2 border-indigo-400' : 'bg-gray-100 border border-gray-200'}`}>
            <h4 className={`font-bold text-lg mb-2 ${day === today ? 'text-indigo-800' : 'text-gray-700'}`}>{day}</h4>

            {classesByDay[day].length === 0 && workShiftsByDay[day].length === 0 ? (
              <p className="text-sm text-gray-500 italic">No classes scheduled.</p>
            ) : (
              <>
                {classesByDay[day].map(cls => (
                  <div key={cls.id} className="mb-3 p-3 bg-white rounded-lg shadow-sm border-l-4 border-indigo-600">
                    <p className="font-semibold text-gray-900">{cls.name}</p>
                    <p className="text-sm text-gray-600">
                      {cls.time} | {cls.location}
                    </p>

                    {/* Related Assignments */}
                    {todosByClassId[cls.id]?.length > 0 && (
                      <div className="mt-2 text-xs text-gray-700">
                        <p className="font-medium text-indigo-600">Upcoming Assignments:</p>
                        <ul className="list-disc ml-4">
                          {todosByClassId[cls.id]
                            .filter(t => !t.isComplete)
                            .slice(0, 2) // Show max 2 upcoming assignments
                            .map(t => (
                              <li key={t.id} className="truncate">
                                {t.title} (Due: {format(new Date(t.deadline), 'MMM d')})
                              </li>
                            ))}
                        </ul>
                        {todosByClassId[cls.id].length > 2 && (
                          <p className="italic text-gray-500">...and {todosByClassId[cls.id].length - 2} more</p>
                        )}
                      </div>
                    )}
                  </div>
                ))}

                {workShiftsByDay[day].length > 0 && (
                  <div className="mt-2 p-3 rounded-lg border border-emerald-300 bg-emerald-50">
                    <p className="text-xs font-bold uppercase tracking-wide text-emerald-700 mb-2">Work Shifts</p>
                    <div className="space-y-2">
                      {workShiftsByDay[day].map((shift) => (
                        <div key={shift.id} className="text-sm text-emerald-900">
                          <p className="font-semibold">
                            {format(new Date(`${shift.date}T00:00:00`), 'MMM d')} | {shift.startTime} - {shift.endTime}
                          </p>
                          <p className="text-xs text-emerald-700">
                            {getShiftHours(shift).toFixed(1)} hrs{shift.location ? ` | ${shift.location}` : ''}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default ClassSchedule;