import { createContext, useCallback, useContext, useMemo, useRef, useState } from "react";
import Notifications from "../components/ui/Notifications.jsx";

const NotifyContext = createContext(null);

export function NotificationProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const idRef = useRef(0);

  const notify = useCallback(({ title, message, type = "info", duration = 3000, action }) => {
    const id = ++idRef.current;
    setToasts((prev) => [...prev, { id, title, message, type, duration, action }]);
    return id;
  }, []);

  const remove = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const api = useMemo(() => ({ notify, remove }), [notify, remove]);

  return (
    <NotifyContext.Provider value={api}>
      {children}
      <Notifications toasts={toasts} onClose={remove} />
    </NotifyContext.Provider>
  );
}

export function useNotify() {
  const ctx = useContext(NotifyContext);
  if (!ctx) throw new Error("useNotify debe usarse dentro de <NotificationProvider/>");
  return ctx;
}
