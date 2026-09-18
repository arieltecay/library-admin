import type { Admin, CreateAdminPayload, UpdateAdminPayload } from '../../types';

export interface AdminFormModalProps {
  isOpen: boolean;
  admin: Admin | null;
  onClose: () => void;
  onCreate?: (payload: CreateAdminPayload) => Promise<void>;
  onUpdate?: (payload: UpdateAdminPayload) => Promise<void>;
}