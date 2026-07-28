import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Shield, Key, Mail, AlertTriangle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Input from '../components/Input';
import Button from '../components/Button';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const validateForm = () => {
    const errors = {};
    if (!email) {
      errors.email = "Email is required";
    }
    if (!password) {
      errors.password = "Password is required";
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');
    if (!validateForm()) return;

    setLoading(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setServerError(err.message || "Authentication failed. Please check credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-cyber-bg relative overflow-hidden text-cyber-text font-sans">
      {/* Premium Minimal Background Elements */}
      <div className="absolute inset-0 bg-cyber-grid pointer-events-none z-0"></div>
      
      {/* Subtle Glowing Orbs */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-cyber-accent/10 rounded-full blur-3xl opacity-50 mix-blend-screen pointer-events-none"></div>
      <div className="absolute bottom-1/4 -right-32 w-[500px] h-[500px] bg-cyber-accent-secondary/10 rounded-full blur-3xl opacity-30 mix-blend-screen pointer-events-none"></div>

      <div className="z-10 w-full max-w-[450px] px-6">
        <div className="cyber-glass rounded-2xl p-8 sm:p-10 w-full animate-in fade-in zoom-in duration-500">
          
          <div className="mb-10 flex flex-col items-center gap-4 text-center">
            <div className="relative flex items-center justify-center w-14 h-14 rounded-2xl bg-cyber-secondary border border-white/10 shadow-[0_0_15px_rgba(0,229,255,0.15)] group">
              <div className="absolute inset-0 rounded-2xl bg-cyber-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <Shield className="h-7 w-7 text-cyber-accent" strokeWidth={1.5} />
            </div>
            
            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-white mt-2">
                NETSHIELD AI
              </h1>
              <p className="text-sm text-cyber-muted mt-1 font-medium">
                Secure Authentication Console
              </p>
            </div>
          </div>

          {serverError && (
            <div className="mb-6 flex items-center gap-3 rounded-xl border border-cyber-danger/30 bg-cyber-danger/10 p-4 text-sm text-cyber-danger animate-in fade-in slide-in-from-top-2">
              <AlertTriangle className="h-5 w-5 shrink-0" strokeWidth={2} />
              <div className="font-medium">
                {serverError}
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <Input
              label="Work Email"
              type="text"
              name="email"
              placeholder="operator@netshield.ai"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={formErrors.email}
              icon={Mail}
              required
            />

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

            <div className="flex items-center justify-between mt-1">
              <label className="flex items-center gap-2 cursor-pointer group">
                <div className="relative flex items-center justify-center w-5 h-5 rounded border border-white/20 bg-cyber-bg group-hover:border-cyber-accent/50 transition-colors">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="absolute opacity-0 cursor-pointer w-full h-full"
                  />
                  {rememberMe && (
                    <svg className="w-3 h-3 text-cyber-accent pointer-events-none" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M10 3L4.5 8.5L2 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )}
                </div>
                <span className="text-sm font-medium text-cyber-muted group-hover:text-cyber-text transition-colors select-none">Remember me</span>
              </label>

              <button
                type="button"
                onClick={() => alert("Password reset functionality is integrated with your Identity Provider. Please contact IT.")}
                className="text-sm font-medium text-cyber-accent hover:text-[#33ebff] transition-colors"
              >
                Forgot password?
              </button>
            </div>

            <Button type="submit" loading={loading} className="mt-2">
              Sign In
            </Button>
          </form>

          <div className="mt-8 flex items-center gap-4 text-sm text-cyber-muted before:h-px before:flex-1 before:bg-white/10 after:h-px after:flex-1 after:bg-white/10">
            or
          </div>

          <div className="mt-8 text-center text-sm font-medium text-cyber-muted">
            New to NetShield?{' '}
            <Link
              to="/register"
              className="text-white hover:text-cyber-accent transition-colors"
            >
              Create an account
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

export default Login;
