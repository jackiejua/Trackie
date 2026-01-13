// src/utils/notifications.js

// 1. Request Permission when the app loads
export const requestNotificationPermission = () => {
  if ('Notification' in window) {
    Notification.requestPermission();
  }
};

// 2. Check and trigger a notification for an upcoming deadline
export const checkAndNotify = (todos) => {
  const now = new Date().getTime();
  const oneHour = 60 * 60 * 1000; // 1 hour buffer

  todos.forEach(todo => {
    const deadlineTime = new Date(todo.deadline).getTime();
    const timeDiff = deadlineTime - now;

    // Check if the deadline is within the next hour and not completed
    if (timeDiff > 0 && timeDiff <= oneHour && !todo.isComplete) {
      if (Notification.permission === 'granted') {
        new Notification('⚠️ Deadline Alert!', {
          body: `"${todo.title}" is due soon! (less than 1 hour)`,
          icon: '/icon-192x192.png'
        });
      }
    }
  });
};