
import { useState } from 'react';
import { Search, SortAsc, SortDesc, TrendingUp, TrendingDown } from 'lucide-react';
import { StockWithHistory } from '../types/stock';
import { formatCurrency, formatPercent } from '../lib/stockData';

interface StockListProps {
  stocks: StockWithHistory[];
  onSelectStock: (stock: StockWithHistory) => void;
  selectedStock?: StockWithHistory;
}

const StockList = ({ stocks, onSelectStock, selectedStock }: StockListProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'symbol' | 'price' | 'change'>('symbol');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  
  // Handle sorting
  const handleSort = (column: 'symbol' | 'price' | 'change') => {
    if (sortBy === column) {
      // Toggle direction if clicking the same column
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // Set new column and default to ascending
      setSortBy(column);
      setSortDirection('asc');
    }
  };
  
  // Filter and sort stocks
  const filteredStocks = stocks
    .filter(stock => {
      const query = searchQuery.toLowerCase();
      return (
        stock.symbol.toLowerCase().includes(query) ||
        stock.companyName.toLowerCase().includes(query)
      );
    })
    .sort((a, b) => {
      let comparison = 0;
      
      if (sortBy === 'symbol') {
        comparison = a.symbol.localeCompare(b.symbol);
      } else if (sortBy === 'price') {
        comparison = a.price - b.price;
      } else if (sortBy === 'change') {
        comparison = a.changePercent - b.changePercent;
      }
      
      return sortDirection === 'asc' ? comparison : -comparison;
    });
    
  return (
    <div className="glass border border-gray-100 rounded-xl overflow-hidden shadow-sm animate-fade-in">
      <div className="p-4 border-b border-gray-100">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <input
            type="text"
            placeholder="Search stocks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
          />
        </div>
      </div>
      
      <div className="overflow-hidden">
        <table className="min-w-full">
          <thead className="bg-gray-50/80">
            <tr>
              <th 
                scope="col" 
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('symbol')}
              >
                <div className="flex items-center gap-1">
                  Symbol
                  {sortBy === 'symbol' && (
                    sortDirection === 'asc' ? <SortAsc className="h-3 w-3" /> : <SortDesc className="h-3 w-3" />
                  )}
                </div>
              </th>
              <th 
                scope="col" 
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('price')}
              >
                <div className="flex items-center gap-1">
                  Price
                  {sortBy === 'price' && (
                    sortDirection === 'asc' ? <SortAsc className="h-3 w-3" /> : <SortDesc className="h-3 w-3" />
                  )}
                </div>
              </th>
              <th 
                scope="col" 
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('change')}
              >
                <div className="flex items-center gap-1">
                  Change
                  {sortBy === 'change' && (
                    sortDirection === 'asc' ? <SortAsc className="h-3 w-3" /> : <SortDesc className="h-3 w-3" />
                  )}
                </div>
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredStocks.map((stock) => (
              <tr 
                key={stock.symbol} 
                className={`hover:bg-gray-50 cursor-pointer transition-colors ${
                  selectedStock?.symbol === stock.symbol ? 'bg-blue-50' : ''
                }`}
                onClick={() => onSelectStock(stock)}
              >
                <td className="px-4 py-4 whitespace-nowrap">
                  <div className="flex flex-col">
                    <div className="text-sm font-medium text-gray-900">{stock.symbol}</div>
                    <div className="text-xs text-gray-500">{stock.companyName}</div>
                  </div>
                </td>
                <td className="px-4 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{formatCurrency(stock.price)}</div>
                </td>
                <td className="px-4 py-4 whitespace-nowrap">
                  <div className={`text-sm flex items-center gap-1 ${stock.changePercent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {stock.changePercent >= 0 ? (
                      <TrendingUp className="h-3.5 w-3.5" />
                    ) : (
                      <TrendingDown className="h-3.5 w-3.5" />
                    )}
                    <span>
                      {stock.change >= 0 ? '+' : ''}{stock.change} ({formatPercent(stock.changePercent)})
                    </span>
                  </div>
                </td>
              </tr>
            ))}
            
            {filteredStocks.length === 0 && (
              <tr>
                <td colSpan={3} className="px-4 py-8 text-center text-sm text-gray-500">
                  No stocks found matching your search.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default StockList;
