export interface Participant {
  id: string;
  fullName: string;
  totalScore: number;
  parameters: {
    [key: string]: number;
  };
  revenue: number; // выручка
  revenueScore: number; // баллы за выручку (5 за каждые 50000)
}

export interface Parameter {
  id: string;
  name: string;
  weight: number; // вес параметра для подсчета баллов (баллов за 1 единицу)
  unit?: string; // единица измерения (если нужна)
}

export interface CompetitionInfo {
  title: string;
  startDate: string;
  endDate: string;
}

export interface AdminState {
  parameters: Parameter[];
  revenueFormula: {
    baseAmount: number; // 50000
    pointsPerBase: number; // 5
  };
}

export interface LogEntry {
  id: string;
  timestamp: string;
  action: string;
  details: string;
  user?: string;
}