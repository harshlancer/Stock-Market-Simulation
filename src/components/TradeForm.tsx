
import { useState, useEffect } from 'react';
import { ArrowUpCircle, ArrowDownCircle } from 'lucide-react';
import { StockWithHistory, Portfolio } from '../types/stock';
import { formatCurrency, executeTrade } from '../lib/stockData';
import { toast } from '@/components/ui/use-toast';

interface TradeFormProps {
  stock: StockWithHistory;
  portfolio: Portfolio;
  onTradeExecuted: (updatedPortfolio: Portfolio) => void;
}

const TradeForm = ({ stock, portfolio, onTradeExecuted }: TradeFormProps) => {
  const [action, setAction] = useState<'BUY' | 'SELL'>('BUY');
  const [shares, setShares] = useState<number>(0);
  const [estimatedCost, setEstimatedCost] = useState<number>(0);
  
  // Find current holding for this stock if any
  const currentHolding = portfolio.holdings.find(h => h.symbol === stock.symbol);
  
  // Calculate the max shares that can be bought or sold
  const maxBuyShares = Math.floor(portfolio.cashBalance / stock.price);
  const maxSellShares = currentHolding?.shares || 0;
  
  // Reset shares and recalculate when stock or action changes
  useEffect(() => {
    setShares(0);
    setEstimatedCost(0);
  }, [stock.symbol, action]);
  
  // Update the estimated cost when shares changes
  useEffect(() => {
    setEstimatedCost(shares * stock.price);
  }, [shares, stock.price]);
  
  // Handle share input change
  const handleSharesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value) || 0;
    const maxShares = action === 'BUY' ? maxBuyShares : maxSellShares;
    setShares(Math.min(Math.max(0, value), maxShares));
  };
  
  // Handle slider change
  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value) || 0;
    setShares(value);
  };
  
  // Execute the trade
  const handleExecuteTrade = () => {
    if (shares <= 0) {
      toast({
        title: "Invalid trade",
        description: "Please enter a valid number of shares.",
        variant: "destructive"
      });
      return;
    }
    
    const result = executeTrade(
      portfolio,
      action,
      stock.symbol,
      shares,
      stock.price
    );
    
    if (result.success) {
      onTradeExecuted(result.portfolio);
      toast({
        title: `${action === 'BUY' ? 'Purchase' : 'Sale'} Complete`,
        description: `${action === 'BUY' ? 'Bought' : 'Sold'} ${shares} shares of ${stock.symbol} at ${formatCurrency(stock.price)} per share.`,
        variant: "default"
      });
      setShares(0);
    } else if (result.message) {
      toast({
        title: "Trade Failed",
        description: result.message,
        variant: "destructive"
      });
    }
  };
  
  return (
    <div className="glass rounded-xl overflow-hidden border border-gray-100 shadow-sm p-5 animate-fade-in">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Trade {stock.symbol}</h3>
      
      <div className="flex gap-2 mb-5">
        <button
          className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg transition-colors ${
            action === 'BUY'
              ? 'bg-green-100 text-green-700 font-medium'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
          onClick={() => setAction('BUY')}
        >
          <ArrowUpCircle className="h-4 w-4" />
          Buy
        </button>
        <button
          className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg transition-colors ${
            action === 'SELL'
              ? 'bg-red-100 text-red-700 font-medium'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
          onClick={() => setAction('SELL')}
          disabled={!currentHolding || currentHolding.shares <= 0}
        >
          <ArrowDownCircle className="h-4 w-4" />
          Sell
        </button>
      </div>
      
      <div className="mb-4">
        <div className="flex items-center justify-between mb-1">
          <label htmlFor="shares" className="block text-sm font-medium text-gray-700">
            Number of Shares
          </label>
          <span className="text-xs text-gray-500">
            Max: {action === 'BUY' ? maxBuyShares : maxSellShares}
          </span>
        </div>
        <input
          type="number"
          id="shares"
          min="0"
          max={action === 'BUY' ? maxBuyShares : maxSellShares}
          value={shares || ''}
          onChange={handleSharesChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
        />
      </div>
      
      <div className="mb-5">
        <input
          type="range"
          min="0"
          max={action === 'BUY' ? maxBuyShares : maxSellShares}
          value={shares}
          onChange={handleSliderChange}
          className="w-full"
          disabled={action === 'SELL' && (!currentHolding || currentHolding.shares <= 0)}
        />
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>0</span>
          <span>{Math.floor((action === 'BUY' ? maxBuyShares : maxSellShares) / 2)}</span>
          <span>{action === 'BUY' ? maxBuyShares : maxSellShares}</span>
        </div>
      </div>
      
      <div className="bg-gray-50 p-4 rounded-lg mb-5">
        <div className="flex justify-between text-sm mb-2">
          <span className="text-gray-600">Price per Share:</span>
          <span className="font-medium">{formatCurrency(stock.price)}</span>
        </div>
        
        <div className="flex justify-between text-sm mb-2">
          <span className="text-gray-600">Estimated Cost:</span>
          <span className="font-medium">{formatCurrency(estimatedCost)}</span>
        </div>
        
        {action === 'BUY' && (
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Remaining Cash:</span>
            <span className="font-medium">{formatCurrency(portfolio.cashBalance - estimatedCost)}</span>
          </div>
        )}
        
        {action === 'SELL' && currentHolding && (
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Remaining Shares:</span>
            <span className="font-medium">{currentHolding.shares - shares}</span>
          </div>
        )}
      </div>
      
      <button
        onClick={handleExecuteTrade}
        disabled={shares <= 0}
        className={`w-full py-3 px-4 rounded-lg text-white font-medium transition-all ${
          shares > 0
            ? action === 'BUY'
              ? 'bg-green-600 hover:bg-green-700'
              : 'bg-red-600 hover:bg-red-700'
            : 'bg-gray-300 cursor-not-allowed'
        }`}
      >
        {action === 'BUY' ? 'Buy' : 'Sell'} {shares} Shares
      </button>
    </div>
  );
};

export default TradeForm;
