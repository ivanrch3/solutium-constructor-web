import React, { useState, useEffect, useRef } from 'react';
import { useEditorStore } from '../../store/editorStore';

interface InlineEditableTextProps {
  moduleId: string;
  settingId: string;
  elementId?: string;
  value: string;
  className?: string;
  style?: React.CSSProperties;
  tagName?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'span' | 'div';
  isPreviewMode?: boolean;
  children?: React.ReactNode;
  onSave?: (newValue: string) => void;
  onClick?: (e: React.MouseEvent) => void;
}

export const InlineEditableText: React.FC<InlineEditableTextProps> = ({
  moduleId,
  settingId,
  elementId,
  value,
  className = '',
  style = {},
  tagName: Tag = 'span',
  isPreviewMode = false,
  children,
  onSave,
  onClick
}) => {
  const { 
    inlineEditingId, 
    setInlineEditingId, 
    updateSectionSettings,
    selectSection,
    selectElement
  } = useEditorStore();
  const fullId = elementId ? `${elementId}_${settingId}` : `${moduleId}_global_${settingId}`;
  const isEditing = inlineEditingId === fullId;
  
  const [localValue, setLocalValue] = useState(value);
  const textRef = useRef<HTMLDivElement>(null);
  const isBlurring = useRef(false);

  useEffect(() => {
    if (!isEditing) {
      setLocalValue(value);
    }
  }, [value, isEditing]);

  const handleBlur = () => {
    if (isBlurring.current) return;
    isBlurring.current = true;

    if (textRef.current) {
      const newValue = textRef.current.innerText;
      if (newValue !== value) {
        setLocalValue(newValue); // Update local state immediately
        if (onSave) {
          onSave(newValue);
        } else {
          updateSectionSettings(moduleId, { [fullId]: newValue });
        }
      }
    }
    setInlineEditingId(null);
    
    // Reset blurring flag after a tick to allow for state propagation
    setTimeout(() => {
      isBlurring.current = false;
    }, 100);
  };

  const handleClick = (e: React.MouseEvent) => {
    if (isPreviewMode) return;
    
    e.stopPropagation();
    if (onClick) onClick(e);
    
    // Open in structure panel
    selectSection(moduleId);
    if (elementId) {
      selectElement(elementId);
    } else {
      selectElement(`${moduleId}_global`);
    }

    if (!isEditing) {
      setInlineEditingId(fullId);
      // Give it a tick to render as contentEditable before focusing
      setTimeout(() => {
        if (textRef.current) {
          textRef.current.focus();
          // Move cursor to end
          const range = document.createRange();
          const sel = window.getSelection();
          range.selectNodeContents(textRef.current);
          range.collapse(false);
          sel?.removeAllRanges();
          sel?.addRange(range);
        }
      }, 0);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      textRef.current?.blur();
    }
    if (e.key === 'Escape') {
      if (textRef.current) {
        textRef.current.innerText = value; // Reset
      }
      textRef.current?.blur();
    }
  };

  if (isPreviewMode) {
    return <Tag className={className} style={style}>{children || value}</Tag>;
  }

  return (
    <Tag
      ref={textRef}
      className={`${className} transition-all duration-200 ${
        isEditing 
          ? 'outline-none ring-2 ring-blue-400 ring-offset-2 bg-blue-50/10 rounded cursor-text' 
          : 'hover:bg-blue-500/5 cursor-pointer rounded px-0.5'
      }`}
      style={style}
      contentEditable={isEditing}
      onClick={handleClick}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      suppressContentEditableWarning={true}
    >
      {/* 
        When editing, we show the RAW value (including **) 
        When not editing, we show the CHILDREN (rendered TextRenderer with highlights)
      */}
      {isEditing ? value : (children || value)}
    </Tag>
  );
};
