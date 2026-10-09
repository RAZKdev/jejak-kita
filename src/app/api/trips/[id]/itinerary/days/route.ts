import { NextRequest, NextResponse } from 'next/server';
import { tripRepository } from '@/domain/trips/repository';
import { CreateItineraryDayDtoSchema } from '@/domain/api-contract';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json();
    const validated = CreateItineraryDayDtoSchema.parse(body);

    const created = await tripRepository.createItineraryDay({
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
            message: 'Data hari itinerary tidak valid',
            details: err,
            requestId: crypto.randomUUID(),
          },
        },
        { status: 400 }
      );
    }

    const message = err instanceof Error ? err.message : 'Gagal menambahkan hari itinerary';
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
