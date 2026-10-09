import { NextRequest, NextResponse } from 'next/server';
import { tripRepository } from '@/domain/trips/repository';
import { CreateItineraryItemDtoSchema } from '@/domain/api-contract';

export async function POST(
  req: NextRequest,
  { params }: { params: { dayId: string } }
) {
  try {
    const body = await req.json();
    const validated = CreateItineraryItemDtoSchema.parse(body);

    const created = await tripRepository.addItineraryItem({
      ...validated,
      itinerary_day_id: params.dayId,
    });

    return NextResponse.json({ data: created }, { status: 201 });
  } catch (err: unknown) {
    if (err && typeof err === 'object' && 'issues' in err) {
      return NextResponse.json(
        {
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Data aktivitas itinerary tidak valid',
            details: err,
            requestId: crypto.randomUUID(),
          },
        },
        { status: 400 }
      );
    }

    const message = err instanceof Error ? err.message : 'Gagal menambahkan aktivitas ke itinerary';
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
