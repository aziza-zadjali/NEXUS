import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from './ui/button';
import { Database, Ship, Package, Building2, Shield, LogOut, LayoutDashboard, Network, Users, FileText, Server } from 'lucide-react';

function Layout({ children, user }) {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const navItems = [
    { path: '/', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/domain-journey', label: 'Domains', icon: Users },
    { path: '/catalog', label: 'Catalog', icon: Database },
    { path: '/contracts', label: 'Contracts', icon: FileText },
    { path: '/platform', label: 'Platform', icon: Server },
    { path: '/governance', label: 'Governance', icon: Shield }
  ];

  return (
    <div className="min-h-screen bg-slate-50 data-mesh-grid">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center gap-4 cursor-pointer" onClick={() => navigate('/')}>
              <div className="p-3 bg-cyan-500 rounded-2xl shadow-lg">
                <Network className="h-7 w-7 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-black text-slate-900 uppercase tracking-tighter leading-none">NEXUS</h1>
                <p className="text-xs text-cyan-600 font-bold uppercase tracking-widest leading-none mt-1">Oman Data Mesh</p>
              </div>
            </div>
            
            <div className="flex items-center gap-6">
              <div className="text-right">
                <p className="text-sm font-black text-slate-900 uppercase tracking-tight">{user?.name}</p>
                <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">{user?.domain} • {user?.role}</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                data-testid="logout-button"
                className="flex items-center gap-2 font-bold uppercase text-xs tracking-wider"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <nav className="bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-1 overflow-x-auto py-3">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              const classes = 'flex items-center gap-2 px-5 py-3 rounded-2xl text-xs font-black uppercase whitespace-nowrap transition-all tracking-wider ';
              const activeClass = isActive ? 'bg-cyan-500 text-white shadow-lg' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900';
              
              return (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className={classes + activeClass}
                  data-testid={'nav-' + item.label.toLowerCase().replace(/ /g, '-')}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      <footer className="bg-white border-t border-slate-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <p className="text-center text-xs text-slate-500 font-bold uppercase tracking-widest">
            Oman National Hydrogen Data Mesh • Decentralized Architecture
          </p>
        </div>
      </footer>
      
      <div className="fixed bottom-8 right-8 glass-panel px-6 py-4 rounded-full shadow-2xl flex items-center space-x-4 z-40 transform hover:scale-105 transition-transform cursor-pointer border border-slate-200">
        <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse"></div>
        <div className="text-left border-l pl-4 border-slate-200">
          <p className="text-xs font-black text-slate-400 uppercase tracking-widest leading-none">Mesh Sync</p>
          <p className="text-xs font-black text-slate-800 mt-1 uppercase tracking-tighter leading-none">Active</p>
        </div>
      </div>
    </div>
  );
}

export default Layout;
