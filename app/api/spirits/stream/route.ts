import { NextRequest } from 'next/server';
import { mockSpirits } from '@/src/shared/lib/mocks/spirits';


type SpiritUpdate = {
    id: string;
    threatLevel: 'low' | 'medium' | 'high' | 'extreme';
  };

const threatLevels: Array<'low' | 'medium' | 'high' | 'extreme'> = ['low', 'medium', 'high', 'extreme'];

function getRandomSpiritUpdate(): SpiritUpdate {
    const randomIndex = Math.floor(Math.random() * mockSpirits.length);
    const spirit = mockSpirits[randomIndex];
    
    const randomThreatLevelIndex = Math.floor(Math.random() * threatLevels.length);
    const newThreatLevel = threatLevels[randomThreatLevelIndex];
    
    return {
      id: spirit.id,
      threatLevel: newThreatLevel,
    };
  }

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const intervalMs = parseInt(searchParams.get('interval') || '5000', 10);

    const stream = new ReadableStream({
        start(controller) {
            const sendEvent = (data: SpiritUpdate) => {
                if (process.env.NODE_ENV === 'development') {
                    console.log('Sending SSE event:', data);
                  }
                const message =  `data: ${JSON.stringify(data)}\n\n`
                controller.enqueue(new TextEncoder().encode(message))
            }
            sendEvent(getRandomSpiritUpdate());

            const interval = setInterval(() => {
                try {
                  const update = getRandomSpiritUpdate();
                  
                  if (process.env.NODE_ENV === 'development') {
                    console.log(`[SSE] Sending update for spirit ${update.id}: ${update.threatLevel}`);
                  }
                  
                  sendEvent(update);
                } catch (error) {
                  console.error('Error sending SSE event:', error);
                  const errorMessage = `event: error\ndata: ${JSON.stringify({ error: 'Failed to get update' })}\n\n`;
                  controller.enqueue(new TextEncoder().encode(errorMessage));
                }
              }, intervalMs);

            request.signal.addEventListener('abort', () => {
                clearInterval(interval);
                controller.close();
            })
        }
    })
    return new Response(stream, {
        headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        }
    }
)}