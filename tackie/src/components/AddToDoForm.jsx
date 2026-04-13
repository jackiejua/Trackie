import React, { useState } from 'react';
import { addTodo, db, scheduleTodoReminder } from '../db';
import { useLiveQuery } from 'dexie-react-hooks';

/**
 * Component for adding a new assignment/to-do item.
 * @param {object} props - Component props.
 * @param {function} props.onClose - Function to close the modal after submission.
 */
function AddTodoForm({ onClose }) {
  const [title, setTitle] = useState('');
  const [deadline, setDeadline] = useState('');
  const [classId, setClassId] = useState('');
  const [notes, setNotes] = useState('');
  const [reminderOffset, setReminderOffset] = useState('');
  const [error, setError] = useState('');

  // Fetch all classes live from the database to populate the dropdown
  // Use useLiveQuery to automatically re-render if a new class is added elsewhere
  const classes = useLiveQuery(() => db.classes.toArray()) || [];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!title || !deadline) {
      setError('Title and Deadline are required fields.');
      return;
    }

    try {
      const deadlineDate = new Date(deadline);
      if (Number.isNaN(deadlineDate.getTime())) {
        setError('Please provide a valid deadline.');
        return;
      }

      const newTodo = {
        title,
        deadline: deadlineDate,
        classId: classId ? parseInt(classId) : null, // Ensure ID is an integer
        notes: notes.trim(),
      };

      const todoId = await addTodo(newTodo);

      if (reminderOffset) {
        const offsetMinutes = Number(reminderOffset);
        const remindAt = new Date(deadlineDate.getTime() - offsetMinutes * 60 * 1000);
        if (remindAt.getTime() > Date.now()) {
          await scheduleTodoReminder(todoId, remindAt.toISOString());
        }
      }

      console.log('Assignment added successfully:', newTodo);

      // Clear form and close the modal
      setTitle('');
      setDeadline('');
      setClassId('');
      setNotes('');
      setReminderOffset('');
      onClose();

    } catch (err) {
      console.error('Failed to add assignment:', err);
      setError('An error occurred while saving the assignment.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <p className="p-2 text-sm text-red-700 bg-red-100 border border-red-200 rounded">
          {error}
        </p>
      )}

      {/* Title Input */}
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700">Assignment Title</label>
        <input
          id="title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g., Special Topics Presentation..."
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500"
        />
      </div>

      <div>
        <label htmlFor="notes" className="block text-sm font-medium text-gray-700">Notes (Optional)</label>
        <textarea
          id="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Extra context, links, or reminders"
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500"
          rows={3}
        />
      </div>

      <div>
        <label htmlFor="reminder" className="block text-sm font-medium text-gray-700">Reminder (Optional)</label>
        <select
          id="reminder"
          value={reminderOffset}
          onChange={(e) => setReminderOffset(e.target.value)}
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
        >
          <option value="">-- No Reminder --</option>
          <option value="15">15 minutes before</option>
          <option value="60">1 hour before</option>
          <option value="1440">1 day before</option>
        </select>
      </div>

      {/* Deadline Input */}
      <div>
        <label htmlFor="deadline" className="block text-sm font-medium text-gray-700">Deadline</label>
        <input
          id="deadline"
          type="datetime-local"
          value={deadline}
          onChange={(e) => setDeadline(e.target.value)}
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500"
        />
      </div>

      {/* Class/Course Selection (Optional) */}
      <div>
        <label htmlFor="classId" className="block text-sm font-medium text-gray-700">Related Class (Optional)</label>
        <select
          id="classId"
          value={classId}
          onChange={(e) => setClassId(e.target.value)}
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
        >
          <option value="">-- Select a Class --</option>
          {classes.map((cls) => (
            <option key={cls.id} value={cls.id}>
              {cls.name}
            </option>
          ))}
        </select>
      </div>

      <div className="flex justify-end pt-2">
        <button
          type="submit"
          className="px-5 py-2 bg-black text-[#a3e635] font-black rounded-xl hover:opacity-90 transition-opacity"
        >
          Add Assignment
        </button>
      </div>
    </form>
  );
}

export default AddTodoForm;