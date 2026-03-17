import Papa from 'papaparse';
import { Parameter, Participant } from '../types';

const REVENUE_POINTS_PER_50000 = 5;

// Google Apps Script Web App URL for write operations
const GAS_WEB_APP_URL = 'https://script.google.com/macros/s/AKfycbz_evcY2kTxVGU3bNV-J-83txC7HPyGbiVpUKnFWv7yAQPrXWJ2n038AD_z2gOjTFWWag/exec';

const parseNumericValue = (value: unknown): number => {
  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : 0;
  }

  if (typeof value !== 'string') {
    return 0;
  }

  // Remove spaces and currency symbols to support values like "1 199 403 ₽"
  const normalized = value.replace(/\s/g, '').replace(/[^\d,-.]/g, '').replace(',', '.');
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : 0;
};

const normalizeHeader = (header: string): string => header.trim();

const loadParticipantsFromSheetName = async (
  spreadsheetId: string,
  sheetName: string,
  parameters: Parameter[],
  idPrefix: string
): Promise<Participant[]> => {
  const csvUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(sheetName)}`;
  const response = await fetch(csvUrl);
  if (!response.ok) {
    throw new Error(`Не удалось получить данные из листа "${sheetName}".`);
  }

  const csvText = await response.text();
  const parsed = Papa.parse<Record<string, string>>(csvText, {
    header: true,
    skipEmptyLines: true,
  });

  if (parsed.errors.length > 0) {
    throw new Error(`Ошибка парсинга CSV из листа "${sheetName}".`);
  }

  const rows = parsed.data as Array<Record<string, string>>;
  if (rows.length === 0) {
    return [];
  }

  return rows
    .map((row: Record<string, string>, index: number) => {
      const normalizedRow = Object.fromEntries(
        Object.entries(row).map(([key, value]) => [normalizeHeader(key), value])
      );

      const fullName = String(normalizedRow['ФИО'] || '').trim();
      if (!fullName) {
        return null;
      }

      const participantParams: Record<string, number> = {};
      let paramsScore = 0;

      parameters.forEach((parameter) => {
        const count = parseNumericValue(normalizedRow[parameter.name]);
        participantParams[parameter.name] = count;
        paramsScore += count * parameter.weight;
      });

      const revenue = parseNumericValue(normalizedRow['Выручка']);
      const revenueScore = Math.floor(revenue / 50000) * REVENUE_POINTS_PER_50000;

      return {
        id: `${idPrefix}-${Date.now()}-${index}`,
        fullName,
        parameters: participantParams,
        revenue,
        revenueScore,
        totalScore: paramsScore + revenueScore,
      } satisfies Participant;
    })
    .filter((participant: Participant | null): participant is Participant => participant !== null);
};

export const extractSpreadsheetId = (input: string): string => {
  const trimmed = input.trim();

  if (/^[a-zA-Z0-9-_]+$/.test(trimmed) && !trimmed.includes('/')) {
    return trimmed;
  }

  const match = trimmed.match(/\/d\/([a-zA-Z0-9-_]+)/);
  if (!match) {
    throw new Error('Не удалось определить Spreadsheet ID из ссылки');
  }

  return match[1];
};

export const importParticipantsFromSheet = async (
  spreadsheetUrlOrId: string,
  parameters: Parameter[]
): Promise<Participant[]> => {
  const spreadsheetId = extractSpreadsheetId(spreadsheetUrlOrId);
  try {
    return await loadParticipantsFromSheetName(spreadsheetId, 'База данных', parameters, 'db');
  } catch {
    throw new Error('Не удалось получить данные из листа "База данных". Проверьте доступ и название листа.');
  }
};

// Import from "Файл редактирования" sheet by name to avoid gid dependence
export const importFromEditingFile = async (
  spreadsheetUrlOrId: string,
  parameters: Parameter[]
): Promise<Participant[]> => {
  const spreadsheetId = extractSpreadsheetId(spreadsheetUrlOrId);
  try {
    return await loadParticipantsFromSheetName(spreadsheetId, 'Файл редактирования', parameters, 'edit');
  } catch {
    throw new Error('Не удалось получить данные из листа "Файл редактирования". Проверьте доступ и наличие листа.');
  }
};

// Export snapshot to a new dated sheet via Google Apps Script
export const exportSnapshotToDatedSheet = async (
  spreadsheetUrlOrId: string,
  participants: Participant[],
  parameters: Parameter[]
): Promise<{ success: boolean; sheetName?: string; error?: string }> => {
  try {
    const headers = ['ФИО', ...parameters.map((p) => p.name), 'Выручка', 'Баллы за выручку', 'Общий балл'];
    const rows = [
      headers,
      ...participants.map((p) => [
        p.fullName,
        ...parameters.map((param) => p.parameters[param.name] || 0),
        p.revenue,
        p.revenueScore,
        p.totalScore,
      ]),
    ];

    await fetch(GAS_WEB_APP_URL, {
      method: 'POST',
      mode: 'no-cors',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'exportMonth',
        spreadsheetId: extractSpreadsheetId(spreadsheetUrlOrId),
        rows,
      }),
    });

    return { success: true };
  } catch (error) {
    console.error('Export error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Неизвестная ошибка экспорта'
    };
  }
};

// Read data from "База данных" sheet (gid=0)
export const readDatabaseSheet = async (
  spreadsheetUrlOrId: string,
  parameters: Parameter[]
): Promise<Participant[]> => {
  const spreadsheetId = extractSpreadsheetId(spreadsheetUrlOrId);
  try {
    return await loadParticipantsFromSheetName(spreadsheetId, 'База данных', parameters, 'db');
  } catch (error) {
    console.error('Error reading database sheet:', error);
    return [];
  }
};

// Write data to a sheet via Google Apps Script
export const writeSheetByName = async (
  _spreadsheetUrlOrId: string,
  sheetName: string,
  participants: Participant[],
  parameters: Parameter[]
): Promise<{ success: boolean; error?: string }> => {
  try {
    // Build rows with headers
    const headers = ['ФИО', ...parameters.map(p => p.name), 'Выручка'];
    const rows = [
      headers,
      ...participants.map(p => [
        p.fullName,
        ...parameters.map(param => p.parameters[param.name] || 0),
        p.revenue,
      ]),
    ];

    await fetch(GAS_WEB_APP_URL, {
      method: 'POST',
      mode: 'no-cors',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'updateSheet',
        sheetName: sheetName,
        rows: rows,
      }),
    });

    return { success: true };
  } catch (error) {
    console.error('Write error:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Неизвестная ошибка записи' 
    };
  }
};

// Clear sheet body (keep headers) via Google Apps Script
export const clearSheetBody = async (
  _spreadsheetUrlOrId: string,
  sheetName: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    await fetch(GAS_WEB_APP_URL, {
      method: 'POST',
      mode: 'no-cors',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'clearSheetBody',
        sheetName: sheetName,
      }),
    });

    return { success: true };
  } catch (error) {
    console.error('Clear error:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Неизвестная ошибка очистки' 
    };
  }
};

// Sync: Read from both sheets, sum values, write back to "База данных"
export const syncWithDatabase = async (
  spreadsheetUrlOrId: string,
  parameters: Parameter[]
): Promise<Participant[]> => {
  // Step 1: Read "База данных" (existing totals)
  const dbParticipants = await readDatabaseSheet(spreadsheetUrlOrId, parameters);

  // Step 2: Read "Файл редактирования" (new data to add)
  const editingParticipants = await importFromEditingFile(spreadsheetUrlOrId, parameters);

  // Step 3: Merge by ФИО (sum values)
  const mergedMap = new Map<string, Participant>();

  // Add existing database participants
  dbParticipants.forEach((p: Participant) => {
    mergedMap.set(p.fullName, { ...p });
  });

  // Add/edit with editing file participants
  editingParticipants.forEach((p: Participant) => {
    const existing = mergedMap.get(p.fullName);
    if (existing) {
      const mergedParams: Record<string, number> = {};
      parameters.forEach((param: Parameter) => {
        mergedParams[param.name] = (existing.parameters[param.name] || 0) + (p.parameters[param.name] || 0);
      });

      const mergedRevenue = existing.revenue + p.revenue;
      const mergedRevenueScore = Math.floor(mergedRevenue / 50000) * REVENUE_POINTS_PER_50000;

      let paramsScore = 0;
      parameters.forEach((param: Parameter) => {
        paramsScore += mergedParams[param.name] * param.weight;
      });

      mergedMap.set(p.fullName, {
        ...existing,
        parameters: mergedParams,
        revenue: mergedRevenue,
        revenueScore: mergedRevenueScore,
        totalScore: paramsScore + mergedRevenueScore,
      });
    } else {
      mergedMap.set(p.fullName, p);
    }
  });

  const mergedParticipants = Array.from(mergedMap.values());

  // Step 4: Write merged data back to "База данных"
  await writeSheetByName(spreadsheetUrlOrId, 'База данных', mergedParticipants, parameters);

  // Important: do NOT clear "Файл редактирования"
  return mergedParticipants;
};

// Re-export for use in components
export { GAS_WEB_APP_URL };