import { HTMLAttributes, ReactNode } from 'react';
import styles from './Notification.module.scss';

export type NotificationVariant = 'error' | 'warning' | 'info' | 'success';

export interface NotificationProps extends HTMLAttributes<HTMLDivElement> {
  variant?: NotificationVariant;
  title?: string;
  children: ReactNode;
  onClose?: () => void;
  dismissible?: boolean;
}

const variantIcons: Record<NotificationVariant, string> = {
  error: '⚠️',
  warning: '⚠️',
  info: 'ℹ️',
  success: '✓',
};

export function Notification({
  variant = 'error',
  title,
  children,
  onClose,
  dismissible = false,
  className = '',
  ...props
}: NotificationProps) {
  const notificationClasses = [
    styles.notification,
    styles[variant],
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={notificationClasses} role="alert" {...props}>
      <div className={styles.content}>
        <span className={styles.icon} aria-hidden="true">
          {variantIcons[variant]}
        </span>
        <div className={styles.text}>
          {title && <div className={styles.title}>{title}</div>}
          <div className={styles.message}>{children}</div>
        </div>
      </div>
      {dismissible && onClose && (
        <button
          className={styles.closeButton}
          onClick={onClose}
          aria-label="Close notification"
        >
          ×
        </button>
      )}
    </div>
  );
}


