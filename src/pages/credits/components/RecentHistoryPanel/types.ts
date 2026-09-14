import type { RecentMovement } from '../../../../api/credits';

export interface RecentHistoryPanelProps {
  movements: RecentMovement[];
  loading: boolean;
  onViewAll?: () => void;
}
