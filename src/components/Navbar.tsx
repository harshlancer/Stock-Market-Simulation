
import { useState, useEffect } from 'react';
import { Wallet, LineChart, BarChart3 } from 'lucide-react';

const Navbar = ({ 
  currentTab, 
  onChangeTab 
}: { 
  currentTab: string; 
  onChangeTab: (tab: string) => void;
}) => {
  const [scrolled, setScrolled] = useState(false);

  // Add scroll listener to detect when to add shadow to navbar
  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 10;
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [scrolled]);

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 backdrop-blur-lg transition-all duration-300 border-b ${
        scrolled ? 'bg-white/80 shadow-sm' : 'bg-white/50'
      }`}
    >
      <div className="flex items-center justify-between px-6 lg:px-10 py-4 max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <LineChart className="h-6 w-6 text-primary" />
          <h1 className="text-xl font-semibold tracking-tight">StockSim</h1>
        </div>
        
        <nav className="hidden md:flex items-center gap-6">
          <NavItem 
            icon={<LineChart className="h-4 w-4" />}
            label="Market"
            active={currentTab === 'market'}
            onClick={() => onChangeTab('market')}
          />
          <NavItem 
            icon={<BarChart3 className="h-4 w-4" />}
            label="Stocks"
            active={currentTab === 'stocks'}
            onClick={() => onChangeTab('stocks')}
          />
          <NavItem 
            icon={<Wallet className="h-4 w-4" />}
            label="Portfolio"
            active={currentTab === 'portfolio'}
            onClick={() => onChangeTab('portfolio')}
          />
        </nav>
        
        <div className="md:hidden flex items-center gap-4">
          <button 
            className={`p-2 rounded-full transition-colors ${currentTab === 'market' ? 'bg-primary/10 text-primary' : 'text-gray-500 hover:bg-gray-100'}`}
            onClick={() => onChangeTab('market')}
          >
            <LineChart className="h-5 w-5" />
          </button>
          <button
            className={`p-2 rounded-full transition-colors ${currentTab === 'stocks' ? 'bg-primary/10 text-primary' : 'text-gray-500 hover:bg-gray-100'}`}
            onClick={() => onChangeTab('stocks')}
          >
            <BarChart3 className="h-5 w-5" />
          </button>
          <button 
            className={`p-2 rounded-full transition-colors ${currentTab === 'portfolio' ? 'bg-primary/10 text-primary' : 'text-gray-500 hover:bg-gray-100'}`}
            onClick={() => onChangeTab('portfolio')}
          >
            <Wallet className="h-5 w-5" />
          </button>
        </div>
      </div>
    </header>
  );
};

const NavItem = ({ 
  icon, 
  label, 
  active, 
  onClick 
}: { 
  icon: React.ReactNode; 
  label: string; 
  active: boolean; 
  onClick: () => void;
}) => {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all duration-300 ${
        active 
          ? 'bg-primary/10 text-primary font-medium' 
          : 'text-gray-600 hover:bg-gray-100'
      }`}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
};

export default Navbar;
