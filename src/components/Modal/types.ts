import type { ReactNode } from "react";

export interface ModalProps {
  isOpen?: boolean;
  title?: string;
  onClose: () => void;
  children: ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
  footer?: ReactNode;
}
