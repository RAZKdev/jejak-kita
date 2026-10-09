import { NextRequest, NextResponse } from 'next/server';
import { tripRepository } from '@/domain/trips/repository';
import { UpdateTripDtoSchema } from '@/domain/api-contract';

export const dynamic = 'force-dynamic';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const defaultUserId = 'default-user-id';
  try {
    const tripDetail = await tripRepository.getTripById(params.id, defaultUserId);
    if (!tripDetail) {
      return NextResponse.json(
        {
          error: {
            code: 'NOT_FOUND',
            message: 'Perjalanan tidak ditemukan',
            requestId: crypto.randomUUID(),
          },
        },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: tripDetail });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Gagal memuat detail perjalanan';
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

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const defaultUserId = 'default-user-id';
  try {
    const body = await req.json();
    const validated = UpdateTripDtoSchema.parse(body);

    const updated = await tripRepository.updateTrip(params.id, defaultUserId, validated);
    if (!updated) {
      return NextResponse.json(
        {
          error: {
            code: 'NOT_FOUND',
            message: 'Perjalanan tidak ditemukan untuk diperbarui',
            requestId: crypto.randomUUID(),
          },
        },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: updated });
  } catch (err: unknown) {
    if (err && typeof err === 'object' && 'issues' in err) {
      return NextResponse.json(
        {
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Data pembaruan tidak valid',
            details: err,
            requestId: crypto.randomUUID(),
          },
        },
        { status: 400 }
      );
    }

    const message = err instanceof Error ? err.message : 'Gagal memperbarui perjalanan';
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

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const defaultUserId = 'default-user-id';
  try {
    const success = await tripRepository.deleteTrip(params.id, defaultUserId);
    if (!success) {
      return NextResponse.json(
        {
          error: {
            code: 'NOT_FOUND',
            message: 'Perjalanan tidak ditemukan untuk dihapus',
            requestId: crypto.randomUUID(),
          },
        },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Gagal menghapus perjalanan';
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
