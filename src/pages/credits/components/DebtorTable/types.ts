import type { DebtorItem } from '../../../../api/credits';

export interface DebtorTableProps {
  debtors: DebtorItem[];
  loading: boolean;
  onSettle: (item: DebtorItem) => void;
  onViewDetail: (item: DebtorItem) => void;
}
