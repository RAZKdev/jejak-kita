import { describe, it, expect } from 'vitest';
import { tripRepository } from '@/domain/trips/repository';

describe('First End-to-End Slice Verification', () => {
  const userId = 'user-rangga-test';

  it('executes full lifecycle: Create Trip -> Add Destination -> Create Day -> Add Activity -> Reload -> Verify Persistence', async () => {
    // 1. Create Trip
    const createdTrip = await tripRepository.createTrip({
      owner_user_id: userId,
      title: 'Perjalanan Musim Gugur di Jepang Bersama Ibu',
      status: 'planning',
      start_date: '2026-11-10',
      end_date: '2026-11-18',
      base_currency: 'IDR',
      pace_mode: 'relaxed',
      notes: 'Memastikan hotel memiliki akses lift dan jarak dekat dengan stasiun kereta.',
    });

    expect(createdTrip).toBeDefined();
    expect(createdTrip.id).toBeDefined();
    expect(createdTrip.title).toBe('Perjalanan Musim Gugur di Jepang Bersama Ibu');

    // 2. Add Destination
    const destination = await tripRepository.addTripDestination({
      trip_id: createdTrip.id,
      country_id: 'jp',
      city_id: 'kyoto',
      order_index: 0,
      start_date: '2026-11-10',
      end_date: '2026-11-14',
      notes: 'Kyoto pangkalan pertama untuk suasana tenang.',
    });

    expect(destination.id).toBeDefined();
    expect(destination.city_id).toBe('kyoto');

    // 3. Create Itinerary Day
    const day1 = await tripRepository.createItineraryDay({
      trip_id: createdTrip.id,
      day_number: 1,
      date: '2026-11-10',
      title: 'Tiba di Kyoto & Santai di Hotel',
      pace_mode: 'relaxed',
      notes: 'Tanpa agenda padat untuk adaptasi dan istirahat.',
    });

    expect(day1.id).toBeDefined();
    expect(day1.day_number).toBe(1);

    // 4. Add Activity to Day
    const activity = await tripRepository.addItineraryItem({
      itinerary_day_id: day1.id,
      title: 'Minum Teh Sore di Kafe Tradisional',
      category: 'rest',
      start_time: '15:00',
      end_time: '16:30',
      duration_minutes: 90,
      location_name: 'Area Stasiun Kyoto',
      is_rest_opportunity: true,
      notes: 'Banyak tempat duduk nyaman beratap.',
      order_index: 1,
    });

    expect(activity.id).toBeDefined();
    expect(activity.is_rest_opportunity).toBe(true);

    // 5. Reload & Verify Persistence
    const reloaded = await tripRepository.getTripById(createdTrip.id, userId);
    expect(reloaded).not.toBeNull();
    if (!reloaded) throw new Error('Trip reload failed');

    expect(reloaded.trip.id).toBe(createdTrip.id);
    expect(reloaded.trip.title).toBe('Perjalanan Musim Gugur di Jepang Bersama Ibu');
    expect(reloaded.destinations.length).toBe(1);
    expect(reloaded.destinations[0].city_id).toBe('kyoto');
    expect(reloaded.days.length).toBe(1);
    expect(reloaded.days[0].items.length).toBe(1);
    expect(reloaded.days[0].items[0].title).toBe('Minum Teh Sore di Kafe Tradisional');
    expect(reloaded.days[0].items[0].is_rest_opportunity).toBe(true);

    // 6. Update Trip
    const updated = await tripRepository.updateTrip(createdTrip.id, userId, {
      title: 'Perjalanan Musim Gugur di Jepang Bersama Ibu (Terkonfirmasi)',
      status: 'booked',
    });
    expect(updated?.status).toBe('booked');
    expect(updated?.title).toBe('Perjalanan Musim Gugur di Jepang Bersama Ibu (Terkonfirmasi)');

    // 7. Verify security / authorization boundary: other user cannot fetch or mutate
    const unauthorized = await tripRepository.getTripById(createdTrip.id, 'other-unauthorized-user');
    expect(unauthorized).toBeNull();
  });
});
