import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ShieldAlert, User, Mail, UserPlus, Key, Info, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Input from '../components/Input';
import Button from '../components/Button';

const Register = () => {
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [roleName, setRoleName] = useState('Security Analyst');
  const [formErrors, setFormErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const validateForm = () => {
    const errors = {};
    if (!fullName.trim()) {
      errors.fullName = "Full Name is required";
    }
    if (!username.trim()) {
      errors.username = "Username is required";
    } else if (username.length < 3) {
      errors.username = "At least 3 characters";
    }
    if (!email) {
      errors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      errors.email = "Invalid format";
    }
    if (!password) {
      errors.password = "Password is required";
    } else if (password.length < 8) {
      errors.password = "At least 8 characters";
    }
    if (password !== confirmPassword) {
      errors.confirmPassword = "Passwords do not match";
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');
    setSuccess(false);
    if (!validateForm()) return;

    setLoading(true);
    try {
      await register(fullName, username, email, password, roleName);
      setSuccess(true);
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      setServerError(err.message || "Registration failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const roleOptions = [
    { value: 'Security Analyst', label: 'Security Analyst' },
    { value: 'SOC Manager', label: 'SOC Manager' },
    { value: 'Administrator', label: 'Administrator' }
  ];

  // Simple password strength calculation
  const getPasswordStrength = () => {
    let score = 0;
    if (password.length > 0) score += 1;
    if (password.length >= 8) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[^A-Za-z0-9]/.test(password)) score += 1;
    
    if (score === 0) return { label: 'None', color: 'bg-white/10' };
    if (score <= 2) return { label: 'Weak', color: 'bg-cyber-danger' };
    if (score === 3) return { label: 'Fair', color: 'bg-cyber-warning' };
    if (score >= 4) return { label: 'Strong', color: 'bg-cyber-success' };
  };

  const strength = getPasswordStrength();

  return (
    <div className="flex min-h-screen items-center justify-center bg-cyber-bg relative overflow-hidden text-cyber-text font-sans py-12">
      {/* Premium Minimal Background Elements */}
      <div className="absolute inset-0 bg-cyber-grid pointer-events-none z-0"></div>
      
      {/* Subtle Glowing Orbs */}
      <div className="absolute -top-32 -right-32 w-[500px] h-[500px] bg-cyber-accent-secondary/10 rounded-full blur-3xl opacity-30 mix-blend-screen pointer-events-none"></div>
      <div className="absolute bottom-0 -left-48 w-[600px] h-[600px] bg-cyber-accent/5 rounded-full blur-3xl opacity-50 mix-blend-screen pointer-events-none"></div>

      <div className="z-10 w-full max-w-[500px] px-6">
        <div className="cyber-glass rounded-2xl p-8 sm:p-10 w-full animate-in fade-in zoom-in duration-500">
          
          <div className="mb-8 flex flex-col items-center gap-4 text-center">
            <div className="relative flex items-center justify-center w-14 h-14 rounded-2xl bg-cyber-secondary border border-white/10 shadow-[0_0_15px_rgba(0,229,255,0.15)] group">
              <div className="absolute inset-0 rounded-2xl bg-cyber-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <UserPlus className="h-7 w-7 text-cyber-accent" strokeWidth={1.5} />
            </div>
            
            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-white mt-2">
                Create Account
              </h1>
              <p className="text-sm text-cyber-muted mt-1 font-medium">
                Provision new operator access
              </p>
            </div>
          </div>

          {serverError && (
            <div className="mb-6 flex items-center gap-3 rounded-xl border border-cyber-danger/30 bg-cyber-danger/10 p-4 text-sm text-cyber-danger animate-in fade-in slide-in-from-top-2">
              <ShieldAlert className="h-5 w-5 shrink-0" strokeWidth={2} />
              <div className="font-medium">
                {serverError}
              </div>
            </div>
          )}

          {success && (
            <div className="mb-6 flex items-center gap-3 rounded-xl border border-cyber-success/30 bg-cyber-success/10 p-4 text-sm text-cyber-success animate-in fade-in slide-in-from-top-2">
              <ShieldCheck className="h-5 w-5 shrink-0" strokeWidth={2} />
              <div className="font-medium">
                Access provisioned. Redirecting to login...
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Full Name"
                type="text"
                name="fullName"
                placeholder="Alex Mercer"
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
                placeholder="amercer"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                error={formErrors.username}
                icon={User}
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Work Email"
                type="email"
                name="email"
                placeholder="operator@netshield.ai"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                error={formErrors.email}
                icon={Mail}
                required
              />

              <Input
                label="Role"
                type="select"
                name="roleName"
                value={roleName}
                onChange={(e) => setRoleName(e.target.value)}
                options={roleOptions}
                icon={User}
                required
              />
            </div>

            <Input
              label="Password"
              type="password"
              name="password"
              placeholder="••••••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={formErrors.password}
              icon={Key}
              required
            />
            
            {/* Password Strength Indicator */}
            {password.length > 0 && (
              <div className="flex items-center gap-3 px-1">
                <div className="flex-1 flex gap-1 h-1.5">
                  <div className={`flex-1 rounded-full ${password.length > 0 ? strength.color : 'bg-white/10'} transition-colors duration-300`}></div>
                  <div className={`flex-1 rounded-full ${password.length >= 8 && /[A-Z]/.test(password) ? strength.color : 'bg-white/10'} transition-colors duration-300`}></div>
                  <div className={`flex-1 rounded-full ${strength.label === 'Strong' ? strength.color : 'bg-white/10'} transition-colors duration-300`}></div>
                </div>
                <span className="text-xs font-medium text-cyber-muted w-12 text-right">
                  {strength.label}
                </span>
              </div>
            )}

            <Input
              label="Confirm Password"
              type="password"
              name="confirmPassword"
              placeholder="••••••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              error={formErrors.confirmPassword}
              icon={Key}
              required
            />

            <Button type="submit" loading={loading} className="mt-4">
              Create Account
            </Button>
          </form>

          <div className="mt-8 flex items-center gap-4 text-sm text-cyber-muted before:h-px before:flex-1 before:bg-white/10 after:h-px after:flex-1 after:bg-white/10">
            or
          </div>

          <div className="mt-8 text-center text-sm font-medium text-cyber-muted">
            Already have an account?{' '}
            <Link
              to="/login"
              className="text-white hover:text-cyber-accent transition-colors"
            >
              Sign In
            </Link>
          </div>
        </div>

        {/* Minimal Footer */}
        <div className="mt-8 flex justify-center gap-6 text-xs text-cyber-muted/60 font-medium pb-8">
          <span>v2.4.0 (Enterprise)</span>
          <a href="#" className="hover:text-cyber-muted transition-colors">Privacy</a>
          <a href="#" className="hover:text-cyber-muted transition-colors">Terms of Service</a>
        </div>
      </div>
    </div>
  );
};

export default Register;
