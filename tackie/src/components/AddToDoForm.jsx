import React, { useState, useEffect } from 'react';
import { addTodo, db } from '../db';
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
      const newTodo = {
        title,
        deadline: new Date(deadline), // Convert input string to Date object
        classId: classId ? parseInt(classId) : null, // Ensure ID is an integer
      };

      await addTodo(newTodo);
      console.log('Assignment added successfully:', newTodo);

      // Clear form and close the modal
      setTitle('');
      setDeadline('');
      setClassId('');
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
          placeholder="e.g., PWA Final Project Report"
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500"
        />
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
          className="px-4 py-2 bg-indigo-600 text-white font-semibold rounded-md shadow-md hover:bg-indigo-700 transition-colors"
        >
          Add Assignment
        </button>
      </div>
    </form>
  );
}

export default AddTodoForm;