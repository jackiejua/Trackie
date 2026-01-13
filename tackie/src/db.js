import Dexie from 'dexie';

export const db = new Dexie('CampusManagerDB');

// Define the database schema
db.version(1).stores({
  classes: '++id, name, day, time, location',
  todos: '++id, title, deadline, classId, isComplete'
  // '++id' is an auto-incrementing primary key.
  // Other fields are indexed for faster lookups.
});



// Function to add a new class
export async function addClass(classData) {
  return db.classes.add(classData);
}

// Function to add a new todo/assignment
export async function addTodo(todoData) {
  return db.todos.add({...todoData, isComplete: false});
}

// Function to toggle a todo's completion status
export async function toggleTodoCompletion(id, isComplete) {
  return db.todos.update(id, { isComplete });
}

// Function to fetch all classes and todos
export async function getAllData() {
  const classes = await db.classes.toArray();
  const todos = await db.todos.toArray();
  return { classes, todos };
}