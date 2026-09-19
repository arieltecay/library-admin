import type { School } from '../../types';

export interface SchoolRowProps {
  school: School;
  onToggle: (id: string, active: boolean) => void;
  onEdit: (school: School) => void;
  onDelete: (school: School) => void;
  togglingId: string | null;
}