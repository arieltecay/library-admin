import type { AdminSwitchProps } from './types';

export function AdminSwitch({ active, onToggle, disabled, size = 'md', 'aria-label': ariaLabel }: AdminSwitchProps) {
  const sizes = {
    sm: { track: 'h-5 w-9', knob: 'h-3.5 w-3.5', translateOn: 'translate-x-5', translateOff: 'translate-x-0.5' },
    md: { track: 'h-6 w-11', knob: 'h-4 w-4', translateOn: 'translate-x-6', translateOff: 'translate-x-1' },
  };

  const { track, knob, translateOn, translateOff } = sizes[size];

  return (
    <button
      type="button"
      role="switch"
      aria-checked={active}
      aria-label={ariaLabel}
      aria-disabled={disabled}
      disabled={disabled}
      onClick={onToggle}
      className={`relative inline-flex items-center rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${track} ${
        active ? 'bg-success-600' : 'bg-neutral-300'
      }`}
    >
      <span
        className={`inline-block rounded-full bg-white shadow-sm transition-transform ${knob} transform ${
          active ? translateOn : translateOff
        }`}
      />
    </button>
  );
}