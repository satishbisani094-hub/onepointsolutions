import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { IoCheckmarkCircle, IoCloseCircle, IoWarning, IoInformationCircle, IoClose } from 'react-icons/io5';

const Toast = ({ message, type = 'success', onClose, duration = 4000 }) => {
  useEffect(() => {
    if (duration && onClose) {
      const timer = setTimeout(onClose, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  const icons = {
    success: <IoCheckmarkCircle className="h-5 w-5 text-emerald-500" />,
    error: <IoCloseCircle className="h-5 w-5 text-rose-500" />,
    warning: <IoWarning className="h-5 w-5 text-amber-500" />,
    info: <IoInformationCircle className="h-5 w-5 text-blue-500" />
  };

  const bgColors = {
    success: 'bg-emerald-50 border-emerald-100 text-emerald-800 dark:bg-emerald-950/30 dark:border-emerald-900/50 dark:text-emerald-300',
    error: 'bg-rose-50 border-rose-100 text-rose-800 dark:bg-rose-950/30 dark:border-rose-900/50 dark:text-rose-300',
    warning: 'bg-amber-50 border-amber-100 text-amber-800 dark:bg-amber-950/30 dark:border-amber-900/50 dark:text-amber-300',
    info: 'bg-blue-50 border-blue-100 text-blue-800 dark:bg-blue-950/30 dark:border-blue-900/50 dark:text-blue-300'
  };

  return (
    <div className="fixed bottom-5 right-5 z-55 max-w-sm">
      <AnimatePresence>
        {message && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className={`flex items-start gap-3 rounded-xl border p-4 shadow-lg backdrop-blur-md transition-all ${bgColors[type]}`}
          >
            <div className="flex-shrink-0 mt-0.5">{icons[type]}</div>
            <div className="flex-1 text-sm font-medium pr-2">{message}</div>
            <button
              onClick={onClose}
              className="flex-shrink-0 rounded-lg p-0.5 text-slate-400 hover:bg-slate-200/50 dark:hover:bg-slate-700/50 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
            >
              <IoClose size={16} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Toast;
