import { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { useTravelStore } from '@/lib/store';
import {
  LayoutDashboard,
  Plane,
  MapPin,
  Users,
  TrendingUp,
  BarChart3,
  Settings,
  Menu,
  X,
  Plus,
  FileText,
  LogOut,
  User,
  Shield,
  ChevronLeft,
  ChevronRight,
  CalendarPlus,
  Coins,
  Search,
} from 'lucide-react';

import { Button } from '@/components/ui/button';

const CURRENCY_SYMBOLS = {
  'PHP': '₱',
  'USD': '$',
  'EUR': '€',
  'GBP': '£',
  'JPY': '¥',
  'KRW': '₩',
  'SGD': 'S$',
  'BTC': '₿',
};

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [location, setLocationPath] = useLocation();
  const { user, logout, trips, bookings, travelers, settings, updateSettings, fetchData } = useTravelStore();
  const [searchQuery, setSearchQuery] = useState('');

  const isAdmin = user?.role === 'admin';

  // Client nav: Only Overview (Dashboard) + Account (Profile, Settings)
  // Admin nav: All sections
  const navItems = isAdmin
    ? [
        { label: 'Dashboard', href: '/', icon: LayoutDashboard, section: 'OVERVIEW' },
        { label: 'Bookings', href: '/bookings', icon: Plane, section: 'MANAGEMENT' },
        { label: 'Itineraries', href: '/itineraries', icon: MapPin, section: 'MANAGEMENT' },
        { label: 'Travelers', href: '/travelers', icon: Users, section: 'MANAGEMENT' },
        { label: 'Profit', href: '/expenses', icon: TrendingUp, section: 'MANAGEMENT' },
        { label: 'Reports', href: '/reports', icon: BarChart3, section: 'ANALYTICS' },
        { label: 'Approvals', href: '/approvals', icon: FileText, section: 'ADMIN' },
        { label: 'Profile', href: '/profile', icon: User, section: 'ACCOUNT' },
        { label: 'Settings', href: '/settings', icon: Settings, section: 'ACCOUNT' },
      ]
    : [
        { label: 'Overview', href: '/', icon: LayoutDashboard, section: 'OVERVIEW' },
        { label: 'My Bookings', href: '/my-bookings', icon: CalendarPlus, section: 'BOOKINGS' },
        { label: 'Requests', href: '/approvals', icon: FileText, section: 'BOOKINGS' },
        { label: 'Itineraries', href: '/itineraries', icon: MapPin, section: 'TRIPS' },
        { label: 'Profile', href: '/profile', icon: User, section: 'ACCOUNT' },
      ];

  const isActive = (href: string) => location === href;

  const handleLogout = () => {
    logout();
    setLocationPath('/login');
  };

  const getSearchResults = () => {
    if (!searchQuery.trim()) return [];
    
    const term = searchQuery.toLowerCase();
    const results: any[] = [];

    trips.filter(t => t.destination.toLowerCase().includes(term)).forEach(t => {
      results.push({ id: t.id, type: 'Trip', label: t.destination, icon: MapPin, href: '/itineraries' });
    });

    bookings.filter(b => (b.name || b.property || '').toLowerCase().includes(term)).forEach(b => {
      results.push({ id: b.id, type: 'Booking', label: b.name || b.property, icon: Plane, href: '/bookings' });
    });

    travelers.filter(t => t.name.toLowerCase().includes(term)).forEach(t => {
      results.push({ id: t.id, type: 'Traveler', label: t.name, icon: Users, href: '/travelers' });
    });

    return results.slice(0, 6);
  };

  const searchResults = getSearchResults();

  const getPageTitle = () => {
    const titles: Record<string, string> = {
      '/': isAdmin ? 'Dashboard' : 'Overview',
      '/my-bookings': 'My Bookings',
      '/bookings': 'Bookings',
      '/itineraries': 'Itineraries',
      '/travelers': 'Travelers',
      '/expenses': 'Profit',
      '/reports': 'Reports',
      '/approvals': 'Approvals',
      '/profile': 'Profile',
      '/settings': 'Settings',
    };
    return titles[location] || '';
  };

  return (
    <div className="flex h-screen bg-background">
      {/* Mobile Backdrop */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-full bg-sidebar border-r border-sidebar-border transition-all duration-300 z-40
          ${ /* Mobile: full overlay controlled by mobileMenuOpen */'' }
          ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0
          ${sidebarOpen ? 'w-64' : 'w-20'} lg:block
        `}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between p-4 border-b border-sidebar-border">
            <Link href="/">
              <div className="flex items-center gap-3 cursor-pointer">
                <div className="w-10 h-10 bg-black rounded-full flex items-center justify-center overflow-hidden">
                  <img src="/favicon-tms.png" className="w-full h-full object-cover rounded-full" alt="TRAVEL" />
                </div>
                {sidebarOpen && (
                  <span className="font-bold text-sidebar-foreground" style={{ fontFamily: 'Syne' }}>
                    TRAVEL
                  </span>
                )}
              </div>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto px-2 py-4 space-y-1">
            {navItems.reduce((acc: React.ReactNode[], item, idx) => {
              const section = item.section;
              const prevSection = idx > 0 ? navItems[idx - 1].section : null;

              if (section !== prevSection) {
                acc.push(
                  <div key={`section-${section}`} className="pt-4 pb-2">
                    {sidebarOpen && (
                      <p className="px-4 text-xs font-semibold text-sidebar-muted-foreground uppercase tracking-wider">
                        {section}
                      </p>
                    )}
                  </div>
                );
              }

              const Icon = item.icon;
              acc.push(
                <Link key={item.href} href={item.href}>
                  <div
                    className={`nav-link flex items-center gap-3 px-4 py-3 rounded-lg transition-colors duration-200 cursor-pointer ${
                      isActive(item.href)
                        ? 'bg-black text-white'
                        : 'text-foreground hover:bg-gray-100'
                    }`}
                  >
                    {false ? (
                      <div />
                    ) : (
                      <Icon className="w-5 h-5 flex-shrink-0" />
                    )}
                    {sidebarOpen && (
                      <span className="text-sm font-medium flex-1">{item.label}</span>
                    )}
                  </div>
                </Link>
              );

              // Inject Currency Selector before Profile
              if (item.label === 'Profile') {
                acc.pop(); // Temporarily remove profile to insert currency before it
                acc.push(
                  <div key="currency-selector" className="px-2 py-2">
                    <div className="px-4 py-2 bg-white rounded-lg group cursor-pointer transition-all hover:bg-black active:scale-[0.98] shadow-sm relative">
                      <select 
                        value={settings.currency.split(' ')[0]} 
                        onChange={(e) => updateSettings({ currency: e.target.value })}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                      >
                        <option value="PHP" className="text-black bg-white">PHP (₱)</option>
                        <option value="USD" className="text-black bg-white">USD ($)</option>
                        <option value="EUR" className="text-black bg-white">EUR (€)</option>
                        <option value="GBP" className="text-black bg-white">GBP (£)</option>
                        <option value="JPY" className="text-black bg-white">JPY (¥)</option>
                        <option value="KRW" className="text-black bg-white">KRW (₩)</option>
                        <option value="SGD" className="text-black bg-white">SGD (S$)</option>
                        <option value="BTC" className="text-black bg-white">BTC (₿)</option>
                      </select>
                      <div className="flex items-center justify-between gap-2 overflow-hidden pointer-events-none">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 bg-gray-100 rounded flex items-center justify-center group-hover:bg-white/20 transition-colors">
                            <Coins className="w-3.5 h-3.5 text-black group-hover:text-white transition-colors" />
                          </div>
                          <span className="text-[10px] font-bold text-black group-hover:text-white transition-colors">
                            {settings.currency.split(' ')[0]} ({CURRENCY_SYMBOLS[settings.currency.split(' ')[0] as keyof typeof CURRENCY_SYMBOLS] || '$'})
                          </span>
                        </div>
                        <ChevronRight className="w-3 h-3 text-gray-400 group-hover:text-white group-hover:translate-x-1 transition-all" />
                      </div>
                    </div>
                  </div>
                );
                acc.push(
                  <Link key={item.href} href={item.href}>
                    <div
                      onClick={() => setMobileMenuOpen(false)}
                      className={`group flex items-center gap-3 px-4 py-3 mx-2 rounded-lg transition-all duration-300 cursor-pointer ${isActive(item.href) ? 'bg-black text-white shadow-lg shadow-black/10' : 'text-zinc-500 hover:bg-zinc-100 hover:text-black'}`}
                    >
                      <div className="relative">
                        <Icon className={`w-5 h-5 transition-colors ${isActive(item.href) ? 'text-white' : 'text-zinc-400 group-hover:text-black'}`} />
                        {isActive(item.href) && (
                          <div className="absolute -left-[18px] top-1/2 -translate-y-1/2 w-1 h-5 bg-white rounded-r-full" />
                        )}
                      </div>
                      {sidebarOpen && <span className="nav-label text-[13px] tracking-tight">{item.label}</span>}
                    </div>
                  </Link>
                );
              }

              return acc;
            }, [])}
          </nav>

          {/* User Info & Logout */}
          <div className="p-4 border-t border-sidebar-border space-y-3">
            {sidebarOpen && user && (
              <div className="px-4 py-3 bg-sidebar-accent/20 rounded-xl flex items-center gap-3">
                <div className="w-10 h-10 bg-black rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0 overflow-hidden">
                  {user.avatar ? (
                    <img src={user.avatar} className="w-full h-full object-cover" alt="Profile" />
                  ) : (
                    user.full_name.charAt(0).toUpperCase()
                  )}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-sidebar-foreground truncate" style={{ fontFamily: 'Syne' }}>{user.full_name}</p>
                  <p className="text-[11px] font-medium text-sidebar-muted-foreground truncate uppercase tracking-wider">{user.role}</p>
                </div>
              </div>
            )}
            <Button
              onClick={handleLogout}
              variant="outline"
              size="sm"
              className="w-full justify-start"
            >
              <LogOut className="w-4 h-4 mr-2" />
              {sidebarOpen && 'Logout'}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="w-full text-black hover:bg-gray-100"
            >
              {sidebarOpen ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className={`flex-1 flex flex-col transition-all duration-300 ml-0 ${sidebarOpen ? 'lg:ml-64' : 'lg:ml-20'}`}>
        {/* Top Bar */}
        <header className="bg-card border-b border-border px-4 md:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Mobile hamburger */}
            <button
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
              onClick={() => setMobileMenuOpen(true)}
            >
              <Menu className="w-5 h-5 text-foreground" />
            </button>
            <h1 className="text-xl md:text-2xl font-bold text-foreground" style={{ fontFamily: 'Syne' }}>
              {getPageTitle()}
            </h1>
          </div>
          <div className="flex items-center gap-4 relative">
            {isAdmin && (
              <div className="relative hidden md:block">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search everything..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-64 pl-10 pr-4 py-2.5 bg-input border border-border rounded-xl text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-black transition-all"
                />
                
                {searchQuery.trim().length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-xl shadow-xl overflow-hidden z-50 py-2">
                    {searchResults.length > 0 ? (
                      searchResults.map((res) => {
                        const ItemIcon = res.icon;
                        return (
                          <button
                            key={res.id}
                            onClick={() => {
                              setLocationPath(res.href);
                              setSearchQuery('');
                            }}
                            className="w-full text-left px-4 py-3 hover:bg-black/5 transition-colors flex items-start gap-3"
                          >
                            <div className="w-8 h-8 rounded-lg bg-black/5 flex items-center justify-center flex-shrink-0 mt-0.5">
                              <ItemIcon className="w-4 h-4 text-black" />
                            </div>
                            <div>
                              <p className="text-sm font-bold text-foreground truncate">{res.label}</p>
                              <p className="text-[11px] font-medium text-muted-foreground tracking-wider uppercase">{res.type}</p>
                            </div>
                          </button>
                        );
                      })
                    ) : (
                      <div className="px-4 py-6 text-center text-sm text-muted-foreground">
                        No matching results found
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto bg-background pb-20 lg:pb-0">
          {children}
        </main>

        {/* Mobile Bottom Nav */}
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-card border-t border-border z-40 flex items-center justify-around safe-bottom">
          {navItems.slice(0, 5).map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <Link key={item.href} href={item.href}>
                <div
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex flex-col items-center gap-1 px-3 py-3 transition-colors cursor-pointer ${
                    active ? 'text-black' : 'text-muted-foreground'
                  }`}
                >
                  <Icon className={`w-5 h-5 ${active ? 'text-black' : 'text-muted-foreground'}`} />
                  <span className={`text-[10px] font-semibold tracking-tight ${active ? 'text-black' : 'text-muted-foreground'}`}>
                    {item.label}
                  </span>
                  {active && <div className="w-1 h-1 rounded-full bg-black" />}
                </div>
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
