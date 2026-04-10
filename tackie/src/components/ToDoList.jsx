import React from 'react';
import { db, toggleTodoCompletion, deleteTodo } from '../db';
import { useLiveQuery } from 'dexie-react-hooks';
import { formatDistanceToNow, isPast } from 'date-fns';

function TodoList({ todos }) {
  // Fetch classes to map classId to class name
  const classes = useLiveQuery(() => db.classes.toArray()) || [];
  const classMap = new Map(classes.map(cls => [cls.id, cls.name]));

  // Sort todos: Incomplete first, then by earliest deadline
  const sortedTodos = [...todos].sort((a, b) => {
    // Prioritize incomplete items
    if (a.isComplete && !b.isComplete) return 1;
    if (!a.isComplete && b.isComplete) return -1;

    // Then sort by deadline
    return new Date(a.deadline) - new Date(b.deadline);
  });

  const handleToggle = (id, isComplete) => {
    toggleTodoCompletion(id, isComplete);
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg h-full">
      <h3 className="text-2xl font-semibold text-gray-800 mb-4 border-b pb-2">
        Assignments & Deadlines
      </h3>

      <div className="space-y-4 max-h-[80vh] overflow-y-auto">
        {sortedTodos.length === 0 ? (
          <p className="text-gray-500 italic">No assignments yet! Time to add one.</p>
        ) : (
          sortedTodos.map(todo => {
            const deadlineDate = new Date(todo.deadline);
            const isOverdue = isPast(deadlineDate) && !todo.isComplete;
            const timeRemaining = formatDistanceToNow(deadlineDate, { addSuffix: true });
            const classLabel = classMap.get(todo.classId);

            return (
              <div 
                key={todo.id} 
                className={`flex items-start p-3 rounded-lg border transition-all ${
                  isOverdue ? 'bg-red-50 border-red-300' : 
                  todo.isComplete ? 'bg-green-50 border-green-300 opacity-70' : 
                  'bg-white border-gray-200 hover:shadow-md'
                }`}
              >
                <input
                  type="checkbox"
                  checked={todo.isComplete}
                  onChange={() => handleToggle(todo.id, !todo.isComplete)}
                  className="mt-1 w-5 h-5 text-indigo-600 bg-gray-100 border-gray-300 rounded focus:ring-indigo-500"
                />
                <div className="ml-3 flex-grow">
                  <p className={`font-medium ${todo.isComplete ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                    {todo.title}
                  </p>

                  {classLabel && (
                    <span className="text-xs font-medium text-indigo-600 bg-indigo-100 px-2 py-0.5 rounded-full mr-2">
                      {classLabel}
                    </span>
                  )}

                  <p className={`text-sm mt-1 ${isOverdue ? 'text-red-600 font-bold' : 'text-gray-500'}`}>
                    Due: {deadlineDate.toLocaleDateString()} at {deadlineDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} 
                    <span className="ml-1 text-xs italic">({timeRemaining})</span>
                  </p>

                  {todo.notes && (
                    <p className="text-xs text-gray-400 mt-1 italic">{todo.notes}</p>
                  )}
                </div>
                <button
                  onClick={() => deleteTodo(todo.id)}
                  className="ml-2 mt-0.5 text-gray-300 hover:text-red-500 transition-colors text-lg font-bold shrink-0"
                  aria-label={`Delete ${todo.title}`}
                >
                  ×
                </button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

export default TodoList;