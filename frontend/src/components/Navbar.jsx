import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Shield, Activity, AlertOctagon, FileWarning, BarChart2, 
  BookOpen, FileText, Users, User, LogOut, ChevronDown, Zap, Gauge,
  Menu, X
} from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const roleName = user?.role?.role_name || 'Security Analyst';
  const isAdmin = roleName === 'Administrator';
  const isSocManager = roleName === 'SOC Manager' || isAdmin;

  const onLogout = async (e) => {
    if (e) e.preventDefault();
    setDropdownOpen(false);
    setMobileMenuOpen(false);
    try {
      if (logout) await logout();
    } catch (err) {
      console.error(err);
    } finally {
      navigate('/login');
    }
  };

  const getRoleBadge = (role) => {
    switch (role) {
      case 'Administrator':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-cyber-danger/20 text-cyber-danger border border-cyber-danger/40">Admin</span>;
      case 'SOC Manager':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-yellow-500/20 text-yellow-400 border border-yellow-500/40">Manager</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-cyber-accent/20 text-cyber-accent border border-cyber-accent/40">Analyst</span>;
    }
  };

  const navLinks = [
    { name: 'Dashboard', path: '/dashboard', icon: Activity, show: true },
    { name: 'Alerts', path: '/alerts', icon: AlertOctagon, show: true },
    { name: 'Incidents', path: '/incidents', icon: FileWarning, show: true },
    { name: 'Analytics', path: '/analytics', icon: BarChart2, show: isSocManager },
    { name: 'Threat Intel', path: '/threat-intel', icon: BookOpen, show: true },
    { name: 'Reports', path: '/reports', icon: FileText, show: isSocManager },
    { name: 'User Admin', path: '/users', icon: Users, show: isAdmin }
  ];

  return (
    <nav className="bg-cyber-card/90 border-b border-cyber-border/70 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Left: Hamburger & Brand Logo */}
          <div className="flex items-center gap-3">
            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 -ml-2 rounded-lg text-cyber-muted hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
            
            <Link to="/dashboard" className="flex items-center gap-3 group">
              <div className="p-2 bg-cyber-accent/10 border border-cyber-accent/30 rounded-xl group-hover:border-cyber-accent transition-all">
                <Shield className="h-6 w-6 text-cyber-accent animate-pulse" />
              </div>
              <div className="block">
                <span className="text-lg font-bold text-white tracking-wider font-mono">NetShield<span className="text-cyber-accent">AI</span></span>
                <p className="text-[10px] text-cyber-muted tracking-widest uppercase">SOC Command Center</p>
              </div>
            </Link>
          </div>

          {/* Center: Navigation Links */}
          <div className="hidden md:flex items-center space-x-1">
            {navLinks.filter(l => l.show).map((link) => {
              const Icon = link.icon;
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                    isActive 
                      ? 'bg-cyber-accent/15 text-cyber-accent border border-cyber-accent/30 shadow-sm' 
                      : 'text-cyber-muted hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{link.name}</span>
                </Link>
              );
            })}
          </div>

          {/* Right: User Identity & Account Menu */}
          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-3 p-1.5 rounded-xl bg-cyber-bg/60 border border-cyber-border hover:border-cyber-accent transition-all cursor-pointer"
            >
              <div className="h-8 w-8 rounded-lg bg-cyber-accent/20 border border-cyber-accent/40 flex items-center justify-center font-bold text-cyber-accent font-mono text-sm">
                {(user?.full_name || user?.username || 'U')[0].toUpperCase()}
              </div>
              <div className="hidden sm:block text-left pr-1">
                <div className="text-xs font-bold text-white flex items-center gap-1.5">
                  <span className="truncate max-w-[100px]">{user?.full_name || user?.username || 'User'}</span>
                  {getRoleBadge(roleName)}
                </div>
                <div className="text-[10px] text-cyber-muted truncate max-w-[140px]">{user?.email}</div>
              </div>
              <ChevronDown className="h-4 w-4 text-cyber-muted" />
            </button>

            {/* Dropdown Menu */}
            {dropdownOpen && (
              <div 
                className="absolute right-0 mt-2 w-60 bg-cyber-card border border-cyber-border rounded-xl shadow-2xl overflow-hidden py-1 z-50 animate-in fade-in zoom-in-95 duration-150"
                onMouseLeave={() => setDropdownOpen(false)}
              >
                <div className="px-4 py-3 border-b border-cyber-border/60 bg-cyber-bg/50">
                  <p className="text-xs text-cyber-muted">Signed in as</p>
                  <p className="text-xs font-bold text-white truncate">{user?.username}</p>
                  <div className="mt-1">{getRoleBadge(roleName)}</div>
                </div>

                {isAdmin && (
                  <>
                    <div className="px-4 py-1.5 text-[10px] font-mono font-bold uppercase tracking-wider text-cyber-muted bg-slate-900/40">
                      System Admin Tools
                    </div>

                    <Link
                      to="/demo"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-xs text-indigo-300 hover:bg-indigo-950/50 transition-colors font-medium"
                    >
                      <Zap className="h-4 w-4 text-indigo-400" />
                      <span>Interactive Demo Mode</span>
                    </Link>

                    <Link
                      to="/health-validation"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-xs text-emerald-300 hover:bg-emerald-950/50 transition-colors font-medium"
                    >
                      <Gauge className="h-4 w-4 text-emerald-400" />
                      <span>AI Health &amp; Metrics</span>
                    </Link>

                    <div className="border-t border-cyber-border/60 my-1" />
                  </>
                )}

                <Link
                  to="/profile"
                  onClick={() => setDropdownOpen(false)}
                  className="flex items-center gap-2.5 px-4 py-2.5 text-xs text-white hover:bg-white/5 transition-colors"
                >
                  <User className="h-4 w-4 text-cyber-accent" />
                  <span>Profile &amp; Account Settings</span>
                </Link>

                {isAdmin && (
                  <Link
                    to="/users"
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2.5 text-xs text-white hover:bg-white/5 transition-colors"
                  >
                    <Users className="h-4 w-4 text-cyber-danger" />
                    <span>User Management (Admin)</span>
                  </Link>
                )}

                <div className="border-t border-cyber-border/60 my-1" />

                <button
                  type="button"
                  onClick={onLogout}
                  className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs text-cyber-danger hover:bg-cyber-danger/10 transition-colors text-left cursor-pointer"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            )}
          </div>

        </div>
      </div>
      
      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-cyber-border/70 bg-cyber-card/95 backdrop-blur-md">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {navLinks.filter(l => l.show).map((link) => {
              const Icon = link.icon;
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                    isActive 
                      ? 'bg-cyber-accent/15 text-cyber-accent border border-cyber-accent/30' 
                      : 'text-cyber-muted hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span>{link.name}</span>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;

