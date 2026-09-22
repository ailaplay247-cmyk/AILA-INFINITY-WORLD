import { useEffect } from 'react';

export interface ShortcutHandlers {
  onSwitchTab?: (tabIndex: number) => void; // 1: DMT, 2: AEPS, 3: BBPS, 4: TRACKER
  onOpenWallet?: () => void;
  onOpenCommission?: () => void;
  onOpenShortcutsModal?: () => void;
  onOpenProfile?: () => void;
  onLockKiosk?: () => void;
  onCloseModals?: () => void;
  onToggleSimulate?: () => void;
}

export function useKeyboardShortcuts({
  onSwitchTab,
  onOpenWallet,
  onOpenCommission,
  onOpenShortcutsModal,
  onOpenProfile,
  onLockKiosk,
  onCloseModals,
  onToggleSimulate,
}: ShortcutHandlers) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore shortcut keys when the user is typing in standard text inputs or textareas,
      // EXCEPT when modifier keys (Ctrl/Alt/Meta) are used or Escape is pressed.
      const target = e.target as HTMLElement | null;
      const isEditable =
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.tagName === 'SELECT' ||
          target.isContentEditable);

      const hasModifier = e.ctrlKey || e.altKey || e.metaKey;

      // Global Escape handler (always active even in inputs to dismiss dialogs)
      if (e.key === 'Escape') {
        if (onCloseModals) {
          e.preventDefault();
          onCloseModals();
        }
        return;
      }

      // '?' key to open shortcut cheat-sheet when not typing in an input
      if (e.key === '?' && !isEditable && !hasModifier) {
        if (onOpenShortcutsModal) {
          e.preventDefault();
          onOpenShortcutsModal();
        }
        return;
      }

      // All remaining shortcuts require Ctrl, Alt, or Meta
      if (!hasModifier) return;

      const key = e.key.toLowerCase();

      // Number keys 1 - 9: Quick Tab Switching
      // (Ctrl+1..9, Alt+1..9, Meta+1..9, etc.)
      if (['1', '2', '3', '4', '5', '6', '7', '8', '9'].includes(e.key)) {
        e.preventDefault();
        const tabIndex = parseInt(e.key, 10);
        if (onSwitchTab) {
          onSwitchTab(tabIndex);
        }
        return;
      }

      // Ctrl/Alt + K: Shortcuts Help Modal
      if (key === 'k') {
        e.preventDefault();
        if (onOpenShortcutsModal) {
          onOpenShortcutsModal();
        }
        return;
      }

      // Ctrl/Alt + W: Float & Settlement Wallet Modal
      if (key === 'w') {
        e.preventDefault();
        if (onOpenWallet) {
          onOpenWallet();
        }
        return;
      }

      // Ctrl/Alt + U: User / Agent Profile Section
      if (key === 'u') {
        e.preventDefault();
        if (onOpenProfile) {
          onOpenProfile();
        }
        return;
      }

      // Ctrl/Alt + S: Commission Slab Modal
      if (key === 's') {
        e.preventDefault();
        if (onOpenCommission) {
          onOpenCommission();
        }
        return;
      }

      // Ctrl/Alt + L: Quick Lock Kiosk Terminal
      if (key === 'l') {
        e.preventDefault();
        if (onLockKiosk) {
          onLockKiosk();
        }
        return;
      }

      // Ctrl/Alt + M: Toggle Gateway Simulation
      if (key === 'm') {
        e.preventDefault();
        if (onToggleSimulate) {
          onToggleSimulate();
        }
        return;
      }
    };

    window.addEventListener('keydown', handleKeyDown, { capture: true });
    return () => {
      window.removeEventListener('keydown', handleKeyDown, { capture: true });
    };
  }, [
    onSwitchTab,
    onOpenWallet,
    onOpenCommission,
    onOpenShortcutsModal,
    onOpenProfile,
    onLockKiosk,
    onCloseModals,
    onToggleSimulate,
  ]);
}
