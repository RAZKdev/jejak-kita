import { NextRequest, NextResponse } from 'next/server';
import { tripRepository } from '@/domain/trips/repository';
import { generateRecommendations } from '@/domain/recommendation-engine';
import { GenerateRecommendationDtoSchema } from '@/domain/api-contract';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const defaultUserId = 'default-user-id';
  try {
    const body = await req.json().catch(() => ({}));
    const validated = GenerateRecommendationDtoSchema.parse(body);

    const preferences = await tripRepository.getPreferenceProfile(defaultUserId);
    const recommendations = generateRecommendations(
      preferences,
      validated.candidate_type,
      validated.duration_days || 7
    );

    return NextResponse.json({ data: recommendations });
  } catch (err: unknown) {
    if (err && typeof err === 'object' && 'issues' in err) {
      return NextResponse.json(
        {
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Parameter rekomendasi tidak valid',
            details: err,
            requestId: crypto.randomUUID(),
          },
        },
        { status: 400 }
      );
    }

    const message = err instanceof Error ? err.message : 'Gagal menghasilkan rekomendasi baru';
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
