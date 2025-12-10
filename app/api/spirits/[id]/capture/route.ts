import { NextResponse } from 'next/server';
import { mockSpirits } from '@/src/shared/lib/mocks/spirits';

export async function POST(
    request: Request,
    {params}: {params: Promise<{id: string}>}
){

    const {id} = await params

    const spiritExists = mockSpirits.some((spirit) => spirit.id === id);
    
    if (!spiritExists) {
      return NextResponse.json(
        { error: `Spirit with id ${id} not found` },
        { status: 404 }
      );
    }

    const random = Math.random()
    if ( random < 0.3){
        return NextResponse.json({error: 'Failed to capture spirit'}, {status: 400})
    }

    return NextResponse.json({
        success: true,
        message: 'Spirit captured successfully',
        spirit: id,
    },
    {status: 200}
)
}