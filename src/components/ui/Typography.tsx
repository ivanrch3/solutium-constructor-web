import React, { useState, useEffect, useRef } from 'react';
import { usePageLayout } from '../../context/PageLayoutContext';

interface TypographyProps {
  variant?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'small' | 'span';
  weight?: string;
  italic?: boolean;
  underline?: boolean;
  strike?: boolean;
  align?: 'left' | 'center' | 'right';
  highlight_type?: 'none' | 'solid' | 'gradient';
  highlight_color_1?: string;
  highlight_color_2?: string;
  children: string;
  className?: string;
  style?: React.CSSProperties;
  editable?: boolean; // Kept for backwards compatibility with modules passing it
  onUpdate?: (text: string) => void; // Kept for backwards compatibility
}

export const Typography = ({
  variant = 'p',
  weight = '400',
  italic,
  underline,
  strike,
  align = 'left',
  highlight_type = 'none',
  highlight_color_1,
  highlight_color_2,
  children,
  className = '',
  style,
  editable = false,
  onUpdate
}: TypographyProps) => {
  const { previewDevice } = usePageLayout();
  const is_mobile_simulated = previewDevice === 'mobile';
  const [isEditing, setIsEditing] = useState(false);
  const [localText, setLocalText] = useState(children);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setLocalText(children);
  }, [children]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      // Adjust height
      inputRef.current.style.height = 'auto';
      inputRef.current.style.height = inputRef.current.scrollHeight + 'px';
    }
  }, [isEditing]);

  const handleInteraction = (e: React.MouseEvent | React.TouchEvent) => {
    // Check if mobile (width <= 768px) and editable
    if (editable && onUpdate && typeof window !== 'undefined' && window.innerWidth <= 768) {
      e.stopPropagation();
      setIsEditing(true);
    }
  };

  const handleBlur = () => {
    setIsEditing(false);
    if (localText !== children && onUpdate) {
      onUpdate(localText);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setLocalText(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = e.target.scrollHeight + 'px';
  };

  const baseClasses: Record<string, string> = {
    h1: is_mobile_simulated ? 'text-4xl leading-tight' : 'text-4xl md:text-7xl leading-tight',
    h2: is_mobile_simulated ? 'text-3xl leading-tight' : 'text-3xl md:text-5xl leading-tight',
    h3: is_mobile_simulated ? 'text-xl leading-tight' : 'text-xl md:text-3xl leading-tight',
    h4: is_mobile_simulated ? 'text-lg leading-tight' : 'text-lg md:text-2xl leading-tight',
    h5: is_mobile_simulated ? 'text-base leading-tight' : 'text-base md:text-xl leading-tight',
    h6: is_mobile_simulated ? 'text-sm leading-tight' : 'text-sm md:text-lg leading-tight',
    p: is_mobile_simulated ? 'text-base leading-relaxed' : 'text-base md:text-lg leading-relaxed',
    small: is_mobile_simulated ? 'text-xs leading-normal' : 'text-xs md:text-sm leading-normal',
    span: 'leading-normal'
  };

  const weightClasses: Record<string, string> = {
    '400': 'font-normal',
    '600': 'font-semibold',
    '700': 'font-bold',
    '800': 'font-extrabold',
    '900': 'font-black'
  };

  const alignClasses = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right'
  };

  const classes = [
    baseClasses[variant] || baseClasses.p,
    weightClasses[weight] || 'font-normal',
    alignClasses[align],
    'whitespace-pre-wrap',
    italic ? 'italic' : '',
    underline ? 'underline' : '',
    strike ? 'line-through' : '',
    className
  ].join(' ');

  const Tag = variant.startsWith('h') ? variant : (variant === 'small' ? 'small' : (variant === 'span' ? 'span' : 'p'));

  // Logic to parse *asterisks*
  const renderContent = (text: string) => {
    if (!text) return null;
    
    const parts = text.split(/(\*.*?\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith('*') && part.endsWith('*')) {
        const cleanText = part.slice(1, -1);
        let styles: React.CSSProperties = {};
        let spanClasses = '';

        if (highlight_type === 'solid') {
          if (highlight_color_1) {
            styles.color = highlight_color_1;
          } else {
            styles.color = 'var(--color-primary)';
          }
        } else if (highlight_type === 'gradient') {
          if (highlight_color_1 || highlight_color_2) {
            spanClasses = 'bg-clip-text text-transparent bg-gradient-to-r';
            const c1 = highlight_color_1 || 'var(--color-primary)';
            const c2 = highlight_color_2 || 'var(--color-accent)';
            styles.backgroundImage = `linear-gradient(to right, ${c1}, ${c2})`;
          } else {
            spanClasses = 'bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent';
          }
        }

        return (
          <span key={i} className={spanClasses} style={styles}>
            {cleanText}
          </span>
        );
      }
      return part;
    });
  };

  if (isEditing) {
    return (
      <textarea
        ref={inputRef}
        value={localText}
        onChange={handleChange}
        onBlur={handleBlur}
        className={`${classes} bg-transparent outline-none border-b-2 border-primary resize-none w-full overflow-hidden`}
        style={{ ...style, minHeight: '1.5em' }}
        onClick={(e) => e.stopPropagation()}
      />
    );
  }

  return (
    <Tag 
      className={classes}
      style={style}
      onClick={handleInteraction}
    >
      {renderContent(children)}
    </Tag>
  );
};

