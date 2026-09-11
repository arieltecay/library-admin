import type { DebtorItem } from '../../../../api/creditsService';

export interface DebtorTableProps {
  debtors: DebtorItem[];
  loading: boolean;
  onSettle: (item: DebtorItem) => void;
  onViewDetail: (item: DebtorItem) => void;
}
