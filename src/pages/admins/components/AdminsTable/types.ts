import type { Admin } from '../../types';

export interface AdminsTableProps {
  admins: Admin[];
  loading: boolean;
  togglingId: string | null;
  onToggle: (id: string, active: boolean) => void;
  onEdit: (admin: Admin) => void;
  onDelete: (admin: Admin) => void;
  emptyMessage?: string;
}