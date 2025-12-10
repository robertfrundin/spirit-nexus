import { z } from 'zod';

export const spiritsSchema = z.object({
    id: z.string(),
    name: z.string(),
    description: z.string(),
    type: z.string(),
    power: z.number().min(0).max(100),
    createdAt: z.string().datetime(),
    threatLevel: z.enum(['low', 'medium', 'high', 'extreme']), // Уровень угрозы
    location: z.string(), 
});


export const spiritsListSchema = z.array(spiritsSchema);

const metaSchema = z.object({
    total: z.number(), 
    page: z.number().positive(), 
    pageSize: z.number().positive(), 
}); 
export const spiritApiResponseSchema = z.object({
    data: spiritsListSchema, 
    meta: metaSchema, 
});

export type Spirit = z.infer<typeof spiritsSchema>;
export type SpiritList = z.infer<typeof spiritsListSchema>;
export type SpiritApiResponse = z.infer<typeof spiritApiResponseSchema>;