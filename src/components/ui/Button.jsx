import React from 'react';

const Button = ({ 
  children, 
  variant = 'primary', // 'primary', 'outline', 'ghost', 'danger'
  size = 'medium',     // 'small', 'medium', 'large'
  isLoading = false,
  className = '',
  disabled,
  style,
  ...props 
}) => {
  const getVariantStyle = () => {
    switch(variant) {
      case 'outline':
        return {
          backgroundColor: 'var(--bg-color)',
          border: '1px solid var(--border-color)',
          color: 'var(--text-main)',
        };
      case 'ghost':
        return {
          backgroundColor: 'transparent',
          border: 'none',
          color: 'var(--text-sub)',
        };
      case 'danger':
        return {
          backgroundColor: '#ffe5e5',
          border: 'none',
          color: '#ff4d4d',
        };
      case 'primary':
      default:
        return {
          backgroundColor: 'var(--primary-color)',
          border: 'none',
          color: '#fff',
        };
    }
  };

  const getSizeStyle = () => {
    switch(size) {
      case 'small':
        return { padding: '0.4rem 0.8rem', fontSize: '0.8rem', borderRadius: '8px' };
      case 'large':
        return { padding: '1rem', fontSize: '1rem', borderRadius: '14px' };
      case 'medium':
      default:
        return { padding: '0.85rem', fontSize: '0.9rem', borderRadius: '12px' };
    }
  };

  const baseStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 'bold',
    cursor: disabled || isLoading ? 'not-allowed' : 'pointer',
    transition: 'all 0.2s',
    opacity: disabled || isLoading ? 0.6 : 1,
    width: '100%',
    ...getVariantStyle(),
    ...getSizeStyle(),
    ...style
  };

  return (
    <button 
      className={`ui-button ${className}`}
      style={baseStyle}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? '로딩 중...' : children}
    </button>
  );
};

export default Button;
