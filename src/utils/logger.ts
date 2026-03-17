import { LogEntry } from '../types';

export const createLogger = (storageKey: string = 'competition_logs') => {
  const getLogs = (): LogEntry[] => {
    try {
      const logs = localStorage.getItem(storageKey);
      return logs ? JSON.parse(logs) : [];
    } catch (error) {
      console.error('Error reading logs:', error);
      return [];
    }
  };

  const addLog = (action: string, details: string, user: string = 'admin'): void => {
    try {
      const logs = getLogs();
      const newLog: LogEntry = {
        id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        timestamp: new Date().toISOString(),
        action,
        details,
        user
      };
      
      logs.unshift(newLog);
      
      // Keep only last 1000 logs
      const trimmedLogs = logs.slice(0, 1000);
      localStorage.setItem(storageKey, JSON.stringify(trimmedLogs));
    } catch (error) {
      console.error('Error adding log:', error);
    }
  };

  const clearLogs = (): void => {
    try {
      localStorage.removeItem(storageKey);
    } catch (error) {
      console.error('Error clearing logs:', error);
    }
  };

  const exportLogs = (): string => {
    const logs = getLogs();
    return JSON.stringify(logs, null, 2);
  };

  return {
    getLogs,
    addLog,
    clearLogs,
    exportLogs
  };
};

export const logger = createLogger();