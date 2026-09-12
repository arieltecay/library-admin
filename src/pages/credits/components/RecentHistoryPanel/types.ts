import type { RecentMovement } from '../../../../api/creditsService';

export interface RecentHistoryPanelProps {
  movements: RecentMovement[];
  loading: boolean;
  onViewAll?: () => void;
}
