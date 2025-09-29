// components/ui/Toast.tsx
import { useEffect } from "react";

export interface ToastProps {
  message: string;
  type?: "success" | "error" | "info";
  onClose: () => void;
  duration?: number;
}

export function Toast({
  message,
  type = "info",
  onClose,
  duration = 2500,
}: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [onClose, duration]);

  let bg = "bg-gray-800 text-white";
  if (type === "success") bg = "bg-green-600 text-white";
  if (type === "error") bg = "bg-red-600 text-white";

  return (
    <div
      className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded shadow-lg ${bg} animate-fade-in`}
      role="alert"
    >
      {message}
    </div>
  );
}
