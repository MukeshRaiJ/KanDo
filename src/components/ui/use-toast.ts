import * as React from "react";

const TOAST_LIMIT = 1;
const TOAST_REMOVE_DELAY = 1000000;

type ToasterToast = {
  id: string;
  title?: React.ReactNode;
  description?: React.ReactNode;
  action?: React.ReactNode;
};

const actionTypes = {
  ADD_TOAST: "ADD_TOAST",
  UPDATE_TOAST: "UPDATE_TOAST",
  DISMISS_TOAST: "DISMISS_TOAST",
  REMOVE_TOAST: "REMOVE_TOAST",
} as const;

let count = 0;

function genId() {
  count = (count + 1) % Number.MAX_VALUE;
  return count.toString();
}

const toastTimeouts = new Map<string, ReturnType<typeof setTimeout>>();

export function useToast() {
  const [toasts, setToasts] = React.useState<ToasterToast[]>([]);

  const toast = React.useCallback(function ({
    title,
    description,
    action,
  }: Omit<ToasterToast, "id">) {
    const id = genId();

    setToasts((toasts) =>
      [{ id, title, description, action }, ...toasts].slice(0, TOAST_LIMIT)
    );

    const timeoutId = setTimeout(() => {
      setToasts((toasts) => toasts.filter((t) => t.id !== id));
    }, TOAST_REMOVE_DELAY);

    toastTimeouts.set(id, timeoutId);
  },
  []);

  const dismiss = React.useCallback(function (toastId?: string) {
    setToasts((toasts) => toasts.filter((t) => t.id !== toastId));
    if (toastId) {
      const timeout = toastTimeouts.get(toastId);
      if (timeout) clearTimeout(timeout);
      toastTimeouts.delete(toastId);
    }
  }, []);

  return {
    toasts,
    toast,
    dismiss,
  };
}
