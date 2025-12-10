import { HTMLAttributes, ReactNode } from 'react';
import styles from './Badge.module.scss';

export type ThreatLevel = 'low' | 'medium' | 'high' | 'extreme';

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  threatLevel: ThreatLevel;
  children?: ReactNode;
}

const threatLevelLabels: Record<ThreatLevel, string> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
  extreme: 'Extreme',
};

export function Badge({
  threatLevel,
  children,
  className = '',
  ...props
}: BadgeProps) {
  const badgeClasses = [
    styles.badge,
    styles[threatLevel],
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <span className={badgeClasses} {...props}>
      {children || threatLevelLabels[threatLevel]}
    </span>
  );
}

