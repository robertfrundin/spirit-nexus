'use client';

import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Spirit } from '@/src/shared/lib/zod/spirits';
import { Card } from '@/src/shared/ui/Card';
import { Badge } from '@/src/shared/ui/Badge';
import { Button } from '@/src/shared/ui/Button';
import { Notification } from '@/src/shared/ui/Notification';
import { useCaptureSpirit } from '@/src/features/capture-spirit/model/useCaptureSpirit';
import { SpiritApiResponse } from '@/src/shared/lib/zod/spirits';
import styles from './SpiritCard.module.scss';

export type SpiritStatus = 'active' | 'captured';

type SpiritWithStatus = Spirit & { status?: SpiritStatus };

export interface SpiritCardProps {
  spirit: Spirit;
  status?: SpiritStatus;
  onCapture?: (spiritId: string) => void;
  isCapturing?: boolean;
}

export function SpiritCard({
  spirit,
  status: externalStatus,
  onCapture: externalOnCapture,
  isCapturing: externalIsCapturing,
}: SpiritCardProps) {
  const queryClient = useQueryClient();
  
  const captureMutation = useCaptureSpirit();
  
  const [notification, setNotification] = useState<{
    variant: 'error' | 'success';
    message: string;
  } | null>(null);

  const getSpiritStatus = (): SpiritStatus => {
    if (externalStatus) {
      return externalStatus;
    }
    
    const cachedData = queryClient.getQueryData<SpiritApiResponse>(['spirits']);
    if (!cachedData) return 'active';
    
    const cachedSpirit = cachedData.data.find((s) => s.id === spirit.id) as SpiritWithStatus | undefined;
    if (cachedSpirit && cachedSpirit.status === 'captured') {
      return 'captured';
    }
    return 'active';
  };
  
  const status = getSpiritStatus();

  const handleCapture = () => {
    if (status === 'captured') {
      return;
    }
    
    if (externalOnCapture) {
      externalOnCapture(spirit.id);
      return;
    }
    
    captureMutation.mutate(spirit.id, {
      onSuccess: (data) => {
        if (data && 'success' in data && data.success) {
          setNotification({
            variant: 'success',
            message: data.message || `Spirit ${spirit.name} captured successfully!`,
          });
          setTimeout(() => setNotification(null), 3000);
        } else if (data && 'error' in data) {
          setNotification({
            variant: 'error',
            message: data.error || 'Failed to capture spirit',
          });
          setTimeout(() => setNotification(null), 3000);
        }
      },
      onError: (error) => {
        setNotification({
          variant: 'error',
          message: error instanceof Error 
            ? error.message 
            : 'Failed to capture spirit. Please try again.',
        });
        setTimeout(() => setNotification(null), 3000);
      },
    });
  };

  const isCapturing = externalIsCapturing ?? captureMutation.isPending;

  return (
    <>
      {/* Уведомление об ошибке/успехе */}
      {notification && (
        <div 
          className={styles.notificationWrapper}
          style={{ 
            position: 'fixed', 
            top: '1rem', 
            right: '1rem', 
            zIndex: 1000,
            maxWidth: '400px'
          }}
        >
          <Notification
            variant={notification.variant}
            dismissible
            onClose={() => setNotification(null)}
          >
            {notification.message}
          </Notification>
        </div>
      )}
      
      <Card
        variant="elevated"
        className={styles.spiritCard}
        data-threat-level={spirit.threatLevel}
      >
        <div className={styles.header}>
          <h3 className={styles.name}>{spirit.name}</h3>
          <Badge threatLevel={spirit.threatLevel} />
        </div>

        <div className={styles.content}>
          <div className={styles.info}>
            <div className={styles.infoItem}>
              <span className={styles.label}>Type:</span>
              <span className={styles.value}>{spirit.type}</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.label}>Location:</span>
              <span className={styles.value}>{spirit.location}</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.label}>Power:</span>
              <span className={styles.value}>{spirit.power}/100</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.label}>Status:</span>
              <span className={`${styles.value} ${styles[status]}`}>
                {status === 'captured' ? 'Captured' : 'Active'}
              </span>
            </div>
          </div>

          {spirit.description && (
            <p className={styles.description}>{spirit.description}</p>
          )}
        </div>

        {status === 'active' && (
          <div className={styles.footer}>
            <Button
              variant="primary"
              fullWidth
              onClick={handleCapture}
              isLoading={isCapturing}
              disabled={isCapturing}
              className={styles.footerButton}
            >
              {isCapturing ? 'Capturing...' : 'Capture'}
            </Button>
          </div>
        )}

        {status === 'captured' && (
          <div className={styles.footer}>
            <div className={styles.capturedBadge}>✓ Captured</div>
          </div>
        )}
      </Card>
    </>
  );
}
