import { HTMLAttributes, ReactNode } from 'react';
import styles from './Card.module.scss';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  variant?: 'default' | 'outlined' | 'elevated';
  padding?: 'none' | 'small' | 'medium' | 'large';
}

export function Card({
  children,
  variant = 'default',
  padding = 'medium',
  className = '',
  ...props
}: CardProps) {
  const cardClasses = [
    styles.card,
    styles[variant],
    styles[`padding-${padding}`],
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={cardClasses} {...props}>
      {children}
    </div>
  );
}


