"use client";

import { useEffect, useRef, type ReactNode, type KeyboardEvent } from "react";
import { createPortal } from "react-dom";

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  /** Aria label for the dialog (use when no visible heading is present). */
  ariaLabel?: string;
  /** ID of the heading element inside the modal, if one exists. */
  ariaLabelledBy?: string;
  children?: ReactNode;
}

export default function Modal({ open, onClose, ariaLabel, ariaLabelledBy, children }: ModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);

  // Prevent body scroll while open.
  useEffect(() => {
    if (open) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = prev;
      };
    }
  }, [open]);

  // Close on Escape.
  useEffect(() => {
    if (!open) return;
    const handler = (e: globalThis.KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, onClose]);

  // Auto-focus the modal panel when it opens.
  useEffect(() => {
    if (open) overlayRef.current?.focus();
  }, [open]);

  if (!open) return null;

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose();
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Escape") onClose();
  };

  const modal = (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 500,
        background: "rgba(0,0,0,0.4)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "1rem",
      }}
      onClick={handleOverlayClick}
      aria-hidden="true"
    >
      <div
        ref={overlayRef}
        role="dialog"
        aria-modal="true"
        aria-label={ariaLabel}
        aria-labelledby={ariaLabelledBy}
        tabIndex={-1}
        onKeyDown={handleKeyDown}
        style={{
          background: "var(--bg)",
          border: "1.5px solid var(--border)",
          borderRadius: "var(--radius-lg)",
          boxShadow: "var(--shadow-md)",
          width: "100%",
          maxWidth: 480,
          maxHeight: "90vh",
          overflowY: "auto",
          outline: "none",
        }}
        aria-hidden="false"
      >
        {children}
      </div>
    </div>
  );

  return createPortal(modal, document.body);
}
