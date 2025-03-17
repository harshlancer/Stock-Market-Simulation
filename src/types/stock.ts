
export interface Stock {
  symbol: string;
  companyName: string;
  price: number;
  change: number;
  changePercent: number;
  sector: string;
  lastUpdated: string;
}

export interface HistoricalDataPoint {
  date: string;
  price: number;
  volume?: number;
}

export interface StockWithHistory extends Stock {
  history: HistoricalDataPoint[];
}

export interface PortfolioItem {
  symbol: string;
  shares: number;
  averageBuyPrice: number;
  totalInvested: number;
}

export interface TradeAction {
  type: 'BUY' | 'SELL';
  symbol: string;
  shares: number;
  price: number;
  timestamp: string;
}

export interface Portfolio {
  holdings: PortfolioItem[];
  cashBalance: number;
  totalValue: number;
  tradeHistory: TradeAction[];
}
