import React, { useState, useRef, useEffect } from 'react';

interface InlineAutocompleteInputProps {
    value: string;
    onChange: (value: string) => void;
    onSubmit: () => void;
    suggestions: Array<{ id: string; text: string }>;
    placeholder?: string;
    className?: string;
    autoFocus?: boolean;
}

export const InlineAutocompleteInput: React.FC<InlineAutocompleteInputProps> = ({
    value,
    onChange,
    onSubmit,
    suggestions,
    placeholder = '',
    className = '',
    autoFocus = false
}) => {
    const inputRef = useRef<HTMLInputElement>(null);
    const [showTooltip, setShowTooltip] = useState(false);
    
    // Get the top suggestion that matches current input
    const topSuggestion = suggestions.length > 0 && value.trim()
        ? suggestions.find(s => s.text.toLowerCase().startsWith(value.toLowerCase()))
        : null;

    // Calculate shadow text (the grayed-out completion)
    const shadowText = topSuggestion && value.trim()
        ? topSuggestion.text.substring(value.length)
        : '';

    // Handle Tab key or Right Arrow to complete
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if ((e.key === 'Tab' || e.key === 'ArrowRight') && shadowText) {
            e.preventDefault();
            onChange(topSuggestion!.text);
            setShowTooltip(false);
        } else if (e.key === 'Enter') {
            e.preventDefault();
            onSubmit();
        }
    };

    // Show tooltip on first shadow text appearance (for discoverability)
    useEffect(() => {
        if (shadowText && !showTooltip) {
            setShowTooltip(true);
            const timer = setTimeout(() => setShowTooltip(false), 3000);
            return () => clearTimeout(timer);
        }
    }, [shadowText]);

    // Handle tap on shadow text (mobile)
    const handleShadowClick = () => {
        if (shadowText && topSuggestion) {
            onChange(topSuggestion.text);
            inputRef.current?.focus();
        }
    };

    return (
        <div className="relative">
            {/* Shadow text layer */}
            <div 
                className="absolute inset-0 pointer-events-none flex items-center"
                aria-hidden="true"
            >
                <div className="px-4 text-gray-400 dark:text-gray-600 select-none whitespace-pre">
                    <span className="invisible">{value}</span>
                    <span>{shadowText}</span>
                </div>
            </div>
            
            {/* Actual input */}
            <input
                ref={inputRef}
                type="text"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={placeholder}
                autoFocus={autoFocus}
                className={`relative bg-transparent ${className}`}
            />

            {/* Tap target for mobile (invisible overlay on shadow text) */}
            {shadowText && (
                <div
                    onClick={handleShadowClick}
                    className="absolute top-0 bottom-0 cursor-pointer"
                    style={{
                        left: `${value.length * 0.6}em`, // Approximate character width
                        right: 0,
                    }}
                    title="Tap to complete"
                />
            )}

            {/* Tooltip hint (shows once) */}
            {showTooltip && shadowText && (
                <div className="absolute top-full left-0 mt-2 px-3 py-2 bg-gray-900 dark:bg-gray-700 text-white text-xs rounded-lg shadow-lg z-10 whitespace-nowrap animate-in fade-in slide-in-from-top-2 duration-300">
                    Press <kbd className="px-1.5 py-0.5 bg-gray-700 dark:bg-gray-600 rounded">Tab</kbd> or tap to complete
                </div>
            )}
        </div>
    );
};
