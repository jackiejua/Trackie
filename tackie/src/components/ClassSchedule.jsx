import React from 'react';
import { format } from 'date-fns';

function ClassSchedule({ classes, todos }) {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const today = format(new Date(), 'EEEE'); // e.g., "Monday"

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

            {classesByDay[day].length === 0 ? (
              <p className="text-sm text-gray-500 italic">No classes scheduled.</p>
            ) : (
              classesByDay[day].map(cls => (
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
              ))
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default ClassSchedule;