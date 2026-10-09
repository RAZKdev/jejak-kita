import { NextRequest, NextResponse } from 'next/server';
import { tripRepository } from '@/domain/trips/repository';

export const dynamic = 'force-dynamic';

export async function PATCH(
  req: NextRequest,
  { params }: { params: { itemId: string } }
) {
  try {
    const tripId = req.nextUrl.searchParams.get('tripId') || undefined;

    const toggled = await tripRepository.toggleChecklistItem(params.itemId, tripId);
    if (!toggled) {
      return NextResponse.json(
        {
          error: {
            code: 'NOT_FOUND',
            message: 'Item checklist tidak ditemukan',
            requestId: crypto.randomUUID(),
          },
        },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: toggled });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Gagal memperbarui status checklist';
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
  { params }: { params: { itemId: string } }
) {
  try {
    const tripId = req.nextUrl.searchParams.get('tripId') || undefined;

    const deleted = await tripRepository.deleteChecklistItem(params.itemId, tripId);
    if (!deleted) {
      return NextResponse.json(
        {
          error: {
            code: 'NOT_FOUND',
            message: 'Item checklist tidak ditemukan untuk dihapus',
            requestId: crypto.randomUUID(),
          },
        },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Gagal menghapus item checklist';
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
