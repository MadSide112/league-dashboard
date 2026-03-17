import { useState, useEffect, useCallback } from 'react';
import { Participant, Parameter } from './types';
import { initialParticipants, initialParameters } from './data';
import Dashboard from './components/Dashboard';
import AdminPanel from './components/AdminPanel';
import PasswordProtectedPanel from './components/PasswordProtectedPanel';
import LogsViewer from './components/LogsViewer';
import { importParticipantsFromSheet, exportSnapshotToDatedSheet, syncWithDatabase } from './utils/googleSheets';
import { logger } from './utils/logger';
import LeagueLogo from './components/LeagueLogo';

const SHEET_URL = 'https://docs.google.com/spreadsheets/d/1c7qh82G6BrGqbocCNckmCg8kPvNgv7MzmVjLM9eyeNA/edit?usp=sharing';

function App() {
  const [participants, setParticipants] = useState<Participant[]>(initialParticipants);
  const [parameters, setParameters] = useState<Parameter[]>(initialParameters);
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [showLogs, setShowLogs] = useState(false);
  const [isImportingSheet, setIsImportingSheet] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('participants');
    if (saved) {
      setParticipants(JSON.parse(saved));
    } else {
      syncWithDatabase(SHEET_URL, parameters).then(data => {
        if (data && data.length > 0) setParticipants(data);
      }).catch(console.error);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('participants', JSON.stringify(participants));
  }, [participants]);

  // Keyboard shortcut Ctrl+Shift+A for Admin
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'A') {
        e.preventDefault();
        setShowAdminPanel(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleUpdateParticipant = useCallback((id: string, updates: Partial<Participant>) => {
    setParticipants(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
  }, []);

  const handleAddParticipant = useCallback((newParticipant: Omit<Participant, 'id'>) => {
    const participant: Participant = { ...newParticipant, id: Date.now().toString() };
    setParticipants(prev => [...prev, participant]);
  }, []);

  const handleDeleteParticipant = useCallback((id: string) => {
    if (window.confirm('Confirm deletion?')) {
      setParticipants(prev => prev.filter(p => p.id !== id));
    }
  }, []);

  const handleUpdateParameters = useCallback((newParameters: Parameter[]) => {
    setParameters(newParameters);
    setParticipants(prev => prev.map(participant => {
      const updatedParameters = { ...participant.parameters };
      newParameters.forEach(param => {
        if (!(param.name in updatedParameters)) updatedParameters[param.name] = 0;
      });
      Object.keys(updatedParameters).forEach(name => {
        if (!newParameters.some(p => p.name === name)) delete updatedParameters[name];
      });
      const paramsScore = newParameters.reduce((sum, p) => sum + ((updatedParameters[p.name] || 0) * p.weight), 0);
      return { ...participant, parameters: updatedParameters, totalScore: paramsScore + participant.revenueScore };
    }));
  }, []);

  const handleImportGoogleSheet = useCallback(async () => {
    setIsImportingSheet(true);
    try {
      const importedParticipants = await importParticipantsFromSheet(SHEET_URL, parameters);
      setParticipants(current => {
        const idByName = new Map(current.map(p => [p.fullName.toLowerCase(), p.id]));
        return importedParticipants.map(p => ({
          ...p,
          id: idByName.get(p.fullName.toLowerCase()) || p.id,
        }));
      });
      logger.addLog('Sync', `Imported ${importedParticipants.length} participants from sheets`);
      window.alert('Sync Complete');
    } catch (err) {
      window.alert(`Error: ${err instanceof Error ? err.message : 'Unknown'}`);
    } finally {
      setIsImportingSheet(false);
    }
  }, [parameters]);

  const handleExportSnapshot = useCallback(async () => {
    setIsExporting(true);
    try {
      const result = await exportSnapshotToDatedSheet(SHEET_URL, participants, parameters);
      if (result.success) {
        logger.addLog('Export', 'Monthly snapshot exported to Google Sheets');
        window.alert('Выгрузка успешно выполнена! Проверьте таблицу - создан новый лист с датой.');
      } else {
        throw new Error(result.error || 'Export failed');
      }
    } catch (err) {
      window.alert(`Ошибка выгрузки: ${err instanceof Error ? err.message : 'Unknown'}`);
    } finally {
      setIsExporting(false);
    }
  }, [participants, parameters]);

  const handleSyncWithDatabase = useCallback(async () => {
    setIsSyncing(true);
    try {
      const mergedParticipants = await syncWithDatabase(SHEET_URL, parameters);
      setParticipants(mergedParticipants);
      logger.addLog('Sync', 'Database synced: summed editing file to database without clearing editing sheet');
      window.alert('Синхронизация завершена! Данные из "Файл редактирования" добавлены в "База данных". Лист "Файл редактирования" не очищался.');
    } catch (err) {
      window.alert(`Ошибка синхронизации: ${err instanceof Error ? err.message : 'Unknown'}`);
    } finally {
      setIsSyncing(false);
    }
  }, [parameters]);

  return (
    <div className="min-h-screen bg-neutral-950 text-white selection:bg-amber-500/30">
      <Dashboard participants={participants} parameters={parameters} />

      <div className="fixed bottom-6 right-6 z-40">
        <button 
          onClick={() => setShowAdminPanel(true)}
          className="flex h-12 w-12 items-center justify-center border border-zinc-700 bg-zinc-900 text-zinc-200 transition-colors hover:border-amber-600 hover:text-amber-200"
        >
          <span className="text-[11px] font-semibold tracking-[0.14em]">ADM</span>
        </button>
      </div>

      {showAdminPanel && (
        <PasswordProtectedPanel onClose={() => setShowAdminPanel(false)}>
          <div className="fixed inset-0 z-40 overflow-y-auto bg-black/70 p-4 backdrop-blur-sm md:p-8">
            <div className="mx-auto max-w-7xl">
              <header className="mb-4 border border-zinc-800 bg-zinc-900/80 px-5 py-4 md:px-6">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <LeagueLogo size="sm" />
                    <div>
                      <p className="text-xs uppercase tracking-[0.24em] text-zinc-500">Панель управления</p>
                      <h2 className="font-serif text-2xl uppercase tracking-[0.08em] text-zinc-100">Лига чемпионов</h2>
                    </div>
                  </div>
                </div>
                <p className="mt-3 text-xs text-zinc-500">Google Sheet: {SHEET_URL.split('/d/')[1].split('/')[0]}</p>
              </header>

              <AdminPanel
                participants={participants}
                parameters={parameters}
                onUpdateParticipant={handleUpdateParticipant}
                onAddParticipant={handleAddParticipant}
                onDeleteParticipant={handleDeleteParticipant}
                onUpdateParameters={handleUpdateParameters}
                onImportGoogleSheet={handleImportGoogleSheet}
                isImportingSheet={isImportingSheet}
                onExportSnapshot={handleExportSnapshot}
                isExporting={isExporting}
                onSyncWithDatabase={handleSyncWithDatabase}
                isSyncing={isSyncing}
                onViewLogs={() => setShowLogs(true)}
                onClose={() => setShowAdminPanel(false)}
              />
            </div>
          </div>
        </PasswordProtectedPanel>
      )}

      {showLogs && <LogsViewer onClose={() => setShowLogs(false)} />}
    </div>
  );
}

export { App };