import type { DebtorItem } from '../../../../api/creditsService';

export interface ClientCreditModalProps {
  isOpen: boolean;
  client: DebtorItem;
  onClose: () => void;
}
