import { NextRequest, NextResponse } from 'next/server';
import { tripRepository } from '@/domain/trips/repository';
import { UpdateMemoryDtoSchema } from '@/domain/api-contract';

export const dynamic = 'force-dynamic';

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json();

    // Khusus untuk toggle favorite
    if (body.toggle_favorite) {
      const updated = await tripRepository.toggleMemoryFavorite(params.id);
      if (!updated) {
        return NextResponse.json(
          {
            error: {
              code: 'NOT_FOUND',
              message: 'Kenangan tidak ditemukan',
              requestId: crypto.randomUUID(),
            },
          },
          { status: 404 }
        );
      }
      return NextResponse.json({ data: updated });
    }

    const validated = UpdateMemoryDtoSchema.parse(body);
    const updated = await tripRepository.updateMemory(params.id, validated);
    if (!updated) {
      return NextResponse.json(
        {
          error: {
            code: 'NOT_FOUND',
            message: 'Kenangan tidak ditemukan untuk diperbarui',
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
            message: 'Data pembaruan kenangan tidak valid',
            details: err,
            requestId: crypto.randomUUID(),
          },
        },
        { status: 400 }
      );
    }

    const message = err instanceof Error ? err.message : 'Gagal memperbarui catatan kenangan';
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
  try {
    const deleted = await tripRepository.deleteMemory(params.id);
    if (!deleted) {
      return NextResponse.json(
        {
          error: {
            code: 'NOT_FOUND',
            message: 'Kenangan tidak ditemukan untuk dihapus',
            requestId: crypto.randomUUID(),
          },
        },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Gagal menghapus kenangan';
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
