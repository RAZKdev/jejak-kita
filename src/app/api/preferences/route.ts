import { NextRequest, NextResponse } from 'next/server';
import { tripRepository } from '@/domain/trips/repository';
import { UpdatePreferencesDtoSchema } from '@/domain/api-contract';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const defaultUserId = 'default-user-id';
  try {
    const preferences = await tripRepository.getPreferenceProfile(defaultUserId);
    return NextResponse.json({ data: preferences });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Gagal memuat profil preferensi';
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

export async function PUT(req: NextRequest) {
  const defaultUserId = 'default-user-id';
  try {
    const body = await req.json();
    const validated = UpdatePreferencesDtoSchema.parse(body);

    const updated = await tripRepository.updatePreferenceProfile(defaultUserId, validated);
    return NextResponse.json({ data: updated });
  } catch (err: unknown) {
    if (err && typeof err === 'object' && 'issues' in err) {
      return NextResponse.json(
        {
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Data preferensi tidak valid',
            details: err,
            requestId: crypto.randomUUID(),
          },
        },
        { status: 400 }
      );
    }

    const message = err instanceof Error ? err.message : 'Gagal memperbarui preferensi';
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
