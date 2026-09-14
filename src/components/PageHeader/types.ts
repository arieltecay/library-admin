export interface PageHeaderAction {
  label: string;
  icon?: string;
  onClick: () => void;
  loading?: boolean;
}

export interface PageHeaderProps {
  title?: string;
  subtitle?: string;
  description?: string;
  searchPlaceholder?: string;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  primaryAction?: PageHeaderAction;
  secondaryAction?: Omit<PageHeaderAction, "loading">;
  showBell?: boolean;
}
