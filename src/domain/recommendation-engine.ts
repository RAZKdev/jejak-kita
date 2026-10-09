import {
  Country,
  PreferenceProfile,
  Recommendation,
  RecommendationFactor,
} from './schema';
import { BASELINE_COUNTRIES } from './baseline-data';

export interface EvaluationInput {
  destination: Country;
  preferences: PreferenceProfile;
  duration_days?: number;
}

/**
 * Mesin Rekomendasi V1 (Deterministik & Transparan)
 * Membandingkan preferensi pengguna dengan karakteristik destinasi.
 * Menghasilkan skor, faktor pencocokan, serta trade-offs eksplisit.
 */
export function evaluateDestination(input: EvaluationInput): Recommendation {
  const { destination, preferences, duration_days = 7 } = input;
  const factors: RecommendationFactor[] = [];
  const matched_preferences: string[] = [];
  const tradeoffs: string[] = [];

  let totalScore = 50; // Skor awal netral

  // 1. Evaluasi Ritme Perjalanan (Pace) & Jeda Istirahat (Rest Frequency)
  if (preferences.pace === 'relaxed') {
    if (destination.id === 'sg' || destination.id === 'my') {
      factors.push({
        factor_name: 'Pace & Rest Compatibility',
        score_contribution: 20,
        direction: 'positive',
        explanation: 'Jarak tempuh pendek dan waktu penerbangan singkat mendukung ritme santai dan waktu istirahat yang cukup.',
      });
      matched_preferences.push('Ritme Santai (Pace Relaxed)');
      totalScore += 20;
    } else if (destination.id === 'cn') {
      factors.push({
        factor_name: 'Mobility & Scale Trade-off',
        score_contribution: -10,
        direction: 'tradeoff',
        explanation: 'Skala kota dan atraksi di China sangat luas, memerlukan perencanaan khusus agar ritme tetap santai.',
      });
      tradeoffs.push('Skala wilayah luas memerlukan jeda istirahat ekstra');
      totalScore -= 10;
    } else {
      factors.push({
        factor_name: 'Pace Compatibility',
        score_contribution: 15,
        direction: 'positive',
        explanation: 'Infrastruktur kota modern menyediakan banyak area istirahat, kafe, dan taman yang tenang.',
      });
      matched_preferences.push('Fasilitas istirahat nyaman');
      totalScore += 15;
    }
  }

  // 2. Evaluasi Preferensi Jalan Kaki (Walking Preference)
  if (preferences.walking_preference === 'minimal') {
    if (destination.id === 'sg') {
      factors.push({
        factor_name: 'Walking & Accessibility',
        score_contribution: 20,
        direction: 'positive',
        explanation: 'Konektivitas lift, eskalator, dan jalur teduh beratap sangat lengkap untuk meminimalkan beban jalan kaki.',
      });
      matched_preferences.push('Aksesibilitas ramah jalan kaki minimal');
      totalScore += 20;
    } else if (destination.id === 'jp') {
      factors.push({
        factor_name: 'Walking Requirement Trade-off',
        score_contribution: -5,
        direction: 'tradeoff',
        explanation: 'Stasiun kereta di kota besar Jepang sering kali luas; disarankan mengombinasikan dengan taksi lokal.',
      });
      tradeoffs.push('Stasiun kereta besar memerlukan jalan kaki lebih banyak, disarankan taksi untuk sambungan akhir');
      totalScore -= 5;
    }
  } else {
    // moderate or extensive
    factors.push({
      factor_name: 'Pedestrian Walkability',
      score_contribution: 15,
      direction: 'positive',
      explanation: 'Trotoar terawat dan jalur pejalan kaki yang aman di seluruh penjuru kota.',
    });
    matched_preferences.push('Kualitas trotoar pedestrian sangat baik');
    totalScore += 15;
  }

  // 3. Evaluasi Preferensi Kuliner & Makanan (Food Preferences)
  if (preferences.food_preferences.includes('halal') || preferences.food_preferences.includes('mild')) {
    if (destination.id === 'my' || destination.id === 'sg') {
      factors.push({
        factor_name: 'Food Ease & Variety',
        score_contribution: 20,
        direction: 'positive',
        explanation: 'Pilihan makanan bersahabat dan ramah selera lokal sangat melimpah dan mudah ditemukan di mana saja.',
      });
      matched_preferences.push('Kemudahan mencari pilihan makanan yang cocok');
      totalScore += 20;
    } else {
      tradeoffs.push('Perlu riset awal untuk pilihan restoran ramah selera');
    }
  }

  // 4. Evaluasi Durasi (Duration Fit)
  if (duration_days <= 5) {
    if (destination.id === 'sg' || destination.id === 'my') {
      factors.push({
        factor_name: 'Short Duration Fit',
        score_contribution: 15,
        direction: 'positive',
        explanation: 'Sangat ideal untuk durasi perjalanan singkat (3–5 hari) tanpa kelelahan penerbangan panjang.',
      });
      matched_preferences.push('Durasi perjalanan efisien');
      totalScore += 15;
    } else {
      tradeoffs.push('Durasi singkat mungkin terasa tergesa-gesa untuk destinasi jarak jauh');
      totalScore -= 5;
    }
  } else if (duration_days >= 7) {
    if (destination.is_priority) {
      factors.push({
        factor_name: 'Ideal Exploration Duration',
        score_contribution: 15,
        direction: 'positive',
        explanation: `Durasi ${duration_days} hari sangat cocok untuk eksplorasi mendalam tanpa terburu-buru.`,
      });
      matched_preferences.push('Durasi ideal untuk eksplorasi santai');
      totalScore += 15;
    }
  }

  // 5. Evaluasi Budaya & Sejarah (Culture Preference)
  if (preferences.culture_preference === 'high') {
    if (destination.id === 'jp' || destination.id === 'kr' || destination.id === 'cn') {
      factors.push({
        factor_name: 'Cultural Heritage Match',
        score_contribution: 20,
        direction: 'positive',
        explanation: 'Kekayaan sejarah kuil, istana dinasti, dan pelestarian budaya tradisional kelas dunia.',
      });
      matched_preferences.push('Kekayaan budaya dan sejarah tinggi');
      totalScore += 20;
    }
  }

  // 6. Evaluasi Minat Belanja (Shopping Preference)
  if (preferences.shopping_preference === 'high') {
    if (destination.id === 'jp' || destination.id === 'kr' || destination.id === 'sg' || destination.id === 'th') {
      factors.push({
        factor_name: 'Shopping Match',
        score_contribution: 10,
        direction: 'positive',
        explanation: 'Pusat perbelanjaan nyaman dan ragam cinderamata khas.',
      });
      matched_preferences.push('Pilihan belanja nyaman');
      totalScore += 10;
    }
  }

  // Normalisasi Skor ke rentang 0-100
  const normalizedScore = Math.max(10, Math.min(98, totalScore));

  // Bentuk narasi penjelasan yang jujur & transparan (sesuai CONTENT.md & RECOMMENDATION_ENGINE.md)
  const explanation = `${destination.name} ${
    destination.is_priority ? '(Destinasi Prioritas Utama)' : '(Destinasi Alternatif)'
  } dipertimbangkan karena ${
    matched_preferences.length > 0
      ? `cocok dengan preferensi: ${matched_preferences.join(', ')}.`
      : 'tersedianya fasilitas perjalanan yang relevan.'
  }${
    tradeoffs.length > 0
      ? ` Pertimbangan trade-off: ${tradeoffs.join('; ')}.`
      : ''
  }`;

  return {
    id: `rec-${destination.id}`,
    country_id: destination.id,
    candidate_name: destination.name,
    is_priority_destination: destination.is_priority,
    score: normalizedScore,
    factors,
    matched_preferences,
    tradeoffs,
    explanation,
    data_freshness: 'Data terverifikasi per Oktober 2026',
    engine_version: '1.0.0-deterministic',
    status: 'suggested',
    generated_at: new Date().toISOString(),
  };
}

/**
 * Menghasilkan rekomendasi untuk semua kandidat yang diminta
 */
export function generateRecommendations(
  preferences: PreferenceProfile,
  candidateType: 'all' | 'priority_only' | 'alternatives_only' = 'all',
  duration_days: number = 7
): Recommendation[] {
  let candidates = BASELINE_COUNTRIES;

  if (candidateType === 'priority_only') {
    candidates = candidates.filter((c) => c.is_priority);
  } else if (candidateType === 'alternatives_only') {
    candidates = candidates.filter((c) => !c.is_priority);
  }

  const results = candidates.map((dest) =>
    evaluateDestination({
      destination: dest,
      preferences,
      duration_days,
    })
  );

  // Urutkan berdasarkan skor tertinggi secara deterministik,
  // dengan prioritas destinasi utama tetap transparan
  return results.sort((a, b) => b.score - a.score);
}
