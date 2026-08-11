import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

const Input = ({
  id,
  type = 'text',
  placeholder,
  value,
  onChange,
  leftIcon,
  rightIcon,
  errorMessage,
  className = '',
  required = false,
  style,
  ...props
}) => {
  const [showPassword, setShowPassword] = useState(false);
  
  const isPassword = type === 'password';
  const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;

  const wrapperStyle = {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    width: '100%',
    ...style
  };

  const inputStyle = {
    width: '100%',
    padding: leftIcon ? '1rem 1rem 1rem 2.8rem' : '1rem',
    paddingRight: (isPassword || rightIcon) ? '2.8rem' : '1rem',
    borderRadius: '12px',
    border: errorMessage ? '1px solid #ff4d4d' : '1px solid var(--border-color)',
    outline: 'none',
    fontSize: '0.9rem',
    backgroundColor: 'var(--bg-color)',
    color: 'var(--text-main)',
    transition: 'border-color 0.2s',
  };

  const iconStyle = {
    position: 'absolute',
    color: 'var(--text-sub)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  };

  return (
    <div className={`ui-input-container ${className}`} style={{ width: '100%' }}>
      <div style={wrapperStyle}>
        {/* Left Icon */}
        {leftIcon && (
          <span style={{ ...iconStyle, left: '1rem', pointerEvents: 'none' }}>
            {leftIcon}
          </span>
        )}

        <input
          id={id}
          type={inputType}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          required={required}
          style={inputStyle}
          {...props}
        />

        {/* Password Toggle Icon */}
        {isPassword ? (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            tabIndex="-1"
            style={{
              ...iconStyle,
              right: '1rem',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: 0
            }}
          >
            {showPassword ? <Eye size={18} /> : <EyeOff size={18} />}
          </button>
        ) : (
          /* Custom Right Icon */
          rightIcon && (
            <span style={{ ...iconStyle, right: '1rem', pointerEvents: 'none' }}>
              {rightIcon}
            </span>
          )
        )}
      </div>
      
      {/* Error Message */}
      {errorMessage && (
        <div style={{ color: '#ff4d4d', fontSize: '0.75rem', marginTop: '0.4rem', marginLeft: '0.2rem' }}>
          {errorMessage}
        </div>
      )}
    </div>
  );
};

export default Input;
