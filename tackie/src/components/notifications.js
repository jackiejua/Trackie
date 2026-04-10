// src/utils/notifications.js

const notifiedTodoIds = new Set();

// 1. Request Permission when the app loads
export const requestNotificationPermission = () => {
  if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'default') {
    Notification.requestPermission();
  }
};

// 2. Check and trigger a notification for an upcoming deadline
export const checkAndNotify = (todos) => {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return;
  }

  if (Notification.permission !== 'granted') {
    return;
  }

  const now = new Date().getTime();
  const oneHour = 60 * 60 * 1000; // 1 hour buffer

  todos.forEach(todo => {
    const deadlineTime = new Date(todo.deadline).getTime();
    const timeDiff = deadlineTime - now;
    const reminderKey = `${todo.id}-${new Date(todo.deadline).toISOString()}`;

    // Check if the deadline is within the next hour and not completed
    if (timeDiff > 0 && timeDiff <= oneHour && !todo.isComplete && !notifiedTodoIds.has(reminderKey)) {
      new Notification('Trackie Deadline Alert', {
        body: `"${todo.title}" is due within 1 hour.`,
        icon: '/icon-192x192.png'
      });
      notifiedTodoIds.add(reminderKey);
    }

    if (todo.isComplete || timeDiff > oneHour) {
      notifiedTodoIds.delete(reminderKey);
    }
  });
};