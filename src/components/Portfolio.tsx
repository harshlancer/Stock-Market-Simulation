
import { useState } from 'react';
import { ArrowUpRight, ArrowDownRight, Wallet, Clock, RefreshCw } from 'lucide-react';
import { Portfolio as PortfolioType, StockWithHistory } from '../types/stock';
import { formatCurrency, formatPercent } from '../lib/stockData';

interface PortfolioProps {
  portfolio: PortfolioType;
  stocks: StockWithHistory[];
  onSelectStock: (stock: StockWithHistory) => void;
}

const Portfolio = ({ portfolio, stocks, onSelectStock }: PortfolioProps) => {
  const [activeTab, setActiveTab] = useState<'holdings' | 'history'>('holdings');
  
  // Calculate portfolio performance
  const getPerformance = () => {
    // Calculate total gain/loss
    let totalGainLoss = 0;
    let totalInvested = 0;
    
    portfolio.holdings.forEach((holding) => {
      const stock = stocks.find(s => s.symbol === holding.symbol);
      if (stock) {
        const currentValue = stock.price * holding.shares;
        const invested = holding.totalInvested;
        totalGainLoss += (currentValue - invested);
        totalInvested += invested;
      }
    });
    
    const performancePercent = totalInvested > 0 
      ? (totalGainLoss / totalInvested) * 100 
      : 0;
      
    return {
      value: totalGainLoss,
      percent: performancePercent
    };
  };
  
  const performance = getPerformance();
  const isPositive = performance.value >= 0;
  
  return (
    <div className="animate-fade-in">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">
        <div className="glass border border-gray-100 rounded-xl p-5 shadow-sm">
          <div className="flex items-center gap-2 text-gray-600 mb-2">
            <Wallet className="h-4 w-4" />
            <span className="text-sm">Total Value</span>
          </div>
          <div className="text-2xl font-semibold">{formatCurrency(portfolio.totalValue)}</div>
        </div>
        
        <div className="glass border border-gray-100 rounded-xl p-5 shadow-sm">
          <div className="flex items-center gap-2 text-gray-600 mb-2">
            <RefreshCw className="h-4 w-4" />
            <span className="text-sm">Cash Balance</span>
          </div>
          <div className="text-2xl font-semibold">{formatCurrency(portfolio.cashBalance)}</div>
        </div>
        
        <div className="glass border border-gray-100 rounded-xl p-5 shadow-sm">
          <div className="flex items-center gap-2 text-gray-600 mb-2">
            {isPositive ? (
              <ArrowUpRight className="h-4 w-4 text-green-600" />
            ) : (
              <ArrowDownRight className="h-4 w-4 text-red-600" />
            )}
            <span className="text-sm">Total {isPositive ? 'Gain' : 'Loss'}</span>
          </div>
          <div className={`text-2xl font-semibold ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
            {formatCurrency(Math.abs(performance.value))}
            <span className="text-sm ml-2">
              ({isPositive ? '+' : ''}{formatPercent(performance.percent)})
            </span>
          </div>
        </div>
      </div>
      
      <div className="glass border border-gray-100 rounded-xl overflow-hidden shadow-sm mb-5">
        <div className="flex border-b border-gray-100">
          <button
            className={`flex-1 py-3 px-4 text-center transition-colors ${
              activeTab === 'holdings' 
                ? 'bg-gray-50 border-b-2 border-primary font-medium text-gray-900' 
                : 'text-gray-600 hover:bg-gray-50'
            }`}
            onClick={() => setActiveTab('holdings')}
          >
            Holdings
          </button>
          <button
            className={`flex-1 py-3 px-4 text-center transition-colors ${
              activeTab === 'history' 
                ? 'bg-gray-50 border-b-2 border-primary font-medium text-gray-900' 
                : 'text-gray-600 hover:bg-gray-50'
            }`}
            onClick={() => setActiveTab('history')}
          >
            Trade History
          </button>
        </div>
        
        {activeTab === 'holdings' ? (
          <div className="overflow-x-auto">
            {portfolio.holdings.length > 0 ? (
              <table className="min-w-full">
                <thead className="bg-gray-50/80">
                  <tr>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Symbol
                    </th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Shares
                    </th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Avg. Price
                    </th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Current Value
                    </th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Gain/Loss
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {portfolio.holdings.map((holding) => {
                    const stock = stocks.find(s => s.symbol === holding.symbol);
                    if (!stock) return null;
                    
                    const currentValue = stock.price * holding.shares;
                    const gainLoss = currentValue - holding.totalInvested;
                    const gainLossPercent = (gainLoss / holding.totalInvested) * 100;
                    const isGain = gainLoss >= 0;
                    
                    return (
                      <tr 
                        key={holding.symbol} 
                        className="hover:bg-gray-50 cursor-pointer" 
                        onClick={() => {
                          const stockToSelect = stocks.find(s => s.symbol === holding.symbol);
                          if (stockToSelect) onSelectStock(stockToSelect);
                        }}
                      >
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{holding.symbol}</div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                          {holding.shares}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatCurrency(holding.averageBuyPrice)}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatCurrency(currentValue)}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className={`text-sm ${isGain ? 'text-green-600' : 'text-red-600'}`}>
                            {isGain ? '+' : ''}{formatCurrency(gainLoss)}
                            <span className="block text-xs">
                              ({isGain ? '+' : ''}{formatPercent(gainLossPercent)})
                            </span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            ) : (
              <div className="py-10 text-center text-gray-500">
                <div className="text-lg font-medium mb-2">No holdings yet</div>
                <p className="text-sm">Start trading to build your portfolio.</p>
              </div>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            {portfolio.tradeHistory.length > 0 ? (
              <table className="min-w-full">
                <thead className="bg-gray-50/80">
                  <tr>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Symbol
                    </th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Shares
                    </th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Price
                    </th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {portfolio.tradeHistory.map((trade, index) => (
                    <tr 
                      key={index} 
                      className="hover:bg-gray-50 cursor-pointer"
                      onClick={() => {
                        const stockToSelect = stocks.find(s => s.symbol === trade.symbol);
                        if (stockToSelect) onSelectStock(stockToSelect);
                      }}
                    >
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className={`inline-flex text-xs font-medium px-2 py-1 rounded-full ${
                          trade.type === 'BUY' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {trade.type}
                        </span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {trade.symbol}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                        {trade.shares}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatCurrency(trade.price)}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5" />
                          {new Date(trade.timestamp).toLocaleString()}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="py-10 text-center text-gray-500">
                <div className="text-lg font-medium mb-2">No trade history</div>
                <p className="text-sm">Your trades will appear here.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Portfolio;
