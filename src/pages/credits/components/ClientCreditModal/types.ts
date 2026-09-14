import type { DebtorItem } from '../../../../api/credits';

export interface ClientCreditModalProps {
  isOpen: boolean;
  client: DebtorItem;
  onClose: () => void;
}
