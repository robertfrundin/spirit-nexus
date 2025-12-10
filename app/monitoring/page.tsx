'use client';

import { SpiritList } from '@/src/widgets/SpiritList';
import { useSpiritStream } from '@/src/shared/lib/sse/useSpiritStream';
import styles from './page.module.scss';

export default function MonitoringPage() {
  const { isConnected } = useSpiritStream(true);

  return (
    <div className={styles.monitoringPage}>
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <h1 className={styles.pageTitle}>Spirit Monitoring</h1>
          <div className={styles.statusIndicator}>
            <span className={styles.statusLabel}>Stream Status:</span>
            <span 
              className={`${styles.statusBadge} ${isConnected ? styles.connected : styles.disconnected}`}
            >
              {isConnected ? '● Connected' : '○ Disconnected'}
            </span>
          </div>
        </div>
        <p className={styles.pageDescription}>
          Real-time monitoring of spirits detected across Tokyo. 
          Updates are received every 5 seconds via Server-Sent Events.
        </p>
      </div>

      <div className={styles.content}>
        <SpiritList />
      </div>
    </div>
  );
}

