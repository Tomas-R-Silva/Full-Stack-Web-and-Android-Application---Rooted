import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react";
import type { NotificationCode } from "../utils/notifications";
import { notificationMessages } from "../utils/notifications";

type ContextType = {
  notify: (code: NotificationCode) => void;
};

const NotificationContext = createContext<ContextType | null>(null);

export function NotificationProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [notification, setNotification] = useState<NotificationCode | null>(
    null,
  );

  const notify = useCallback((code: NotificationCode) => {
    setNotification(code);
  }, []);

  useEffect(() => {
    if (!notification) return;

    const timer = setTimeout(() => {
      setNotification(null);
    }, 3000);

    return () => clearTimeout(timer);
  }, [notification]);

  const data = notification ? notificationMessages[notification] : null;

  return (
    <NotificationContext.Provider value={{ notify }}>
      {children}

      {data && (
        <div
          style={{
            position: "fixed",
            top: 24,
            right: 24,
            background: "var(--color-green2)",
            color: "white",
            borderRadius: "16px",
            padding: "16px 22px",
            minWidth: "320px",
            filter: "drop-shadow(0 0 8px black)",
            zIndex: 9999,
          }}
        >
          <h6 className="fw-bold mb-1">{data.title}</h6>
          <p className="mb-0">{data.message}</p>
        </div>
      )}
    </NotificationContext.Provider>
  );
}

export function useNotification() {
  const context = useContext(NotificationContext);

  if (!context)
    throw new Error("useNotification must be used inside NotificationProvider");

  return context;
}
