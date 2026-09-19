export interface SchoolSwitchProps {
  active: boolean;
  onToggle: () => void;
  disabled?: boolean;
  size?: 'sm' | 'md';
  'aria-label'?: string;
}