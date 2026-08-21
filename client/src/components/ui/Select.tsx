import React from 'react';
import { ChevronDown } from 'lucide-react';

export interface SelectOption {
  value: string | number;
  label: string;
  disabled?: boolean;
}

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  helperText?: string;
  error?: string;
  options?: SelectOption[];
  leftIcon?: React.ReactNode;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, helperText, error, options, leftIcon, id, className = '', children, required, ...props }, ref) => {
    const selectId = id || (label ? `select-${label.toLowerCase().replace(/\s+/g, '-')}` : undefined);

    return (
      <div className="form-field-group">
        {label && (
          <label htmlFor={selectId} className="form-field-label">
            {label} {required && <span className="text-danger">*</span>}
          </label>
        )}
        <div className={`select-wrapper ${leftIcon ? 'has-left-icon' : ''} ${error ? 'has-error' : ''}`}>
          {leftIcon && <span className="select-icon-left">{leftIcon}</span>}
          <select
            id={selectId}
            ref={ref}
            required={required}
            className={`form-select-ui ${className}`}
            {...props}
          >
            {options
              ? options.map((opt) => (
                  <option key={opt.value} value={opt.value} disabled={opt.disabled}>
                    {opt.label}
                  </option>
                ))
              : children}
          </select>
          <span className="select-arrow">
            <ChevronDown size={18} />
          </span>
        </div>
        {error ? (
          <span className="form-field-error">{error}</span>
        ) : helperText ? (
          <span className="form-field-helper">{helperText}</span>
        ) : null}
      </div>
    );
  }
);

Select.displayName = 'Select';

export default Select;
