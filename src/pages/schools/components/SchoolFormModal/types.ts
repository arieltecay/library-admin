import type { School, CreateSchoolPayload, UpdateSchoolPayload } from '../../types';

export interface SchoolFormModalProps {
  isOpen: boolean;
  school: School | null;
  onClose: () => void;
  onCreate?: (payload: CreateSchoolPayload) => Promise<void>;
  onUpdate?: (payload: UpdateSchoolPayload) => Promise<void>;
}