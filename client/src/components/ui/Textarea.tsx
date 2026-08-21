import React from 'react';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  helperText?: string;
  error?: string;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, helperText, error, id, className = '', required, ...props }, ref) => {
    const textareaId = id || (label ? `textarea-${label.toLowerCase().replace(/\s+/g, '-')}` : undefined);

    return (
      <div className="form-field-group">
        {label && (
          <label htmlFor={textareaId} className="form-field-label">
            {label} {required && <span className="text-danger">*</span>}
          </label>
        )}
        <textarea
          id={textareaId}
          ref={ref}
          required={required}
          className={`form-textarea-ui ${error ? 'has-error' : ''} ${className}`}
          {...props}
        />
        {error ? (
          <span className="form-field-error">{error}</span>
        ) : helperText ? (
          <span className="form-field-helper">{helperText}</span>
        ) : null}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';

export default Textarea;
