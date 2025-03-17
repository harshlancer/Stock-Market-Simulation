
import { useState, useEffect, useCallback } from 'react';
import Navbar from '../components/Navbar';
import StockChart from '../components/StockChart';
import StockList from '../components/StockList';
import TradeForm from '../components/TradeForm';
import Portfolio from '../components/Portfolio';
import { mockStocks, updateStockPrices, initialPortfolio, formatCurrency } from '../lib/stockData';
import { StockWithHistory, Portfolio as PortfolioType } from '../types/stock';
import { ArrowUpRight, ArrowDownRight, Newspaper } from 'lucide-react';

const Index = () => {
  // State
  const [stocks, setStocks] = useState<StockWithHistory[]>(mockStocks);
  const [selectedStock, setSelectedStock] = useState<StockWithHistory>(stocks[0]);
  const [portfolio, setPortfolio] = useState<PortfolioType>(initialPortfolio);
  const [currentTab, setCurrentTab] = useState('market');
  
  // Update stock prices on an interval
  useEffect(() => {
    const intervalId = setInterval(() => {
      setStocks(prevStocks => {
        const updatedStocks = updateStockPrices(prevStocks);
        
        // If a stock is selected, update it to reflect the new price
        if (selectedStock) {
          const updatedSelectedStock = updatedStocks.find(
            s => s.symbol === selectedStock.symbol
          );
          if (updatedSelectedStock) {
            setSelectedStock(updatedSelectedStock);
          }
        }
        
        return updatedStocks;
      });
    }, 5000); // Update every 5 seconds
    
    return () => clearInterval(intervalId);
  }, [selectedStock]);

  // Handle stock selection
  const handleSelectStock = useCallback((stock: StockWithHistory) => {
    setSelectedStock(stock);
    setCurrentTab('stocks');
  }, []);
  
  // Render market overview
  const renderMarketOverview = () => {
    // Calculate market stats
    const gainers = [...stocks].sort((a, b) => b.changePercent - a.changePercent).slice(0, 3);
    const losers = [...stocks].sort((a, b) => a.changePercent - b.changePercent).slice(0, 3);
    const marketValue = stocks.reduce((sum, stock) => sum + stock.price, 0);
    const marketChange = stocks.reduce((sum, stock) => sum + stock.change, 0);
    const marketChangePercent = (marketChange / (marketValue - marketChange)) * 100;
    
    return (
      <div className="animate-fade-in">
        <div className="glass border border-gray-100 rounded-xl p-6 shadow-sm mb-6">
          <h2 className="text-2xl font-semibold mb-4">Market Overview</h2>
          
          <div className="flex items-center gap-2 mb-5">
            <div className={`text-3xl font-bold ${marketChangePercent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(marketValue)}
            </div>
            <div className={`flex items-center ${marketChangePercent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {marketChangePercent >= 0 ? (
                <ArrowUpRight className="h-5 w-5" />
              ) : (
                <ArrowDownRight className="h-5 w-5" />
              )}
              <span className="text-lg font-medium">
                {marketChangePercent >= 0 ? '+' : ''}
                {marketChangePercent.toFixed(2)}%
              </span>
            </div>
          </div>
          
          <div className="w-full h-[400px] overflow-hidden rounded-lg mb-4">
            <StockChart 
              data={stocks[0].history}
              symbol="MARKET"
              type="area"
              animated={true}
            />
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="glass border border-gray-100 rounded-xl p-6 shadow-sm">
            <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
              <ArrowUpRight className="h-5 w-5 text-green-600" />
              Top Gainers
            </h3>
            <div className="space-y-4">
              {gainers.map(stock => (
                <div 
                  key={stock.symbol}
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={() => handleSelectStock(stock)}
                >
                  <div>
                    <div className="font-medium">{stock.symbol}</div>
                    <div className="text-sm text-gray-500">{stock.companyName}</div>
                  </div>
                  <div className="text-right">
                    <div>{formatCurrency(stock.price)}</div>
                    <div className="text-green-600 text-sm">
                      +{stock.changePercent.toFixed(2)}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="glass border border-gray-100 rounded-xl p-6 shadow-sm">
            <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
              <ArrowDownRight className="h-5 w-5 text-red-600" />
              Top Losers
            </h3>
            <div className="space-y-4">
              {losers.map(stock => (
                <div 
                  key={stock.symbol}
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={() => handleSelectStock(stock)}
                >
                  <div>
                    <div className="font-medium">{stock.symbol}</div>
                    <div className="text-sm text-gray-500">{stock.companyName}</div>
                  </div>
                  <div className="text-right">
                    <div>{formatCurrency(stock.price)}</div>
                    <div className="text-red-600 text-sm">
                      {stock.changePercent.toFixed(2)}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        <div className="glass border border-gray-100 rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
            <Newspaper className="h-5 w-5 text-gray-600" />
            Market News
          </h3>
          <div className="space-y-4">
            <div className="p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors">
              <div className="text-sm text-gray-500 mb-1">Today</div>
              <h4 className="font-medium mb-2">Tech Stocks Rally on Strong Earnings Reports</h4>
              <p className="text-sm text-gray-600">Major tech companies exceeded expectations, driving the sector to new heights.</p>
            </div>
            <div className="p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors">
              <div className="text-sm text-gray-500 mb-1">Yesterday</div>
              <h4 className="font-medium mb-2">Federal Reserve Signals Potential Rate Cut</h4>
              <p className="text-sm text-gray-600">Markets responded positively to hints of upcoming monetary policy changes.</p>
            </div>
            <div className="p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors">
              <div className="text-sm text-gray-500 mb-1">2 days ago</div>
              <h4 className="font-medium mb-2">Energy Sector Faces Headwinds Amid Global Concerns</h4>
              <p className="text-sm text-gray-600">Oil prices fluctuate as geopolitical tensions affect supply chains.</p>
            </div>
          </div>
        </div>
      </div>
    );
  };
  
  // Render stock details and trading interface
  const renderStockDetails = () => {
    if (!selectedStock) return null;
    
    return (
      <div className="animate-fade-in">
        <div className="glass border border-gray-100 rounded-xl p-6 shadow-sm mb-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h2 className="text-2xl font-semibold">{selectedStock.symbol}</h2>
              <p className="text-gray-600">{selectedStock.companyName}</p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-semibold">{formatCurrency(selectedStock.price)}</div>
              <div className={`flex items-center justify-end ${selectedStock.changePercent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {selectedStock.changePercent >= 0 ? (
                  <ArrowUpRight className="h-4 w-4" />
                ) : (
                  <ArrowDownRight className="h-4 w-4" />
                )}
                <span className="ml-1">
                  {selectedStock.change >= 0 ? '+' : ''}
                  {selectedStock.change} ({selectedStock.changePercent >= 0 ? '+' : ''}
                  {selectedStock.changePercent.toFixed(2)}%)
                </span>
              </div>
            </div>
          </div>
          
          <div className="h-[400px] w-full mb-4">
            <StockChart 
              data={selectedStock.history}
              symbol={selectedStock.symbol}
              type="area"
              animated={true}
            />
          </div>
          
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="p-3 bg-gray-50 rounded-lg">
              <div className="text-sm text-gray-500 mb-1">Sector</div>
              <div className="font-medium">{selectedStock.sector}</div>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg">
              <div className="text-sm text-gray-500 mb-1">52-Week High</div>
              <div className="font-medium">
                {formatCurrency(Math.max(...selectedStock.history.map(h => h.price)))}
              </div>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg">
              <div className="text-sm text-gray-500 mb-1">52-Week Low</div>
              <div className="font-medium">
                {formatCurrency(Math.min(...selectedStock.history.map(h => h.price)))}
              </div>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <TradeForm 
            stock={selectedStock} 
            portfolio={portfolio}
            onTradeExecuted={setPortfolio}
          />
          
          <div className="glass border border-gray-100 rounded-xl p-6 shadow-sm">
            <h3 className="text-lg font-medium mb-4">Company Overview</h3>
            <p className="text-gray-600 mb-4">
              {selectedStock.companyName} is a leading company in the {selectedStock.sector} sector.
              The company has shown {selectedStock.changePercent >= 0 ? 'positive' : 'negative'} performance recently,
              with a {selectedStock.changePercent.toFixed(2)}% change in stock price.
            </p>
            <div className="border-t border-gray-200 pt-4">
              <h4 className="font-medium mb-2">Your Position</h4>
              {portfolio.holdings.find(h => h.symbol === selectedStock.symbol) ? (
                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-gray-500">Shares:</span>
                      <span className="ml-2 font-medium">
                        {portfolio.holdings.find(h => h.symbol === selectedStock.symbol)?.shares}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500">Avg. Price:</span>
                      <span className="ml-2 font-medium">
                        {formatCurrency(portfolio.holdings.find(h => h.symbol === selectedStock.symbol)?.averageBuyPrice || 0)}
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-gray-500 text-sm">You don't own any shares of {selectedStock.symbol}.</div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };
  
  // Render portfolio section
  const renderPortfolio = () => {
    return (
      <Portfolio 
        portfolio={portfolio} 
        stocks={stocks}
        onSelectStock={handleSelectStock}
      />
    );
  };
  
  return (
    <div className="min-h-screen bg-background">
      <Navbar 
        currentTab={currentTab} 
        onChangeTab={setCurrentTab} 
      />
      
      <main className="max-w-7xl mx-auto px-4 py-20">
        <div className="grid grid-cols-4 gap-6">
          <div className="col-span-4 md:col-span-1">
            <StockList 
              stocks={stocks}
              onSelectStock={handleSelectStock}
              selectedStock={selectedStock}
            />
          </div>
          
          <div className="col-span-4 md:col-span-3">
            {currentTab === 'market' && renderMarketOverview()}
            {currentTab === 'stocks' && renderStockDetails()}
            {currentTab === 'portfolio' && renderPortfolio()}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
