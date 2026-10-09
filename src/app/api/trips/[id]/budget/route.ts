import { NextRequest, NextResponse } from 'next/server';
import { tripRepository } from '@/domain/trips/repository';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const budgetSummary = await tripRepository.getBudgetSummary(params.id);
    return NextResponse.json({ data: budgetSummary });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Gagal memuat anggaran perjalanan';
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
