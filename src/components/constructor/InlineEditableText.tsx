import React, { useLayoutEffect, useRef } from 'react';
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
  
  const textRef = useRef<HTMLElement | null>(null);
  const focusFrameRef = useRef<number | null>(null);
  const isCommittingRef = useRef(false);
  const shouldSkipCommitRef = useRef(false);
  const lastCommittedValueRef = useRef(value);
  const lastInitializedEditIdRef = useRef<string | null>(null);
  const isReadOnlyRuntime = (() => {
    try {
      return (window as any).__SOLUTIUM_READ_ONLY_RENDER__ === true;
    } catch {
      return false;
    }
  })();
  const shouldDisableEditing = isPreviewMode || isReadOnlyRuntime;

  useLayoutEffect(() => {
    lastCommittedValueRef.current = value;
    const node = textRef.current;

    if (focusFrameRef.current !== null) {
      window.cancelAnimationFrame(focusFrameRef.current);
      focusFrameRef.current = null;
    }

    if (!node) {
      if (!isEditing) {
        isCommittingRef.current = false;
        shouldSkipCommitRef.current = false;
        lastInitializedEditIdRef.current = null;
      }
      return;
    }

    if (isEditing) {
      if (lastInitializedEditIdRef.current !== fullId) {
        node.textContent = value;
        lastInitializedEditIdRef.current = fullId;
      }

      focusFrameRef.current = window.requestAnimationFrame(() => {
        const currentNode = textRef.current;
        if (!currentNode || !currentNode.isConnected) return;
        currentNode.focus();
        const range = document.createRange();
        const selection = window.getSelection();
        range.selectNodeContents(currentNode);
        range.collapse(false);
        selection?.removeAllRanges();
        selection?.addRange(range);
      });
      return;
    }

    isCommittingRef.current = false;
    shouldSkipCommitRef.current = false;
    lastInitializedEditIdRef.current = null;
  }, [fullId, isEditing, value]);

  React.useEffect(() => {
    return () => {
      if (focusFrameRef.current !== null) {
        window.cancelAnimationFrame(focusFrameRef.current);
      }
    };
  }, []);

  const getCurrentTextValue = () => {
    return textRef.current?.textContent?.replace(/\u00a0/g, ' ') ?? '';
  };

  const clearUncontrolledEditableContent = () => {
    const node = textRef.current;
    if (!node) return;
    node.textContent = '';
  };

  const setEditableRef = (node: HTMLElement | null) => {
    textRef.current = node;
  };

  const handleBlur = () => {
    if (!isEditing || isCommittingRef.current) return;
    isCommittingRef.current = true;

    if (shouldSkipCommitRef.current) {
      shouldSkipCommitRef.current = false;
      clearUncontrolledEditableContent();
      setInlineEditingId(null);
      return;
    }

    const newValue = getCurrentTextValue();
    if (newValue !== lastCommittedValueRef.current) {
      lastCommittedValueRef.current = newValue;
      if (onSave) {
        onSave(newValue);
      } else {
        updateSectionSettings(moduleId, { [fullId]: newValue });
      }
    }
    clearUncontrolledEditableContent();
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
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      textRef.current?.blur();
    }
    if (e.key === 'Escape') {
      e.preventDefault();
      shouldSkipCommitRef.current = true;
      textRef.current?.blur();
    }
  };

  if (shouldDisableEditing) {
    return <Tag className={className} style={style}>{children || value}</Tag>;
  }

  return (
    <Tag
      ref={setEditableRef as unknown as React.Ref<any>}
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
      {!isEditing ? (children || value) : null}
    </Tag>
  );
};
