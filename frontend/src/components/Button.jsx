import React from 'react';

const Button = ({
  children,
  type = 'button',
  onClick,
  disabled = false,
  loading = false,
  variant = 'primary',
  className = ''
}) => {
  // Base styling for modern SaaS aesthetics
  const baseStyle = "w-full h-[52px] rounded-xl text-sm font-semibold tracking-wide transition-all duration-300 flex items-center justify-center gap-2 border cursor-pointer select-none";
  
  const variants = {
    primary: "bg-cyber-accent border-cyber-accent text-[#050816] hover:bg-[#33ebff] hover:border-[#33ebff] hover:shadow-[0_8px_20px_-6px_rgba(0,229,255,0.4)] hover:-translate-y-0.5 focus:ring-2 focus:ring-cyber-accent/50 focus:outline-none",
    secondary: "bg-transparent border-white/10 text-cyber-text hover:bg-white/5 hover:border-white/20 hover:shadow-lg focus:ring-2 focus:ring-white/20 focus:outline-none",
    danger: "bg-transparent border-cyber-danger text-cyber-danger hover:bg-cyber-danger hover:text-white hover:shadow-[0_8px_20px_-6px_rgba(239,68,68,0.4)] hover:-translate-y-0.5 focus:ring-2 focus:ring-cyber-danger/50 focus:outline-none"
  };

  const selectedVariant = variants[variant] || variants.primary;

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`${baseStyle} ${selectedVariant} ${disabled || loading ? 'opacity-60 cursor-not-allowed hover:-translate-y-0 hover:shadow-none' : ''} ${className}`}
    >
      {loading ? (
        <>
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Authenticating...
        </>
      ) : (
        <span>{children}</span>
      )}
    </button>
  );
};

export default Button;
