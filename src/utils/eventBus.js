// src/utils/eventBus.js
const subscribers = {};

export function on(event, callback) {
  if (!subscribers[event]) subscribers[event] = [];
  subscribers[event].push(callback);
  return () => {
    subscribers[event] = subscribers[event].filter((cb) => cb !== callback);
  };
}

export function emit(event, data) {
  if (!subscribers[event]) return;
  subscribers[event].forEach((cb) => cb(data));
}

