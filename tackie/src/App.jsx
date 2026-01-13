import React, { useState, useEffect } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, getAllData } from './db';
import { requestNotificationPermission, checkAndNotify } from './components/notifications';
import AddTodoForm from './components/AddToDoForm';
import AddClassForm from './components/AddClassForm';
import ToDoList from './components/ToDoList';
import ClassSchedule from './components/ClassSchedule';

function App() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState('todo'); // 'todo' or 'class'

  const closeModal = () => setIsModalOpen(false);
  const openModal = (type) => {
    console.log('Opening modal for:', type);
    setModalType(type);
    setIsModalOpen(true);
  };

  // Fetch ALL data from the database. This data is guaranteed to be available OFFLINE.
  const { classes, todos } = useLiveQuery(getAllData) || { classes: [], todos: [] };

    useEffect(() => {
    requestNotificationPermission();

    const intervalId = setInterval(() => {
      checkAndNotify(todos);
    }, 300000); // Check every 5 minutes

    return () => clearInterval(intervalId);
  }, [todos]);

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <header className="text-3xl font-bold text-indigo-700 mb-6">TRACKIE</header>

      {/* Main Display Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ClassSchedule classes={classes} todos={todos} /> 
        </div>
        <div className="lg:col-span-1">
          <ToDoList todos={todos} /> 
        </div>
      </div>

      {/* Quick Add Buttons (FAB Split) */}
      <div
        className="fixed bottom-6 right-6 z-[9999] flex flex-col items-end space-y-3"
        style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 9999 }}
      >
        {/* Quick Add Class Button */}
        <button
          onClick={() => openModal('class')}
          className="w-12 h-12 rounded-full bg-pink-600 text-white shadow-xl hover:bg-pink-700 transition-colors flex items-center justify-center text-xl"
          aria-label="Quick Add Class"
          title="Add Class"
        >
          <i className="fa fa-book">+</i> {/* Placeholder icon, you can use a library like FontAwesome or simple SVG/text */}
        </button>

        {/* Quick Add To-Do Button */}
        <button
          onClick={() => openModal('todo')}
          className="w-14 h-14 rounded-full bg-indigo-600 text-white shadow-xl hover:bg-indigo-700 transition-colors flex items-center justify-center text-3xl font-light"
          aria-label="Quick Add To Do"
          title="Add Assignment"
        >
          +
        </button>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9998] p-4"
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9998,
            padding: 16,
          }}
        >
          <div
            className="relative bg-white p-6 rounded-xl shadow-2xl w-full max-w-lg transform transition-all"
            style={{ background: '#fff', borderRadius: 12, padding: 24, maxWidth: 640, width: '100%', position: 'relative' }}
          >
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              Add New {modalType === 'todo' ? 'Assignment' : 'Class'}
            </h2>
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 text-xl"
              aria-label="Close"
            >
              &times;
            </button>
            
            {/* Conditional Rendering of Forms */}
            {modalType === 'todo' && <AddTodoForm onClose={closeModal} />}
            {modalType === 'class' && <AddClassForm onClose={closeModal} />} {/* <-- NEW */}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;