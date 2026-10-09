import { NextRequest, NextResponse } from 'next/server';
import { tripRepository } from '@/domain/trips/repository';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const memories = await tripRepository.getAllMemories();
    return NextResponse.json({ data: memories });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Gagal memuat semua kenangan';
    return NextResponse.json(
      {
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message,
          requestId: crypto.randomUUID(),
        },
      },
      { status: 500 }
    );
  }
}
