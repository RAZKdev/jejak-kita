import { NextRequest, NextResponse } from 'next/server';
import { tripRepository } from '@/domain/trips/repository';
import { ChecklistItemSchema } from '@/domain/schema';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const checklist = await tripRepository.getChecklist(params.id);
    return NextResponse.json({ data: checklist });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Gagal memuat checklist perjalanan';
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

const CreateChecklistItemDtoSchema = ChecklistItemSchema.omit({
  id: true,
});

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json();
    const validated = CreateChecklistItemDtoSchema.parse(body);

    const created = await tripRepository.addChecklistItem(params.id, validated);
    return NextResponse.json({ data: created }, { status: 201 });
  } catch (err: unknown) {
    if (err && typeof err === 'object' && 'issues' in err) {
      return NextResponse.json(
        {
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Data item checklist tidak valid',
            details: err,
            requestId: crypto.randomUUID(),
          },
        },
        { status: 400 }
      );
    }

    const message = err instanceof Error ? err.message : 'Gagal menambahkan item checklist';
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
