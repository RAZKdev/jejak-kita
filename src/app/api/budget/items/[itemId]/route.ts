import { NextRequest, NextResponse } from 'next/server';
import { tripRepository } from '@/domain/trips/repository';
import { UpdateBudgetItemDtoSchema } from '@/domain/api-contract';

export const dynamic = 'force-dynamic';

export async function PATCH(
  req: NextRequest,
  { params }: { params: { itemId: string } }
) {
  try {
    const body = await req.json();
    const validated = UpdateBudgetItemDtoSchema.parse(body);

    const updated = await tripRepository.updateBudgetItem(params.itemId, validated);
    if (!updated) {
      return NextResponse.json(
        {
          error: {
            code: 'NOT_FOUND',
            message: 'Item anggaran tidak ditemukan',
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
            message: 'Data pembaruan anggaran tidak valid',
            details: err,
            requestId: crypto.randomUUID(),
          },
        },
        { status: 400 }
      );
    }

    const message = err instanceof Error ? err.message : 'Gagal memperbarui item anggaran';
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
    const deleted = await tripRepository.deleteBudgetItem(params.itemId);
    if (!deleted) {
      return NextResponse.json(
        {
          error: {
            code: 'NOT_FOUND',
            message: 'Item anggaran tidak ditemukan untuk dihapus',
            requestId: crypto.randomUUID(),
          },
        },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Gagal menghapus item anggaran';
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
