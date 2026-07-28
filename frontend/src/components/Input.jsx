import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

const Input = ({
  label,
  type = 'text',
  name,
  value,
  onChange,
  placeholder,
  error,
  required = false,
  icon: Icon = null,
  options = []
}) => {
  const [showPassword, setShowPassword] = useState(false);

  const isPassword = type === 'password';
  const resolvedType = isPassword && showPassword ? 'text' : type;

  // Modern Enterprise SaaS Styling
  const baseClasses = "w-full h-[52px] rounded-xl border bg-cyber-secondary px-4 text-sm text-cyber-text placeholder:text-cyber-muted transition-all duration-300 outline-none";
  
  const stateClasses = error
    ? "border-cyber-danger focus:border-cyber-danger focus:ring-1 focus:ring-cyber-danger shadow-[0_0_15px_rgba(239,68,68,0.15)]"
    : "border-white/5 focus:border-cyber-accent focus:ring-1 focus:ring-cyber-accent focus:shadow-[0_0_15px_rgba(0,229,255,0.15)] hover:border-white/10";

  const paddingClasses = `${Icon ? 'pl-11' : ''} ${isPassword ? 'pr-11' : ''}`;
  const selectPaddingClass = Icon ? 'pl-11 pr-10' : 'pr-10';

  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && (
        <label className="text-sm font-medium text-cyber-text flex items-center gap-1">
          {label}
          {required && <span className="text-cyber-danger">*</span>}
        </label>
      )}
      
      <div className="relative flex items-center group">
        {Icon && (
          <div className="absolute left-3.5 text-cyber-muted transition-colors duration-300 group-focus-within:text-cyber-accent pointer-events-none">
            <Icon size={18} />
          </div>
        )}

        {type === 'select' ? (
          <select
            name={name}
            value={value}
            onChange={onChange}
            required={required}
            className={`${baseClasses} ${stateClasses} ${selectPaddingClass} appearance-none cursor-pointer`}
          >
            {options.map((opt) => (
              <option key={opt.value} value={opt.value} className="bg-cyber-card text-cyber-text">
                {opt.label}
              </option>
            ))}
          </select>
        ) : (
          <input
            type={resolvedType}
            name={name}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            required={required}
            className={`${baseClasses} ${stateClasses} ${paddingClasses}`}
          />
        )}

        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3.5 text-cyber-muted hover:text-cyber-text transition-colors"
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        )}

        {type === 'select' && (
          <div className="absolute right-3.5 text-cyber-muted pointer-events-none">
            <svg width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M1 1.5L6 6.5L11 1.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        )}
      </div>

      {error && (
        <span className="text-xs text-cyber-danger font-medium mt-0.5 animate-in fade-in slide-in-from-top-1">
          {error}
        </span>
      )}
    </div>
  );
};

export default Input;
