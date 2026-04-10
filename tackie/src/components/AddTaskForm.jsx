import React, { useState } from 'react';
import { addGeneralTask } from '../db';

function AddTaskForm({ onClose }) {
  const [title, setTitle] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    await addGeneralTask(title);
    setTitle('');
    onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-bold text-gray-700 mb-1">Task Name</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g., Grocery Shopping"
          className="w-full border-2 border-gray-100 rounded-xl p-3 focus:border-[#a3e635] outline-none transition-colors"
          autoFocus
        />
      </div>
      <button
        type="submit"
        className="w-full bg-black text-[#a3e635] font-black py-3 rounded-xl hover:opacity-90 transition-opacity"
      >
        ADD TASK
      </button>
    </form>
  );
}

export default AddTaskForm;