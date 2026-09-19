import { ConfirmModal as AdminConfirmModal } from '../../../../pages/admins/components/ConfirmModal';
import type { ConfirmModalProps } from './types';

export function ConfirmModal(props: ConfirmModalProps) {
  return <AdminConfirmModal {...props} />;
}