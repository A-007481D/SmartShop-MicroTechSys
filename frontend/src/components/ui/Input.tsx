import React, { forwardRef, useId } from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
    ({ label, error, className = '', id, ...props }, ref) => {
        const generatedId = useId();
        const inputId = id || generatedId;

        return (
            <div className="w-full">
                {label && (
                    <label htmlFor={inputId} className="block text-sm font-medium text-gray-700 mb-1">
                        {label}
                    </label>
                )}
                <input
                    id={inputId}
                    ref={ref}
                    className={`
            w-full px-3 py-2 bg-white border rounded-md shadow-sm placeholder-gray-400
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
            disabled:bg-gray-50 disabled:text-gray-500
            ${error ? 'border-red-500' : 'border-gray-300'}
            ${className}
          `}
                    {...props}
                />
                {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
            </div>
        );
    }
);

Input.displayName = 'Input';
export default Input;
