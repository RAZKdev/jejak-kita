import { NextRequest, NextResponse } from 'next/server';
import { tripRepository } from '@/domain/trips/repository';
import { CreateMemoryDtoSchema } from '@/domain/api-contract';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const memories = await tripRepository.listMemories(params.id);
    return NextResponse.json({ data: memories });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Gagal memuat catatan kenangan perjalanan';
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

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json();
    const validated = CreateMemoryDtoSchema.parse(body);

    const created = await tripRepository.createMemory({
      ...validated,
      trip_id: params.id,
    });

    return NextResponse.json({ data: created }, { status: 201 });
  } catch (err: unknown) {
    if (err && typeof err === 'object' && 'issues' in err) {
      return NextResponse.json(
        {
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Data kenangan tidak valid',
            details: err,
            requestId: crypto.randomUUID(),
          },
        },
        { status: 400 }
      );
    }

    const message = err instanceof Error ? err.message : 'Gagal menambahkan kenangan perjalanan';
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
