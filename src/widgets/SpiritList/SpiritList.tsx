'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getSpirits, captureSpirit } from '@/src/shared/api/spirits';
import { useSpiritStream } from '@/src/shared/lib/sse/useSpiritStream';
import { SpiritCard, SpiritStatus } from '@/src/entities/spirit/ui/SpiritCard';
import { Notification } from '@/src/shared/ui/Notification';
import { Button } from '@/src/shared/ui/Button';
import styles from './SpiritList.module.scss';
import { useState } from 'react';

export function SpiritList() {
  const queryClient = useQueryClient();
  const [capturingSpiritId, setCapturingSpiritId] = useState<string | null>(null);
  const [notification, setNotification] = useState<{
    variant: 'error' | 'success' | 'info' | 'warning';
    message: string;
  } | null>(null);

  useSpiritStream(true);

  const {
    data: spiritsData,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ['spirits'],
    queryFn: getSpirits,
  });

  const captureMutation = useMutation({
    mutationFn: captureSpirit,
    onSuccess: (data, spiritId) => {
      setCapturingSpiritId(null);
      
      if ('success' in data && data.success) {
        queryClient.setQueryData(['spirits'], (oldData: any) => {
          if (!oldData) return oldData;
          
          return {
            ...oldData,
            data: oldData.data.map((spirit: any) =>
              spirit.id === spiritId
                ? { ...spirit, status: 'captured' }
                : spirit
            ),
          };
        });

        setNotification({
          variant: 'success',
          message: data.message || `Spirit ${spiritId} captured successfully!`,
        });
      } else if ('error' in data) {
        setNotification({
          variant: 'error',
          message: data.error || 'Failed to capture spirit',
        });
      } else {
        setNotification({
          variant: 'error',
          message: 'Failed to capture spirit',
        });
      }

      setTimeout(() => setNotification(null), 3000);
    },
    onError: (error) => {
      setCapturingSpiritId(null);
      setNotification({
        variant: 'error',
        message: error instanceof Error ? error.message : 'Failed to capture spirit',
      });
      setTimeout(() => setNotification(null), 3000);
    },
  });

  const handleCapture = (spiritId: string) => {
    setCapturingSpiritId(spiritId);
    captureMutation.mutate(spiritId);
  };

  const getSpiritStatus = (spiritId: string): SpiritStatus => {
    const cachedData = queryClient.getQueryData<any>(['spirits']);
    if (!cachedData) return 'active';
    
    const spirit = cachedData.data?.find((s: any) => s.id === spiritId);
    if (spirit && spirit.status === 'captured') {
      return 'captured';
    }
    return 'active';
  };

  if (isLoading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>
          <div className={styles.spinner} />
          <p>Loading spirits...</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>
          <Notification variant="error" title="Error loading spirits">
            {error instanceof Error ? error.message : 'Failed to load spirits'}
          </Notification>
          <Button onClick={() => refetch()} variant="primary" className={styles.retryButton}>
            Retry
          </Button>
        </div>
      </div>
    );
  }

  if (!spiritsData || spiritsData.data.length === 0) {
    return (
      <div className={styles.container}>
        <div className={styles.empty}>
          <p>No spirits found</p>
          <Button onClick={() => refetch()} variant="secondary">
            Refresh
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {notification && (
        <div className={styles.notificationWrapper}>
          <Notification
            variant={notification.variant}
            dismissible
            onClose={() => setNotification(null)}
          >
            {notification.message}
          </Notification>
        </div>
      )}

      <div className={styles.header}>
        <h1 className={styles.title}>Spirit Nexus</h1>
        <p className={styles.subtitle}>
          Found {spiritsData.meta.total} spirit{spiritsData.meta.total !== 1 ? 's' : ''}
        </p>
      </div>

      <div className={styles.grid}>
        {spiritsData.data.map((spirit) => (
          <SpiritCard
            key={spirit.id}
            spirit={spirit}
            status={getSpiritStatus(spirit.id)}
            onCapture={handleCapture}
            isCapturing={capturingSpiritId === spirit.id}
          />
        ))}
      </div>
    </div>
  );
}

