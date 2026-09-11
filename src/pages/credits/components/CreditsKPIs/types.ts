import type { CreditsSummary } from '../../../../api/creditsService';

export interface CreditsKPIsProps {
  summary: CreditsSummary | null;
  loading: boolean;
}

export interface KPICardProps {
  label: string;
  value: string;
  sub?: string;
  icon: string;
  iconBg: string;
  valueClass?: string;
}
