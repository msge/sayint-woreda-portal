import React, { createContext, useContext, useState } from "react"

const ToastContext = createContext({});

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const toast = ({ title, description, variant }) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, title, description, variant }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3000);
  };

  return (
    <ToastContext.Provider value={{ toast, toasts }}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 space-y-2">
        {toasts.map(t => (
          <div key={t.id} className={`p-4 rounded-lg shadow-lg border ${t.variant === 'destructive' ? 'bg-red-50 border-red-200 text-red-800' : 'bg-green-50 border-green-200 text-green-800'}`}>
            <h4 className="font-medium">{t.title}</h4>
            <p className="text-sm">{t.description}</p>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const toast = () => {};