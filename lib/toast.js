// Simple pub-sub toast bus

const listeners = new Set();

export function subscribeToToasts(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function emitToast(toast) {
  listeners.forEach((l) => l(toast));
}

export const toast = {
  success(message, options = {}) {
    emitToast({ id: cryptoRandomId(), type: 'success', message, ...options });
  },
  error(message, options = {}) {
    emitToast({ id: cryptoRandomId(), type: 'error', message, ...options });
  },
  warning(message, options = {}) {
    emitToast({ id: cryptoRandomId(), type: 'warning', message, ...options });
  },
  info(message, options = {}) {
    emitToast({ id: cryptoRandomId(), type: 'info', message, ...options });
  },
  announce(message, options = {}) {
    emitToast({ id: cryptoRandomId(), type: 'announcement', message, ...options });
  },
};

function cryptoRandomId() {
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    const buf = new Uint32Array(2);
    crypto.getRandomValues(buf);
    return Array.from(buf).map((n) => n.toString(16)).join('');
  }
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}


