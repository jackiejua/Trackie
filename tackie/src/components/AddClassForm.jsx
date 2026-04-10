import React, { useState } from 'react';
import { addClass } from '../db';

/**
 * Component for adding a new class/course item.
 * @param {object} props - Component props.
 * @param {function} props.onClose - Function to close the modal after submission.
 */
function AddClassForm({ onClose }) {
  const [name, setName] = useState('');
  const [day, setDay] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [location, setLocation] = useState('');
  const [error, setError] = useState('');

  // Define static options for class days
  const dayOptions = [
    'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!name || !day || !startTime || !endTime) {
      setError('Class Name, Day, Start Time, and End Time are required.');
      return;
    }

    if (startTime >= endTime) {
      setError('End time must be after start time.');
      return;
    }

    try {
      const newClass = {
        name,
        day,
        time: `${startTime} - ${endTime}`,
        startTime,
        endTime,
        location: location || 'TBD', // Default if location is left empty
      };

      await addClass(newClass);
      console.log('Class added successfully:', newClass);

      // Clear form and close the modal
      setName('');
      setDay('');
      setStartTime('');
      setEndTime('');
      setLocation('');
      onClose();

    } catch (err) {
      console.error('Failed to add class:', err);
      setError('An error occurred while saving the class.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <p className="p-2 text-sm text-red-700 bg-red-100 border border-red-200 rounded">
          {error}
        </p>
      )}

      {/* Class Name Input */}
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">Class Name</label>
        <input
          id="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g., Software Engineering"
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Day Input (Multi-select is complex, using a simple dropdown for now) */}
        <div>
          <label htmlFor="day" className="block text-sm font-medium text-gray-700">Day(s)</label>
          <select
            id="day"
            value={day}
            onChange={(e) => setDay(e.target.value)}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
          >
            <option value="">-- Select Day(s) --</option>
            {dayOptions.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
             <option value="MWF">Monday, Wednesday, Friday</option>
             <option value="TTh">Tuesday, Thursday</option>
          </select>
        </div>

        {/* Start Time Input */}
        <div>
          <label htmlFor="startTime" className="block text-sm font-medium text-gray-700">Start Time</label>
          <input
            id="startTime"
            type="time"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        <div>
          <label htmlFor="endTime" className="block text-sm font-medium text-gray-700">End Time</label>
          <input
            id="endTime"
            type="time"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
      </div>

      {/* Location Input */}
      <div>
        <label htmlFor="location" className="block text-sm font-medium text-gray-700">Location (Optional)</label>
        <input
          id="location"
          type="text"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="e.g., Building C, Room 301"
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500"
        />
      </div>

      <div className="flex justify-end pt-2">
        <button
          type="submit"
          className="px-5 py-2 bg-black text-[#a3e635] font-black rounded-xl hover:opacity-90 transition-opacity"
        >
          Add Class
        </button>
      </div>
    </form>
  );
}

export default AddClassForm;