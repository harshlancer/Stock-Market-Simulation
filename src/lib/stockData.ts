
import { Stock, StockWithHistory, Portfolio, PortfolioItem, TradeAction } from '../types/stock';

// Initial mock stocks data
export const mockStocks: StockWithHistory[] = [
  {
    symbol: 'AAPL',
    companyName: 'Apple Inc.',
    price: 182.52,
    change: 3.26,
    changePercent: 1.82,
    sector: 'Technology',
    lastUpdated: new Date().toISOString(),
    history: generateMockHistoricalData(180, 150, 190)
  },
  {
    symbol: 'MSFT',
    companyName: 'Microsoft Corporation',
    price: 415.26,
    change: -2.34,
    changePercent: -0.56,
    sector: 'Technology',
    lastUpdated: new Date().toISOString(),
    history: generateMockHistoricalData(420, 380, 430)
  },
  {
    symbol: 'GOOGL',
    companyName: 'Alphabet Inc.',
    price: 146.68,
    change: 1.42,
    changePercent: 0.98,
    sector: 'Technology',
    lastUpdated: new Date().toISOString(),
    history: generateMockHistoricalData(145, 130, 155)
  },
  {
    symbol: 'AMZN',
    companyName: 'Amazon.com Inc.',
    price: 178.75,
    change: 2.18,
    changePercent: 1.23,
    sector: 'Consumer Cyclical',
    lastUpdated: new Date().toISOString(),
    history: generateMockHistoricalData(175, 160, 190)
  },
  {
    symbol: 'TSLA',
    companyName: 'Tesla, Inc.',
    price: 175.34,
    change: -4.12,
    changePercent: -2.30,
    sector: 'Automotive',
    lastUpdated: new Date().toISOString(),
    history: generateMockHistoricalData(180, 150, 200)
  },
  {
    symbol: 'META',
    companyName: 'Meta Platforms, Inc.',
    price: 485.39,
    change: 5.28,
    changePercent: 1.10,
    sector: 'Technology',
    lastUpdated: new Date().toISOString(),
    history: generateMockHistoricalData(470, 430, 500)
  },
  {
    symbol: 'NFLX',
    companyName: 'Netflix, Inc.',
    price: 609.25,
    change: 12.43,
    changePercent: 2.08,
    sector: 'Entertainment',
    lastUpdated: new Date().toISOString(),
    history: generateMockHistoricalData(590, 550, 620)
  },
  {
    symbol: 'JPM',
    companyName: 'JPMorgan Chase & Co.',
    price: 198.47,
    change: -0.76,
    changePercent: -0.38,
    sector: 'Financial Services',
    lastUpdated: new Date().toISOString(),
    history: generateMockHistoricalData(200, 190, 210)
  }
];

// Initial portfolio data
export const initialPortfolio: Portfolio = {
  holdings: [],
  cashBalance: 100000, // Starting with $100,000
  totalValue: 100000,
  tradeHistory: []
};

// Generate realistic looking historical data
function generateMockHistoricalData(currentPrice: number, minPrice: number, maxPrice: number, days = 30): { date: string, price: number, volume?: number }[] {
  const data = [];
  const now = new Date();
  
  let lastPrice = currentPrice * 0.85 + (Math.random() * 0.3 * currentPrice);
  
  for (let i = days; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    
    // Generate a somewhat realistic price movement
    const change = (Math.random() - 0.48) * 5; // Slightly biased towards increase
    let newPrice = lastPrice + change;
    
    // Ensure price stays within bounds
    if (newPrice < minPrice) newPrice = minPrice + Math.random() * 5;
    if (newPrice > maxPrice) newPrice = maxPrice - Math.random() * 5;
    
    lastPrice = newPrice;
    
    // Add some volume data
    const volume = Math.floor(100000 + Math.random() * 900000);
    
    data.push({
      date: date.toISOString().split('T')[0],
      price: parseFloat(newPrice.toFixed(2)),
      volume
    });
  }
  
  return data;
}

// Function to update stock prices with random movements
export function updateStockPrices(stocks: StockWithHistory[]): StockWithHistory[] {
  return stocks.map(stock => {
    // Generate random price movement, more volatile for certain stocks
    const volatilityFactor = stock.symbol === 'TSLA' ? 3 : 
                            (stock.symbol === 'NFLX' ? 2 : 1);
    const changePercent = (Math.random() - 0.48) * volatilityFactor; // Slightly biased for upward trend
    const change = stock.price * (changePercent / 100);
    const newPrice = parseFloat((stock.price + change).toFixed(2));
    
    // Update the history array with the latest price
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    
    // Check if we already have an entry for today
    let updatedHistory = [...stock.history];
    const lastEntry = updatedHistory[updatedHistory.length - 1];
    
    if (lastEntry.date === today) {
      // Update today's entry
      updatedHistory[updatedHistory.length - 1] = {
        ...lastEntry,
        price: newPrice
      };
    } else {
      // Add a new entry for today
      updatedHistory.push({
        date: today,
        price: newPrice,
        volume: Math.floor(100000 + Math.random() * 900000)
      });
    }
    
    return {
      ...stock,
      price: newPrice,
      change: parseFloat(change.toFixed(2)),
      changePercent: parseFloat(changePercent.toFixed(2)),
      lastUpdated: now.toISOString(),
      history: updatedHistory
    };
  });
}

// Function to execute a trade
export function executeTrade(
  portfolio: Portfolio,
  action: 'BUY' | 'SELL',
  symbol: string,
  shares: number,
  currentPrice: number
): { success: boolean; portfolio: Portfolio; message?: string } {
  // Create a copy of the portfolio to work with
  const updatedPortfolio = { ...portfolio };
  
  if (action === 'BUY') {
    const cost = shares * currentPrice;
    
    // Check if user has enough cash
    if (cost > updatedPortfolio.cashBalance) {
      return { 
        success: false, 
        portfolio: updatedPortfolio, 
        message: 'Insufficient cash balance for this purchase.' 
      };
    }
    
    // Update cash balance
    updatedPortfolio.cashBalance -= cost;
    
    // Find if stock is already in holdings
    const existingHoldingIndex = updatedPortfolio.holdings.findIndex(
      item => item.symbol === symbol
    );
    
    if (existingHoldingIndex >= 0) {
      // Update existing holding
      const existingHolding = updatedPortfolio.holdings[existingHoldingIndex];
      const totalShares = existingHolding.shares + shares;
      const totalCost = existingHolding.totalInvested + cost;
      
      updatedPortfolio.holdings[existingHoldingIndex] = {
        ...existingHolding,
        shares: totalShares,
        averageBuyPrice: parseFloat((totalCost / totalShares).toFixed(2)),
        totalInvested: parseFloat(totalCost.toFixed(2))
      };
    } else {
      // Add new holding
      updatedPortfolio.holdings.push({
        symbol,
        shares,
        averageBuyPrice: currentPrice,
        totalInvested: cost
      });
    }
  } else if (action === 'SELL') {
    // Find the holding
    const existingHoldingIndex = updatedPortfolio.holdings.findIndex(
      item => item.symbol === symbol
    );
    
    if (existingHoldingIndex === -1) {
      return {
        success: false,
        portfolio: updatedPortfolio,
        message: `You don't own any shares of ${symbol}.`
      };
    }
    
    const existingHolding = updatedPortfolio.holdings[existingHoldingIndex];
    
    // Check if user has enough shares
    if (shares > existingHolding.shares) {
      return {
        success: false,
        portfolio: updatedPortfolio,
        message: `You only have ${existingHolding.shares} shares to sell.`
      };
    }
    
    // Calculate sale proceeds
    const proceeds = shares * currentPrice;
    
    // Update cash balance
    updatedPortfolio.cashBalance += proceeds;
    
    // Update holdings
    const remainingShares = existingHolding.shares - shares;
    
    if (remainingShares === 0) {
      // Remove the holding entirely
      updatedPortfolio.holdings.splice(existingHoldingIndex, 1);
    } else {
      // Update the holding
      const percentSold = shares / existingHolding.shares;
      const investmentSold = existingHolding.totalInvested * percentSold;
      
      updatedPortfolio.holdings[existingHoldingIndex] = {
        ...existingHolding,
        shares: remainingShares,
        totalInvested: parseFloat((existingHolding.totalInvested - investmentSold).toFixed(2))
      };
    }
  }
  
  // Record the trade
  const tradeAction: TradeAction = {
    type: action,
    symbol,
    shares,
    price: currentPrice,
    timestamp: new Date().toISOString()
  };
  
  updatedPortfolio.tradeHistory = [tradeAction, ...updatedPortfolio.tradeHistory];
  
  // Recalculate total portfolio value
  updatedPortfolio.totalValue = calculatePortfolioValue(
    updatedPortfolio.holdings,
    updatedPortfolio.cashBalance,
    mockStocks
  );
  
  return { success: true, portfolio: updatedPortfolio };
}

// Calculate the current value of the portfolio
export function calculatePortfolioValue(
  holdings: PortfolioItem[],
  cashBalance: number,
  currentStocks: StockWithHistory[]
): number {
  const holdingsValue = holdings.reduce((total, holding) => {
    const stock = currentStocks.find(s => s.symbol === holding.symbol);
    if (stock) {
      return total + (stock.price * holding.shares);
    }
    return total;
  }, 0);
  
  return parseFloat((holdingsValue + cashBalance).toFixed(2));
}

// Format currency values
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value);
}

// Format percentage values
export function formatPercent(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'percent',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    signDisplay: 'exceptZero'
  }).format(value / 100);
}
