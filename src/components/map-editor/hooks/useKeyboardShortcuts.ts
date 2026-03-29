'use client';

import { useEffect } from 'react';

interface ShortcutCallbacks {
  onToolPaint: () => void;
  onToolErase: () => void;
  onToggleGrid: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onUndo: () => void;
  onRedo: () => void;
  onNewMap: () => void;
  onSave: () => void;
  onLoad: () => void;
  onImportTileset: () => void;
  onHelp: () => void;
  onDeleteLayer: () => void;
  onSpaceDown: () => void;
  onSpaceUp: () => void;
}

function isModalOpen(): boolean {
  return document.querySelector('[data-modal-overlay]') !== null;
}

function isInputTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  const tag = target.tagName;
  return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT';
}

export function useKeyboardShortcuts(callbacks: ShortcutCallbacks): void {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isInputTarget(e.target)) return;

      const ctrl = e.ctrlKey || e.metaKey;

      // Ctrl shortcuts — always handled (not blocked by modal)
      if (ctrl) {
        switch (e.key.toLowerCase()) {
          case 'z':
            e.preventDefault();
            callbacks.onUndo();
            return;
          case 'y':
            e.preventDefault();
            callbacks.onRedo();
            return;
          case 'n':
            e.preventDefault();
            callbacks.onNewMap();
            return;
          case 's':
            e.preventDefault();
            callbacks.onSave();
            return;
          case 'o':
            e.preventDefault();
            callbacks.onLoad();
            return;
        }
        return;
      }

      // Non-Ctrl shortcuts — skip when a modal is open
      if (isModalOpen()) return;

      switch (e.key) {
        case 'b':
        case 'B':
          callbacks.onToolPaint();
          break;
        case 'e':
        case 'E':
          callbacks.onToolErase();
          break;
        case 'g':
        case 'G':
          callbacks.onToggleGrid();
          break;
        case '+':
        case '=':
          callbacks.onZoomIn();
          break;
        case '-':
          callbacks.onZoomOut();
          break;
        case 'i':
        case 'I':
          callbacks.onImportTileset();
          break;
        case '?':
          callbacks.onHelp();
          break;
        case 'Delete':
          callbacks.onDeleteLayer();
          break;
        case ' ':
          e.preventDefault();
          callbacks.onSpaceDown();
          break;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (isInputTarget(e.target)) return;
      if (e.key === ' ') {
        callbacks.onSpaceUp();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [callbacks]);
}
