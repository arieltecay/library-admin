import type { SettleDebtPayload } from '../../../../api/creditsService';

export interface SettleDebtModalProps {
  isOpen: boolean;
  clientName: string;
  currentDebt: number;
  onClose: () => void;
  onConfirm: (payload: SettleDebtPayload) => Promise<void>;
}
