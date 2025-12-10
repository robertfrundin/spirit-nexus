import { NextRequest, NextResponse } from 'next/server';
import { spiritApiResponseSchema } from '@/src/shared/lib/zod/spirits';
import { mockSpirits } from '@/src/shared/lib/mocks/spirits'; 



export async function GET() {
    try{
        const apiResponse  ={
            data: mockSpirits,
            meta: {
                total: mockSpirits.length,
                page: 1,
                pageSize: 10,
            },
        }
        const validatedResponse = spiritApiResponseSchema.parse(apiResponse);
        return NextResponse.json(validatedResponse);
    } catch (error) {
        return NextResponse.json({error: 'Failed to get spirits'}, {status: 500})
    }
}