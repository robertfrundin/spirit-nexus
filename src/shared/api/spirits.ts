import { spiritApiResponseSchema, Spirit, SpiritApiResponse } from '@/src/shared/lib/zod/spirits';
import { z } from 'zod';


const captureSuccessSchema = z.object({
    success: z.literal(true),
    message: z.string(),
    spirit: z.string(),
  });
  
  const captureErrorSchema = z.object({
    error: z.string(),
  });
  
  const captureResponseSchema = z.union([
    captureSuccessSchema,
    captureErrorSchema,
  ]);
  
  export type CaptureResponse = z.infer<typeof captureResponseSchema>;



  async function validateResponse<T>(
    response: Response,
    schema: z.ZodSchema<T>
  ): Promise<T> {
    if (!response.ok) {
      let errorMessage = `HTTP error! status: ${response.status}`;
      
      try {
        const errorData = await response.json();
        errorMessage = errorData.error || errorMessage;
      } catch {
      }
      
      throw new Error(errorMessage);
    }
  
    let data;
    try {
      data = await response.json();
    } catch (error) {
      throw new Error('Failed to parse response as JSON');
    }
  
    try {
      const validatedData = schema.parse(data);
      return validatedData;
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new Error(`Validation error: ${error.message}`);
      }
      throw error;
    }
  }

export async function getSpirits(): Promise<SpiritApiResponse> {
    const response = await fetch('/api/spirits', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
  
    return validateResponse(response, spiritApiResponseSchema);
  }

  export async function captureSpirit(spiritId: string): Promise<CaptureResponse> {
    const response = await fetch(`/api/spirits/${spiritId}/capture`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });
  
    return validateResponse(response, captureResponseSchema)
}