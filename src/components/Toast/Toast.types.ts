export interface ToastProps {
  visible: boolean;
  message: string;
  actionLabel: string;
  onAction: () => void;
}
