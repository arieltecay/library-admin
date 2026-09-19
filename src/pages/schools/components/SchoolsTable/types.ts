import type { School } from '../../types';

export interface SchoolsTableProps {
  schools: School[];
  loading: boolean;
  togglingId: string | null;
  onToggle: (id: string, active: boolean) => void;
  onEdit: (school: School) => void;
  onDelete: (school: School) => void;
  emptyMessage?: string;
}