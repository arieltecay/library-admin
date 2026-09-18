import type { Admin } from '../../types';

export interface AdminRowProps {
  admin: Admin;
  onToggle: (id: string, active: boolean) => void;
  onEdit: (admin: Admin) => void;
  onDelete: (admin: Admin) => void;
  togglingId: string | null;
}