import React, { useState, useEffect } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, deleteClass, deleteTodo, deleteTask, getPendingReminders, markReminderSent } from './db';
import { checkAndNotify, requestNotificationPermission } from './components/notifications';

// Component Imports (Ensure these files exist in your /components folder)
import AddClassForm from './components/AddClassForm';
import AddTodoForm from './components/AddToDoForm';
import AddTaskForm from './components/AddTaskForm';
import ClassSchedule from './components/ClassSchedule';
import TodoList from './components/ToDoList';
import ProductivityPanel from './components/ProductivityPanel';
import WorkSchedulePanel from './components/WorkSchedulePanel';
import TrackieLogo from './images/TrackieLogo.png';

const EMPTY_ITEMS = [];

export default function App() {
  const [activeTab, setActiveTab] = useState('Home');
  const [modalType, setModalType] = useState(null); // 'class', 'todo', or 'task'
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  
  // --- TIMER STATE ---
  const [secondsLeft, setSecondsLeft] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);

  // --- DATABASE QUERIES ---
  const classesQuery = useLiveQuery(() => db.classes.toArray());
  const todosQuery = useLiveQuery(() => db.todos.toArray());
  const tasksQuery = useLiveQuery(() => db.tasks.toArray());
  const workShiftsQuery = useLiveQuery(() => db.workShifts.toArray());
  const classes = classesQuery ?? EMPTY_ITEMS;
  const todos = todosQuery ?? EMPTY_ITEMS;
  const tasks = tasksQuery ?? EMPTY_ITEMS;
  const workShifts = workShiftsQuery ?? EMPTY_ITEMS;

  useEffect(() => {
    const onOnline = () => setIsOnline(true);
    const onOffline = () => setIsOnline(false);
    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);

    return () => {
      window.removeEventListener('online', onOnline);
      window.removeEventListener('offline', onOffline);
    };
  }, []);

  useEffect(() => {
    requestNotificationPermission();
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setModalType(null);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    checkAndNotify(todos);
    const interval = setInterval(() => checkAndNotify(todos), 60 * 1000);
    return () => clearInterval(interval);
  }, [todos]);

  useEffect(() => {
    const sendScheduledReminders = async () => {
      if (typeof window === 'undefined' || !('Notification' in window)) {
        return;
      }

      if (Notification.permission !== 'granted') {
        return;
      }

      const reminders = await getPendingReminders(new Date());
      for (const reminder of reminders) {
        const todo = await db.todos.get(reminder.todoId);
        if (!todo || todo.isComplete) {
          await markReminderSent(reminder.id);
          continue;
        }

        new Notification('Trackie Reminder', {
          body: todo.title,
          icon: '/icon-192x192.png'
        });
        await markReminderSent(reminder.id);
      }
    };

    sendScheduledReminders();
    const interval = setInterval(() => {
      sendScheduledReminders();
    }, 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  // --- TIMER LOGIC ---
  useEffect(() => {
    if (!isActive) {
      return undefined;
    }

    const interval = setInterval(() => {
      setSecondsLeft((current) => {
        if (current <= 1) {
          setIsActive(false);
          return 0;
        }
        return current - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isActive]);

  const formatTime = (s) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const closeModal = () => setModalType(null);
  const openModal = (type) => {
    setModalType(type);
    setIsMenuOpen(false);
  };

  const todayAssignments = [...todos]
    .sort((a, b) => {
      if (a.isComplete && !b.isComplete) return 1;
      if (!a.isComplete && b.isComplete) return -1;
      return new Date(a.deadline) - new Date(b.deadline);
    })
    .slice(0, 5);

  const getShiftHours = (shift) => {
    const [startHour, startMinute] = shift.startTime.split(':').map(Number);
    const [endHour, endMinute] = shift.endTime.split(':').map(Number);
    const startTotalMinutes = startHour * 60 + startMinute;
    const endTotalMinutes = endHour * 60 + endMinute;
    const minutes = endTotalMinutes - startTotalMinutes;
    return minutes > 0 ? minutes / 60 : 0;
  };

  const todayIso = new Date().toISOString().slice(0, 10);
  const todayWorkShifts = [...workShifts]
    .filter((shift) => shift.date === todayIso)
    .sort((a, b) => a.startTime.localeCompare(b.startTime));

  const weekStart = new Date();
  weekStart.setHours(0, 0, 0, 0);
  weekStart.setDate(weekStart.getDate() - weekStart.getDay());
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 7);

  const weeklyWorkHours = workShifts.reduce((sum, shift) => {
    const shiftDate = new Date(`${shift.date}T00:00:00`);
    if (shiftDate >= weekStart && shiftDate < weekEnd) {
      return sum + getShiftHours(shift);
    }
    return sum;
  }, 0);

  const renderMainContent = () => {
    if (activeTab === 'Schedule') {
      return <ClassSchedule classes={classes} todos={todos} workShifts={workShifts} />;
    }

    if (activeTab === 'Tasks') {
      return (
        <div className="space-y-6">
          <TodoList todos={todos} />
          <section className="bg-white rounded-3xl p-6 text-black">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-2xl font-black italic">Quick Tasks</h3>
              <button type="button" onClick={() => openModal('task')} className="border-2 border-black rounded-lg px-4 py-1 text-xs font-bold hover:bg-gray-100">+ Task</button>
            </div>
            <div className="space-y-3">
              {tasks.length === 0 && <p className="text-sm text-gray-500">No quick tasks yet.</p>}
              {tasks.map((task) => (
                <div key={task.id} className="flex items-center justify-between border border-gray-200 rounded-xl p-3 gap-3">
                  <span className={`font-bold flex-1 ${task.isComplete ? 'line-through text-gray-400' : 'text-gray-800'}`}>{task.title}</span>
                  <div className="flex items-center gap-2 shrink-0">
                    <input
                      type="checkbox"
                      checked={task.isComplete}
                      onChange={() => db.tasks.update(task.id, { isComplete: !task.isComplete })}
                      className="w-5 h-5"
                    />
                    <button
                      onClick={() => deleteTask(task.id)}
                      className="text-gray-400 hover:text-red-500 transition-colors text-lg font-bold"
                      aria-label={`Delete ${task.title}`}
                    >
                      ×
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      );
    }

    if (activeTab === 'Journal') {
      return <ProductivityPanel />;
    }

    if (activeTab === 'Work') {
      return <WorkSchedulePanel />;
    }

    return (
      <div className="text-black overflow-hidden w-full">
        <section className="pb-6 md:pb-8 border-b border-gray-200">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-black italic">Classes</h2>
            <button type="button" onClick={() => openModal('class')} className="border-2 border-black rounded-lg px-4 py-1 text-xs font-bold hover:bg-gray-100">+ Class</button>
          </div>
          <div className="space-y-3">
            {classes.length === 0 && <p className="text-sm text-gray-500">No classes added yet.</p>}
            {classes.map((cls) => (
              <div key={cls.id} className="bg-gray-50 p-4 rounded-2xl flex justify-between items-center border border-gray-100">
                <div>
                  <p className="font-bold">{cls.name}</p>
                  <p className="text-gray-500 text-xs">{cls.day} | {cls.time} | {cls.location}</p>
                </div>
                <button
                  onClick={() => deleteClass(cls.id)}
                  className="text-gray-300 hover:text-red-500 transition-colors text-lg font-bold ml-3"
                  aria-label={`Delete ${cls.name}`}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </section>

        <section className="py-6 md:py-8 border-b border-gray-200">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-black italic">Assignments</h2>
            <button type="button" onClick={() => openModal('todo')} className="border-2 border-black rounded-lg px-4 py-1 text-xs font-bold hover:bg-gray-100">+ Assignment</button>
          </div>
          <div className="space-y-4">
            {todayAssignments.length === 0 && <p className="text-sm text-gray-500">No assignments yet.</p>}
            {todayAssignments.map((todo) => (
              <div key={todo.id} className="flex justify-between items-start gap-3">
                <div className="flex-1">
                  <p className={`font-bold ${todo.isComplete ? 'line-through text-gray-300' : 'text-gray-700'}`}>{todo.title}</p>
                  <p className="text-xs text-gray-500">Due {new Date(todo.deadline).toLocaleString()}</p>
                  {todo.notes && <p className="text-xs text-gray-400 mt-1 italic">{todo.notes}</p>}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <input
                    type="checkbox"
                    checked={todo.isComplete}
                    onChange={() => db.todos.update(todo.id, { isComplete: !todo.isComplete })}
                    className="w-6 h-6 border-2 border-gray-200 checked:bg-[#a3e635] rounded-full appearance-none cursor-pointer"
                  />
                  <button
                    onClick={() => deleteTodo(todo.id)}
                    className="text-gray-300 hover:text-red-500 transition-colors text-lg font-bold"
                    aria-label={`Delete ${todo.title}`}
                  >
                    ×
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="pt-6 md:pt-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-black italic">Quick Tasks</h2>
            <button type="button" onClick={() => openModal('task')} className="border-2 border-black rounded-lg px-4 py-1 text-xs font-bold hover:bg-gray-100">+ Task</button>
          </div>
          <div className="space-y-4">
            {tasks.length === 0 && <p className="text-sm text-gray-500">No tasks yet.</p>}
            {tasks.slice(0, 6).map((task) => (
              <div key={task.id} className="flex justify-between items-center gap-3">
                <p className={`font-bold flex-1 ${task.isComplete ? 'line-through text-gray-300' : 'text-gray-700'}`}>{task.title}</p>
                <div className="flex items-center gap-2 shrink-0">
                  <input
                    type="checkbox"
                    checked={task.isComplete}
                    onChange={() => db.tasks.update(task.id, { isComplete: !task.isComplete })}
                    className="w-6 h-6 border-2 border-gray-200 checked:bg-[#a3e635] rounded-full appearance-none cursor-pointer"
                  />
                  <button
                    onClick={() => deleteTask(task.id)}
                    className="text-gray-300 hover:text-red-500 transition-colors text-lg font-bold"
                    aria-label={`Delete ${task.title}`}
                  >
                    ×
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="py-6 md:py-8 border-t border-gray-200">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-black italic">Work This Week</h2>
            <button
              type="button"
              onClick={() => setActiveTab('Work')}
              className="border-2 border-black rounded-lg px-4 py-1 text-xs font-bold hover:bg-gray-100"
            >
              Open Work Log
            </button>
          </div>

          <div className="bg-gray-50 border border-gray-100 rounded-2xl p-4 mb-4">
            <p className="text-xs uppercase tracking-wide text-gray-500 font-bold">Total Hours (Sun-Sat)</p>
            <p className="text-3xl font-black text-gray-900 mt-1">{weeklyWorkHours.toFixed(1)} hrs</p>
          </div>

          <div className="space-y-3">
            {todayWorkShifts.length === 0 && <p className="text-sm text-gray-500">No work shifts logged for today.</p>}
            {todayWorkShifts.map((shift) => (
              <article key={shift.id} className="bg-gray-50 border border-gray-100 rounded-2xl p-4">
                <p className="font-bold text-gray-800">Today: {shift.startTime} - {shift.endTime}</p>
                <p className="text-xs text-gray-500 mt-1">{getShiftHours(shift).toFixed(1)} hours</p>
                {shift.location && <p className="text-xs text-gray-500">Location: {shift.location}</p>}
              </article>
            ))}
          </div>
        </section>
      </div>
    );
  };

  return (
    <div className="min-h-screen w-full bg-[#121212] text-white font-sans">
      {!isOnline && (
        <div className="fixed top-0 left-0 right-0 bg-amber-600 text-white text-center py-2 text-sm font-bold z-40">
          Offline mode: your data is saved locally and will continue to work.
        </div>
      )}

      <header className="pt-8 pb-6 px-4 relative">
        <button
          type="button"
          onClick={() => setIsMenuOpen((open) => !open)}
          className="lg:hidden absolute left-4 top-1/2 -translate-y-1/2 bg-[#1a1a1a] border border-gray-700 rounded-xl w-12 h-12 inline-flex items-center justify-center"
          aria-label="Toggle navigation"
        >
          <span className="sr-only">Open menu</span>
          <span className="flex flex-col gap-1.5">
            <span className="block w-5 h-0.5 bg-[#a3e635]"></span>
            <span className="block w-5 h-0.5 bg-[#a3e635]"></span>
            <span className="block w-5 h-0.5 bg-[#a3e635]"></span>
          </span>
        </button>
        <img src={TrackieLogo} alt="Trackie" className="h-20 md:h-24 lg:h-28 w-auto mx-auto" />
      </header>

      <div className="px-4 pb-6">
        <div className="grid grid-cols-1 lg:grid-cols-[220px_minmax(0,1fr)_320px] gap-4">
        {isMenuOpen && <div className="fixed inset-0 bg-black/60 z-40 lg:hidden" onClick={() => setIsMenuOpen(false)}></div>}
        <aside className={`fixed lg:static top-0 left-0 z-50 lg:z-auto h-screen lg:h-auto w-72 lg:w-auto bg-[#1a1a1a] rounded-r-3xl lg:rounded-3xl p-4 md:p-5 border border-gray-800 self-start transform transition-transform duration-300 ${isMenuOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>
          <div className="flex items-center justify-between mb-4 lg:hidden">
            <button
              type="button"
              onClick={() => setIsMenuOpen(false)}
              className="text-gray-300 hover:text-white text-2xl leading-none"
              aria-label="Close menu"
            >
              ×
            </button>
          </div>
          <nav className="grid grid-cols-1 gap-3">
            {['Home', 'Schedule', 'Tasks', 'Journal', 'Work'].map((tab) => (
              <button
                type="button"
                key={tab}
                onClick={() => {
                  setActiveTab(tab);
                  setIsMenuOpen(false);
                }}
                className={`flex items-center justify-center lg:justify-start gap-4 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                  activeTab === tab ? 'bg-[#a3e635] text-black' : 'text-gray-400 hover:bg-gray-800'
                }`}
              >
                {tab}
              </button>
            ))}
          </nav>
        </aside>

        <main className="bg-white rounded-3xl p-5 md:p-8 shadow-2xl min-h-[70vh]">
          <div className="w-full">
            <header className="mb-6 text-center">
              <h1 className="text-gray-500 text-lg font-semibold">{new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}</h1>
            </header>
            {renderMainContent()}
          </div>
        </main>

        <aside className="space-y-4">
          <section className="bg-[#1a1a1a] rounded-3xl p-6 border border-gray-800 text-center">
            <h3 className="text-2xl font-black mb-5">Focus Session</h3>
            <div className="w-44 h-44 mx-auto mb-5 relative flex items-center justify-center">
              <div className={`absolute inset-0 border-[8px] border-[#a3e635] rounded-full ${isActive ? 'animate-pulse opacity-100' : 'opacity-20'}`}></div>
              <div className="text-[#a3e635] text-5xl font-black">{formatTime(secondsLeft)}</div>
            </div>
            <button
              type="button"
              onClick={() => setIsActive(!isActive)}
              className="w-full bg-[#a3e635] text-black font-black py-4 rounded-2xl hover:scale-[1.02] transition-transform"
            >
              {isActive ? 'PAUSE SESSION' : 'START SESSION'}
            </button>
          </section>

          <section className="bg-white rounded-3xl p-6 text-black border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-black italic">Upcoming Assignments</h4>
            </div>
            <div className="space-y-3">
              {todayAssignments.length === 0 && (
                <p className="text-sm text-gray-500">Nothing due soon.</p>
              )}
              {todayAssignments.map((todo) => (
                <article key={todo.id} className="border border-gray-200 rounded-xl p-3">
                  <p className={`text-sm font-bold ${todo.isComplete ? 'line-through text-gray-400' : 'text-gray-900'}`}>{todo.title}</p>
                  <p className="text-xs text-gray-500 mt-1">{new Date(todo.deadline).toLocaleString()}</p>
                </article>
              ))}
            </div>
          </section>
        </aside>
        </div>
      </div>

      {/* --- MODAL SYSTEM --- */}
      {modalType && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-white p-8 rounded-[2.5rem] w-full max-w-md text-black relative shadow-2xl">
            <button onClick={closeModal} className="absolute top-6 right-8 text-3xl font-light">×</button>
            <h2 className="text-2xl font-black mb-6 italic uppercase tracking-tight">New {modalType}</h2>
            {modalType === 'class' && <AddClassForm onClose={closeModal} />}
            {modalType === 'todo' && <AddTodoForm onClose={closeModal} />}
            {modalType === 'task' && <AddTaskForm onClose={closeModal} />}
          </div>
        </div>
      )}
    </div>
  );
}