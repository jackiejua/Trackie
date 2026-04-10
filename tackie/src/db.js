import Dexie from 'dexie';

// We'll call it TrackieDB to match your new logo!
export const db = new Dexie('TrackieDB');

// Define the v1 schema for existing users.
db.version(1).stores({
  classes: '++id, name, day, time, location',
  todos: '++id, title, deadline, classId, isComplete',
  tasks: '++id, title, isComplete' // <--- Added this for the "Tasks" section
});

// v2 extends storage for wellness + reminder features.
db.version(2).stores({
  classes: '++id, name, day, time, location',
  todos: '++id, title, deadline, classId, isComplete',
  tasks: '++id, title, isComplete',
  journals: '++id, date, createdAt',
  productivity: '++id, &date, rating, mood',
  reminders: '++id, todoId, remindAt, sent, isActive'
}).upgrade(async (tx) => {
  await tx.table('todos').toCollection().modify((todo) => {
    if (typeof todo.isComplete !== 'boolean') {
      todo.isComplete = false;
    }
  });

  await tx.table('tasks').toCollection().modify((task) => {
    if (typeof task.isComplete !== 'boolean') {
      task.isComplete = false;
    }
  });
});

// --- Classes ---
export async function addClass(classData) {
  return db.classes.add(classData);
}

// --- Assignments (Todos) ---
export async function addTodo(todoData) {
  if (!todoData?.title || !todoData?.deadline) {
    throw new Error('Todo title and deadline are required.');
  }

  const deadline = new Date(todoData.deadline);
  if (Number.isNaN(deadline.getTime())) {
    throw new Error('Invalid todo deadline.');
  }

  // Ensure we save it as incomplete by default
  return db.todos.add({ ...todoData, deadline, isComplete: false });
}

export async function toggleTodoCompletion(id, isComplete) {
  return db.todos.update(id, { isComplete });
}

// --- General Tasks ---
export async function addGeneralTask(title) {
  return db.tasks.add({ title, isComplete: false });
}

export async function toggleTaskCompletion(id, isComplete) {
  return db.tasks.update(id, { isComplete });
}

// --- Helper for the Dashboard ---
export async function getAllData() {
  const classes = await db.classes.toArray();
  const todos = await db.todos.toArray();
  const tasks = await db.tasks.toArray();
  const journals = await db.journals.toArray();
  const productivity = await db.productivity.toArray();
  return { classes, todos, tasks, journals, productivity };
}

export async function addJournalEntry({ text, mood, tags = [], prompts = '' }) {
  if (!text?.trim()) {
    throw new Error('Journal text is required.');
  }

  return db.journals.add({
    text: text.trim(),
    mood: mood || 'neutral',
    tags,
    prompts,
    date: new Date().toISOString().slice(0, 10),
    createdAt: new Date().toISOString()
  });
}

export async function saveDailyProductivity({ date, rating, note = '' }) {
  const normalizedDate = date || new Date().toISOString().slice(0, 10);
  const normalizedRating = Number(rating);

  if (!Number.isInteger(normalizedRating) || normalizedRating < 1 || normalizedRating > 5) {
    throw new Error('Productivity rating must be an integer from 1 to 5.');
  }

  const existing = await db.productivity.where('date').equals(normalizedDate).first();
  const payload = {
    date: normalizedDate,
    rating: normalizedRating,
    note: note.trim(),
    updatedAt: new Date().toISOString()
  };

  if (existing) {
    return db.productivity.update(existing.id, payload);
  }

  return db.productivity.add({ ...payload, createdAt: new Date().toISOString() });
}

export async function scheduleTodoReminder(todoId, remindAt) {
  if (!todoId || !remindAt) {
    throw new Error('todoId and remindAt are required for reminders.');
  }

  const remindTime = new Date(remindAt);
  if (Number.isNaN(remindTime.getTime())) {
    throw new Error('Invalid reminder date.');
  }

  return db.reminders.add({
    todoId,
    remindAt: remindTime.toISOString(),
    sent: false,
    isActive: true,
    createdAt: new Date().toISOString()
  });
}

export async function markReminderSent(id) {
  return db.reminders.update(id, { sent: true, sentAt: new Date().toISOString() });
}

export async function getPendingReminders(now = new Date()) {
  const nowIso = now.toISOString();
  return db.reminders
    .where('remindAt')
    .belowOrEqual(nowIso)
    .and((reminder) => reminder.isActive && !reminder.sent)
    .toArray();
}

export async function deleteClass(id) {
  await db.todos.where('classId').equals(id).modify({ classId: null });
  return db.classes.delete(id);
}

export async function deleteTodo(id) {
  await db.reminders.where('todoId').equals(id).modify({ isActive: false });
  return db.todos.delete(id);
}

export async function deleteTask(id) {
  return db.tasks.delete(id);
}

export async function deleteJournalEntry(id) {
  return db.journals.delete(id);
}