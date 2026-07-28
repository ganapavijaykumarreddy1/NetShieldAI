import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Shield, User, Mail, LogOut, CheckCircle, AlertTriangle, Key } from 'lucide-react';
import Input from '../components/Input';
import Button from '../components/Button';

const Profile = () => {
  const { user, logout, updateProfile } = useAuth();
  
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const [formErrors, setFormErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setFullName(user.full_name || '');
      setUsername(user.username || '');
      setEmail(user.email || '');
    }
  }, [user]);

  const validateForm = () => {
    const errors = {};
    if (!fullName.trim()) {
      errors.fullName = "Full Name is required";
    }
    if (!username.trim()) {
      errors.username = "Username is required";
    }
    if (!email) {
      errors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      errors.email = "Invalid email format";
    }
    if (password && password.length < 8) {
      errors.password = "New password must be at least 8 characters";
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setServerError('');
    setSuccess(false);
    if (!validateForm()) return;

    setLoading(true);
    try {
      const updateData = {
        full_name: fullName,
        username,
        email,
      };
      if (password) {
        updateData.password = password;
      }
      await updateProfile(updateData);
      setSuccess(true);
      setPassword(''); 
      setTimeout(() => setSuccess(false), 4000);
    } catch (err) {
      setServerError(err.message || "Failed to commit profile updates.");
    } finally {
      setLoading(false);
    }
  };

  const getRoleBadgeClass = (role) => {
    switch (role) {
      case 'Administrator':
        return 'bg-cyber-danger/10 text-cyber-danger border-cyber-danger/30';
      case 'SOC Manager':
        return 'bg-cyber-warning/10 text-cyber-warning border-cyber-warning/30';
      case 'Security Analyst':
      default:
        return 'bg-cyber-accent/10 text-cyber-accent border-cyber-accent/30';
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-cyber-bg p-6 md:p-12 relative overflow-hidden text-cyber-text font-sans">
      {/* Premium Minimal Background Elements */}
      <div className="absolute inset-0 bg-cyber-grid pointer-events-none z-0"></div>
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-cyber-accent/5 rounded-full blur-3xl mix-blend-screen pointer-events-none"></div>
      
      <div className="z-10 max-w-5xl mx-auto flex flex-col gap-8 relative">
        {/* Top bar header */}
        <header className="flex items-center justify-between border-b border-white/5 pb-6">
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-cyber-secondary border border-white/10 shadow-[0_0_15px_rgba(0,229,255,0.15)]">
              <Shield className="h-5 w-5 text-cyber-accent" />
            </div>
            <div>
              <h1 className="font-semibold text-lg text-white tracking-tight">NetShield Monitor Console</h1>
              <p className="text-xs text-cyber-muted">Active Session: {user.username}</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="flex items-center gap-2 rounded-xl px-4 py-2 border border-white/10 bg-cyber-secondary text-cyber-text hover:bg-white/5 hover:text-white transition-all cursor-pointer text-sm font-medium focus:ring-2 focus:ring-white/20 focus:outline-none"
          >
            <LogOut size={16} />
            Disconnect Node
          </button>
        </header>

        {/* Dash/Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Left panel - User info card */}
          <div className="cyber-glass rounded-2xl p-8 flex flex-col gap-6 h-fit border border-white/5 shadow-xl shadow-black/50">
            <div className="flex flex-col items-center text-center gap-4 border-b border-white/5 pb-6">
              <div className="rounded-2xl bg-cyber-secondary h-20 w-20 flex items-center justify-center border border-white/10 shadow-inner">
                <User size={36} className="text-cyber-muted" strokeWidth={1.5} />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-white tracking-tight">{user.full_name}</h2>
                <p className="text-sm text-cyber-muted mt-1">@{user.username}</p>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getRoleBadgeClass(user.role?.role_name)}`}>
                {user.role?.role_name}
              </span>
            </div>

            <div className="flex flex-col gap-4 text-sm">
              <div className="flex justify-between items-center py-1">
                <span className="text-cyber-muted font-medium">System Node</span>
                <span className="text-white font-medium">NODE_01</span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="text-cyber-muted font-medium">Clearance Level</span>
                <span className="text-cyber-accent font-medium text-xs bg-cyber-accent/10 px-2 py-0.5 rounded-md">LEVEL 0{user.role_id}</span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="text-cyber-muted font-medium">Last Logon</span>
                <span className="text-white font-medium">
                  {user.last_login ? new Date(user.last_login).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 'N/A'}
                </span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="text-cyber-muted font-medium">Provisioned</span>
                <span className="text-white font-medium">
                  {new Date(user.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>

          {/* Right panel - Form update */}
          <div className="cyber-glass rounded-2xl p-8 md:col-span-2 border border-white/5 shadow-xl shadow-black/50">
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-white tracking-tight">Settings & Node Credentials</h3>
              <p className="text-sm text-cyber-muted mt-1">Update your operator profile and access keys.</p>
            </div>

            {serverError && (
              <div className="mb-6 flex items-center gap-3 rounded-xl border border-cyber-danger/30 bg-cyber-danger/10 p-4 text-sm text-cyber-danger animate-in fade-in slide-in-from-top-2">
                <AlertTriangle className="h-5 w-5 shrink-0" strokeWidth={2} />
                <div className="font-medium">
                  {serverError}
                </div>
              </div>
            )}

            {success && (
              <div className="mb-6 flex items-center gap-3 rounded-xl border border-cyber-success/30 bg-cyber-success/10 p-4 text-sm text-cyber-success animate-in fade-in slide-in-from-top-2">
                <CheckCircle className="h-5 w-5 shrink-0" strokeWidth={2} />
                <div className="font-medium">
                  Profile updated successfully.
                </div>
              </div>
            )}

            <form onSubmit={handleUpdate} className="flex flex-col gap-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <Input
                  label="Full Name"
                  type="text"
                  name="fullName"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  error={formErrors.fullName}
                  icon={User}
                  required
                />

                <Input
                  label="Username"
                  type="text"
                  name="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  error={formErrors.username}
                  icon={User}
                  required
                />
              </div>

              <Input
                label="Work Email"
                type="email"
                name="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                error={formErrors.email}
                icon={Mail}
                required
              />

              <div className="pt-2">
                <Input
                  label="Change Password"
                  type="password"
                  name="password"
                  placeholder="Leave blank to keep active passkey"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  error={formErrors.password}
                  icon={Key}
                />
              </div>

              <div className="mt-4 pt-6 border-t border-white/5 flex justify-end">
                <Button type="submit" loading={loading} className="md:w-auto px-8">
                  Save Changes
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
