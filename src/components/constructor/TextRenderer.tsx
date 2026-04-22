import React from 'react';

interface TextRendererProps {
  text: string;
  highlightType?: 'none' | 'solid' | 'gradient';
  highlightColor?: string;
  highlightGradient?: string;
  highlightBold?: boolean;
}

export const TextRenderer: React.FC<TextRendererProps> = ({
  text,
  highlightType = 'none',
  highlightColor = '#3B82F6',
  highlightGradient = 'linear-gradient(90deg, #3B82F6 0%, #8B5CF6 100%)',
  highlightBold = true,
}) => {
  if (highlightType === 'none' || !text) return <>{text}</>;

  // Split by **text** pattern
  const parts = text.split(/(\*\*.*?\*\*)/g);

  return (
    <>
      {parts.map((part, i) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          const content = part.slice(2, -2);
          const style: React.CSSProperties = {
            fontWeight: highlightBold ? '900' : 'inherit',
          };

          if (highlightType === 'solid') {
            style.color = highlightColor;
          } else if (highlightType === 'gradient') {
            const isSafeGradient = highlightGradient && !String(highlightGradient).includes('NaN');
            style.backgroundImage = isSafeGradient ? highlightGradient : 'none';
            style.WebkitBackgroundClip = isSafeGradient ? 'text' : 'border-box';
            style.WebkitTextFillColor = isSafeGradient ? 'transparent' : 'inherit';
            style.backgroundClip = isSafeGradient ? 'text' : 'border-box';
            style.display = 'inline-block';
          }

          return (
            <span key={i} style={style}>
              {content}
            </span>
          );
        }
        return part;
      })}
    </>
  );
};
