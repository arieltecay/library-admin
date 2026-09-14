export type ToastKind = "success" | "error" | "warning" | "info";

export interface ToastProps {
  kind: ToastKind;
  message: string;
  onClose: () => void;
}
