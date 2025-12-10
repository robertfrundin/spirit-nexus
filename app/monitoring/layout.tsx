import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Spirit Monitoring | Spirit Nexus',
  description: 'Real-time monitoring of spirits detected across Tokyo. Updates are received every 5 seconds via Server-Sent Events.',
};

export default function MonitoringLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

