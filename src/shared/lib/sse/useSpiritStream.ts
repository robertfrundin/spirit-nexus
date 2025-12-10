'use client';

import { useEffect, useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { SpiritApiResponse } from '@/src/shared/lib/zod/spirits';

type SpiritUpdate = {
  id: string;
  threatLevel: 'low' | 'medium' | 'high' | 'extreme';
};

const updateSpiritCache = (
  queryClient: ReturnType<typeof useQueryClient>,
  update: SpiritUpdate,
) => {
  const cachedData = queryClient.getQueryData<SpiritApiResponse>(['spirits']);
  if (!cachedData) return;

  const updatedData = {
    ...cachedData,
    data: cachedData.data.map((spirit) =>
      spirit.id === update.id
        ? { ...spirit, threatLevel: update.threatLevel }
        : spirit
    ),
  };
  queryClient.setQueryData(['spirits'], updatedData);
};

export function useSpiritStream(enabled: boolean = true) {
  const queryClient = useQueryClient();
  const eventSourceRef = useRef<EventSource | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!enabled) {
      setIsConnected(false);
      return;
    }

    const eventSource = new EventSource('/api/spirits/stream');
    eventSourceRef.current = eventSource;

    eventSource.onopen = () => {
      setIsConnected(true);
    };

    eventSource.onmessage = (event) => {
      try {
        const update: SpiritUpdate = JSON.parse(event.data);
        
        if (process.env.NODE_ENV === 'development') {
          console.log(`[SSE Client] Received update for spirit ${update.id}: ${update.threatLevel}`);
        }
        
        updateSpiritCache(queryClient, update);
      } catch (error) {
        console.error('Error parsing SSE message:', error);
      }
    };

    eventSource.onerror = () => {
      setIsConnected(false);
    };

    return () => {
      eventSource.close();
      eventSourceRef.current = null;
      setIsConnected(false);
    };
  }, [enabled, queryClient]);

  return {
    isConnected,
  };
}

