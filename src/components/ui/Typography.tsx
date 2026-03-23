import React, { useState, useEffect, useRef } from 'react';
import { usePageLayout } from '../../context/PageLayoutContext';

interface TypographyProps {
  variant?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'small' | 'span';
  weight?: string;
  italic?: boolean;
  underline?: boolean;
  strike?: boolean;
  align?: 'left' | 'center' | 'right';
  highlightType?: 'none' | 'solid' | 'gradient';
  highlightColor1?: string;
  highlightColor2?: string;
  animatedText?: boolean;
  children: React.ReactNode;
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
  highlightType = 'none',
  highlightColor1,
  highlightColor2,
  animatedText,
  children,
  className = '',
  style,
  editable = false,
  onUpdate
}: TypographyProps) => {
  const { previewDevice } = usePageLayout();
  const isMobileSimulated = previewDevice === 'mobile';
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
      onUpdate(localText as string);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setLocalText(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = e.target.scrollHeight + 'px';
  };

  const baseClasses: Record<string, string> = {
    h1: isMobileSimulated ? 'text-5xl leading-tight' : 'text-5xl md:text-7xl leading-tight',
    h2: isMobileSimulated ? 'text-3xl leading-tight' : 'text-3xl md:text-5xl leading-tight',
    h3: isMobileSimulated ? 'text-xl leading-tight' : 'text-xl md:text-3xl leading-tight',
    h4: isMobileSimulated ? 'text-lg leading-tight' : 'text-lg md:text-2xl leading-tight',
    h5: isMobileSimulated ? 'text-base leading-tight' : 'text-base md:text-xl leading-tight',
    h6: isMobileSimulated ? 'text-sm leading-tight' : 'text-sm md:text-lg leading-tight',
    p: isMobileSimulated ? 'text-base leading-relaxed' : 'text-base md:text-lg leading-relaxed',
    small: isMobileSimulated ? 'text-xs leading-normal' : 'text-xs md:text-sm leading-normal',
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

  // Logic to parse *asterisks* and <span> tags
  const renderContent = (rawText: any) => {
    if (rawText === null || rawText === undefined) return null;
    if (typeof rawText !== 'string') return rawText;
    
    const text = rawText;
    
    // First, handle <span> tags if they exist (AI sometimes generates them)
    // We'll use a simple regex to find <span> tags with classes or styles
    const spanRegex = /<span\s+(?:class=['"](.*?)['"]\s*)?(?:style=['"](.*?)['"]\s*)?>(.*?)<\/span>/gi;
    
    if (text.includes('<span')) {
      const parts = [];
      let lastIndex = 0;
      let match;
      
      while ((match = spanRegex.exec(text)) !== null) {
        // Add text before the span
        if (match.index > lastIndex) {
          parts.push(text.substring(lastIndex, match.index));
        }
        
        const [fullMatch, className, styleStr, content] = match;
        
        // Convert style string to object if needed
        let styles: React.CSSProperties = {};
        if (styleStr) {
          styleStr.split(';').forEach(s => {
            const [key, value] = s.split(':').map(part => part.trim());
            if (key && value) {
              const camelKey = key.replace(/-([a-z])/g, g => g[1].toUpperCase());
              (styles as any)[camelKey] = value;
            }
          });
        }
        
        parts.push(
          <span key={`span-${match.index}`} className={className} style={styles}>
            {content}
          </span>
        );
        
        lastIndex = match.index + fullMatch.length;
      }
      
      if (lastIndex < text.length) {
        parts.push(text.substring(lastIndex));
      }
      
      // Now process each part for *asterisks* if it's a string
      return parts.map((part, i) => {
        if (typeof part === 'string') {
          return renderAsterisks(part, i);
        }
        return part;
      });
    }

    return renderAsterisks(text, 0);
  };

  const renderAsterisks = (text: string, keyPrefix: number | string) => {
    const parts = text.split(/(\*.*?\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith('*') && part.endsWith('*')) {
        const cleanText = part.slice(1, -1);
        let styles: React.CSSProperties = {};
        let spanClasses = '';

        if (highlightType === 'solid') {
          if (highlightColor1) {
            styles.color = highlightColor1;
          } else {
            styles.color = 'var(--color-primary)';
          }
        } else if (highlightType === 'gradient') {
          if (highlightColor1 || highlightColor2) {
            spanClasses = 'bg-clip-text text-transparent bg-gradient-to-r';
            const c1 = highlightColor1 || 'var(--color-primary)';
            const c2 = highlightColor2 || 'var(--color-accent)';
            styles.backgroundImage = `linear-gradient(to right, ${c1}, ${c2})`;
          } else {
            spanClasses = 'bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent';
          }
        }

        return (
          <span key={`${keyPrefix}-${i}`} className={spanClasses} style={styles}>
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
        value={typeof localText === 'string' ? localText : ''}
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
      {animatedText ? (
        <span className="inline-block overflow-hidden whitespace-nowrap border-r-4 border-primary pr-1 animate-[typing_3.5s_steps(40,end),blink-caret_.75s_step-end_infinite]">
          {renderContent(children)}
        </span>
      ) : (
        renderContent(children)
      )}
    </Tag>
  );
};

