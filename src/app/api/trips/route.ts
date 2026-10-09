import { NextRequest, NextResponse } from 'next/server';
import { tripRepository } from '@/domain/trips/repository';
import { CreateTripDtoSchema } from '@/domain/api-contract';

export async function GET(req: NextRequest) {
  const defaultUserId = 'default-user-id';
  try {
    const trips = await tripRepository.listTrips(defaultUserId);
    return NextResponse.json({ data: trips });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Gagal memuat daftar perjalanan';
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

export async function POST(req: NextRequest) {
  const defaultUserId = 'default-user-id';
  try {
    const body = await req.json();
    const validated = CreateTripDtoSchema.parse(body);

    const created = await tripRepository.createTrip({
      ...validated,
      owner_user_id: defaultUserId,
    });

    return NextResponse.json({ data: created }, { status: 201 });
  } catch (err: unknown) {
    if (err && typeof err === 'object' && 'issues' in err) {
      return NextResponse.json(
        {
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Data perjalanan tidak valid',
            details: err,
            requestId: crypto.randomUUID(),
          },
        },
        { status: 400 }
      );
    }

    const message = err instanceof Error ? err.message : 'Gagal membuat perjalanan';
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
