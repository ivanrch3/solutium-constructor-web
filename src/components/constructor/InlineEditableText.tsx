import React, { useEffect, useRef } from 'react';
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
  
  const textRef = useRef<HTMLDivElement>(null);
  const focusFrameRef = useRef<number | null>(null);
  const isCommittingRef = useRef(false);
  const shouldSkipCommitRef = useRef(false);
  const lastCommittedValueRef = useRef(value);
  const isReadOnlyRuntime = (() => {
    try {
      return (window as any).__SOLUTIUM_READ_ONLY_RENDER__ === true;
    } catch {
      return false;
    }
  })();
  const shouldDisableEditing = isPreviewMode || isReadOnlyRuntime;

  useEffect(() => {
    lastCommittedValueRef.current = value;

    if (!isEditing && textRef.current && textRef.current.innerText !== value) {
      textRef.current.innerText = value;
    }
  }, [value, isEditing]);

  useEffect(() => {
    if (!isEditing) {
      isCommittingRef.current = false;
      shouldSkipCommitRef.current = false;
    }
  }, [isEditing]);

  useEffect(() => {
    return () => {
      if (focusFrameRef.current !== null) {
        window.cancelAnimationFrame(focusFrameRef.current);
      }
    };
  }, []);

  const handleBlur = () => {
    if (!isEditing || isCommittingRef.current) return;
    isCommittingRef.current = true;

    if (shouldSkipCommitRef.current) {
      shouldSkipCommitRef.current = false;
      setInlineEditingId(null);
      return;
    }

    if (textRef.current) {
      const newValue = textRef.current.innerText;
      if (newValue !== lastCommittedValueRef.current) {
        lastCommittedValueRef.current = newValue;
        if (onSave) {
          onSave(newValue);
        } else {
          updateSectionSettings(moduleId, { [fullId]: newValue });
        }
      }
    }
    setInlineEditingId(null);
  };

  const handleClick = (e: React.MouseEvent) => {
    if (shouldDisableEditing) return;
    
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
      focusFrameRef.current = window.requestAnimationFrame(() => {
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
      });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      textRef.current?.blur();
    }
    if (e.key === 'Escape') {
      if (textRef.current) {
        textRef.current.innerText = lastCommittedValueRef.current;
      }
      shouldSkipCommitRef.current = true;
      textRef.current?.blur();
    }
  };

  if (shouldDisableEditing) {
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
