import {
  Trip,
  TripDestination,
  ItineraryDay,
  ItineraryItem,
  PreferenceProfile,
  BudgetItem,
  BudgetSummary,
  Checklist,
  ChecklistItem,
  Memory,
  MediaReference,
} from '../schema';
import { BASELINE_COUNTRIES, BASELINE_CITIES } from '../baseline-data';

export interface ITripRepository {
  // Trips & Itinerary
  listTrips(ownerUserId: string): Promise<Trip[]>;
  getTripById(id: string, ownerUserId: string): Promise<{
    trip: Trip;
    destinations: TripDestination[];
    days: ItineraryDay[];
  } | null>;
  createTrip(trip: Omit<Trip, 'id' | 'created_at' | 'updated_at'> & { id?: string }): Promise<Trip>;
  updateTrip(id: string, ownerUserId: string, updates: Partial<Trip>): Promise<Trip | null>;
  deleteTrip(id: string, ownerUserId: string): Promise<boolean>;

  addTripDestination(destination: Omit<TripDestination, 'id'> & { id?: string }): Promise<TripDestination>;
  createItineraryDay(day: Omit<ItineraryDay, 'id' | 'items'> & { id?: string }): Promise<ItineraryDay>;
  addItineraryItem(item: Omit<ItineraryItem, 'id'> & { id?: string }): Promise<ItineraryItem>;
  deleteItineraryItem(itemId: string): Promise<boolean>;

  // Preferences
  getPreferenceProfile(userId: string): Promise<PreferenceProfile>;
  updatePreferenceProfile(userId: string, updates: Partial<PreferenceProfile>): Promise<PreferenceProfile>;

  // Budget (M4)
  getBudgetSummary(tripId: string): Promise<BudgetSummary>;
  addBudgetItem(item: Omit<BudgetItem, 'id'> & { id?: string }): Promise<BudgetItem>;
  updateBudgetItem(itemId: string, updates: Partial<BudgetItem>): Promise<BudgetItem | null>;
  deleteBudgetItem(itemId: string): Promise<boolean>;

  // Checklist (M4)
  getChecklist(tripId: string): Promise<Checklist>;
  addChecklistItem(tripId: string, item: Omit<ChecklistItem, 'id'> & { id?: string }): Promise<ChecklistItem>;
  toggleChecklistItem(tripId?: string, itemId?: string): Promise<ChecklistItem | null>;
  deleteChecklistItem(tripId?: string, itemId?: string): Promise<boolean>;

  // Memories (M5)
  listMemories(tripId: string): Promise<Memory[]>;
  getAllMemories(): Promise<Memory[]>;
  createMemory(memory: Omit<Memory, 'id' | 'created_at' | 'updated_at'> & { id?: string }): Promise<Memory>;
  updateMemory(memoryId: string, updates: Partial<Memory>): Promise<Memory | null>;
  deleteMemory(memoryId: string): Promise<boolean>;
  toggleMemoryFavorite(memoryId: string): Promise<Memory | null>;
}

// In-Memory store untuk development, testing, dan offline-first fallback
class MemoryTripRepository implements ITripRepository {
  private trips: Map<string, Trip> = new Map();
  private destinations: Map<string, TripDestination> = new Map();
  private days: Map<string, ItineraryDay> = new Map();
  private items: Map<string, ItineraryItem> = new Map();
  private preferences: Map<string, PreferenceProfile> = new Map();
  private budgetItems: Map<string, BudgetItem> = new Map();
  private checklists: Map<string, Checklist> = new Map();
  private memories: Map<string, Memory> = new Map();

  constructor() {
    this.seedInitialData();
  }

  private seedInitialData() {
    const defaultUserId = 'default-user-id';
    const sampleTripId = 'trip-japan-spring-2026';

    // 1. Trip
    const sampleTrip: Trip = {
      id: sampleTripId,
      owner_user_id: defaultUserId,
      title: 'Perjalanan Jepang Santai Bersama Ibu',
      status: 'planning',
      start_date: '2026-10-20',
      end_date: '2026-10-28',
      base_currency: 'IDR',
      pace_mode: 'relaxed',
      notes: 'Fokus pada kuil bersejarah, jalan santai di taman, dan jeda istirahat teh sore.',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    this.trips.set(sampleTrip.id, sampleTrip);

    // 2. Destinations
    const destKyoto: TripDestination = {
      id: 'dest-kyoto',
      trip_id: sampleTripId,
      country_id: 'jp',
      city_id: 'kyoto',
      order_index: 0,
      start_date: '2026-10-20',
      end_date: '2026-10-24',
      notes: 'Pangkalan hotel di Kyoto dekat stasiun dengan akses lift.',
    };
    this.destinations.set(destKyoto.id, destKyoto);

    const destTokyo: TripDestination = {
      id: 'dest-tokyo',
      trip_id: sampleTripId,
      country_id: 'jp',
      city_id: 'tokyo',
      order_index: 1,
      start_date: '2026-10-24',
      end_date: '2026-10-28',
      notes: 'Menikmati suasana taman Shinjuku Gyoen dan belanja santai.',
    };
    this.destinations.set(destTokyo.id, destTokyo);

    // 3. Days & Itinerary Items
    const day1: ItineraryDay = {
      id: 'day-1',
      trip_id: sampleTripId,
      day_number: 1,
      date: '2026-10-20',
      title: 'Tiba di Kyoto & Istirahat Santai',
      pace_mode: 'relaxed',
      notes: 'Tidak ada agenda padat di hari pertama agar Ibu tidak lelah setelah penerbangan.',
      items: [],
    };
    this.days.set(day1.id, day1);

    const item1: ItineraryItem = {
      id: 'item-1',
      itinerary_day_id: day1.id,
      title: 'Check-in Hotel & Rehat Sejenak',
      category: 'hotel',
      start_time: '14:00',
      end_time: '16:00',
      duration_minutes: 120,
      location_name: 'Kyoto Station Area',
      order_index: 0,
      is_rest_opportunity: true,
      notes: 'Bongkar koper dan istirahat santai.',
    };
    const item2: ItineraryItem = {
      id: 'item-2',
      itinerary_day_id: day1.id,
      title: 'Jalan Santai Sore di Kawasan Gion & Makan Malam',
      category: 'food',
      start_time: '17:00',
      end_time: '19:00',
      duration_minutes: 120,
      location_name: 'Gion District',
      order_index: 1,
      is_rest_opportunity: false,
      notes: 'Makan malam sup hangat yang ramah pencernaan.',
    };
    this.items.set(item1.id, item1);
    this.items.set(item2.id, item2);

    // 4. Default Preference Profile
    const defaultPref: PreferenceProfile = {
      user_id: defaultUserId,
      pace: 'relaxed',
      walking_preference: 'moderate',
      rest_frequency: 'frequent',
      activity_density: 'low',
      transport_preference: 'taxi_private',
      day_start_preference: 'relaxed_morning',
      interests: ['Budaya & Sejarah', 'Taman & Alam Tenang', 'Kuliner Ramah'],
      food_preferences: ['halal', 'mild'],
      shopping_preference: 'moderate',
      culture_preference: 'high',
      nature_preference: 'high',
      updated_at: new Date().toISOString(),
    };
    this.preferences.set(defaultUserId, defaultPref);

    // 5. Seed Budget Items (M4)
    const seedBudgetList: BudgetItem[] = [
      {
        id: 'budget-1',
        trip_id: sampleTripId,
        category: 'transport',
        name: 'Tiket Pesawat Pulang Pergi (Garuda Indonesia)',
        planned_amount: 18000000,
        actual_amount: 17500000,
        currency: 'IDR',
        notes: 'Penerbangan langsung Jakarta - Osaka (KIX) & Tokyo (HND) - Jakarta',
      },
      {
        id: 'budget-2',
        trip_id: sampleTripId,
        category: 'lodging',
        name: 'Hotel Kyoto (4 Malam dekat Stasiun)',
        planned_amount: 9000000,
        actual_amount: 8800000,
        currency: 'IDR',
        notes: 'Hotel dengan lift luas dan kamar non-smoking',
      },
      {
        id: 'budget-3',
        trip_id: sampleTripId,
        category: 'lodging',
        name: 'Hotel Tokyo (4 Malam di Shinjuku)',
        planned_amount: 10000000,
        actual_amount: 9800000,
        currency: 'IDR',
        notes: 'Kamar twin bed yang luas untuk kenyamanan Ibu',
      },
      {
        id: 'budget-4',
        trip_id: sampleTripId,
        category: 'transport',
        name: 'Shinkansen Kyoto ke Tokyo & Taksi Lokal',
        planned_amount: 6000000,
        actual_amount: 4500000,
        currency: 'IDR',
        notes: 'Disediakan alokasi taksi untuk menghindari lelah berjalan di stasiun',
      },
      {
        id: 'budget-5',
        trip_id: sampleTripId,
        category: 'food',
        name: 'Estimasi Makan & Santai Kafe Teh (8 Hari)',
        planned_amount: 8000000,
        actual_amount: 6200000,
        currency: 'IDR',
        notes: 'Termasuk camilan buah segar dan teh hijau hangat setiap sore',
      },
    ];
    seedBudgetList.forEach((b) => this.budgetItems.set(b.id, b));

    // 6. Seed Checklist (M4)
    const seedChecklist: Checklist = {
      id: `check-${sampleTripId}`,
      trip_id: sampleTripId,
      title: 'Perlengkapan & Dokumen Perjalanan Bersama Ibu',
      items: [
        { id: 'c-1', text: 'Paspor asli & e-Visa / Visit Japan Web QR', is_completed: true, category: 'Dokumen' },
        { id: 'c-2', text: 'Asuransi perjalanan komprehensif', is_completed: true, category: 'Dokumen' },
        { id: 'c-3', text: 'Obat-obatan pribadi Ibu (balsem, vitamin, tetes mata)', is_completed: true, category: 'Kesehatan' },
        { id: 'c-4', text: 'Sepatu berjalan yang empuk dan sudah teruji nyaman', is_completed: true, category: 'Kenyamanan' },
        { id: 'c-5', text: 'Jaket hangat ringan / syal untuk cuaca sejuk', is_completed: false, category: 'Pakaian' },
        { id: 'c-6', text: 'Adaptor colokan listrik tipe Jepang (tipe A)', is_completed: true, category: 'Elektronik' },
        { id: 'c-7', text: 'Kartu e-Money (Suica / Pasmo) di Apple Wallet', is_completed: false, category: 'Transportasi' },
      ],
    };
    this.checklists.set(seedChecklist.id, seedChecklist);

    // 7. Seed Memories (M5 - Warm, personal, authentic)
    const seedMemories: Memory[] = [
      {
        id: 'mem-1',
        trip_id: sampleTripId,
        title: 'Momen Sore Menenangkan di Taman Shinjuku Gyoen',
        date: '2026-10-25',
        content:
          'Duduk santai di bangku kayu di bawah pohon maple yang mulai menguning. Ibu tersenyum senang menikmati semilir angin sejuk sambil minum teh ocha hangat. Tanpa terburu-buru, kami menghabiskan hampir dua jam hanya mengobrol tentang kenangan masa kecil saya. Momen hening yang sangat berharga.',
        is_favorite: true,
        media: [
          {
            id: 'media-1',
            memory_id: 'mem-1',
            storage_path: '/images/memories/shinjuku-bench.webp',
            public_url: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=1200&q=80',
            caption: 'Ibu menikmati suasana tenang di Shinjuku Gyoen',
            alt_text: 'Ibu duduk di bangku taman Shinjuku Gyoen dengan latar pepohonan musim gugur yang tenang',
            sort_order: 0,
          },
        ],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: 'mem-2',
        trip_id: sampleTripId,
        title: 'Cangkir Teh Matcha Pertama di Sudut Klasik Gion',
        date: '2026-10-21',
        content:
          'Setelah berjalan pelan melewati gang tradisional Gion, kami menemukan kedai teh kayu kecil yang tenang. Ibu sangat menyukai wagashi kacang merah yang manis lembut dipadukan teh matcha hangat. Pemilik kedai menyambut kami dengan ramah dan membungkuk hormat.',
        is_favorite: true,
        media: [
          {
            id: 'media-2',
            memory_id: 'mem-2',
            storage_path: '/images/memories/kyoto-tea.webp',
            public_url: 'https://images.unsplash.com/photo-1545048702-79360700129e?auto=format&fit=crop&w=1200&q=80',
            caption: 'Secangkir teh hijau hangat dan manisan wagashi di Gion',
            alt_text: 'Satu set teh matcha tradisional dan kue manis Jepang di atas meja kayu',
            sort_order: 0,
          },
        ],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ];
    seedMemories.forEach((m) => this.memories.set(m.id, m));
  }

  // --- TRIPS ---
  async listTrips(ownerUserId: string): Promise<Trip[]> {
    return Array.from(this.trips.values()).filter(
      (t) => t.owner_user_id === ownerUserId || ownerUserId === 'default-user-id'
    );
  }

  async getTripById(id: string, ownerUserId: string) {
    const trip = this.trips.get(id);
    if (!trip) return null;
    if (ownerUserId !== 'default-user-id' && trip.owner_user_id !== ownerUserId) {
      return null;
    }

    const destinations = Array.from(this.destinations.values())
      .filter((d) => d.trip_id === id)
      .sort((a, b) => a.order_index - b.order_index);

    const days = Array.from(this.days.values())
      .filter((d) => d.trip_id === id)
      .sort((a, b) => a.day_number - b.day_number)
      .map((day) => {
        const dayItems = Array.from(this.items.values())
          .filter((item) => item.itinerary_day_id === day.id)
          .sort((a, b) => a.order_index - b.order_index);
        return {
          ...day,
          items: dayItems,
        };
      });

    return { trip, destinations, days };
  }

  async createTrip(tripInput: Omit<Trip, 'id' | 'created_at' | 'updated_at'> & { id?: string }): Promise<Trip> {
    const id = tripInput.id || `trip-${Date.now()}`;
    const newTrip: Trip = {
      ...tripInput,
      id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    this.trips.set(id, newTrip);
    return newTrip;
  }

  async updateTrip(id: string, ownerUserId: string, updates: Partial<Trip>): Promise<Trip | null> {
    const existing = this.trips.get(id);
    if (!existing) return null;
    if (ownerUserId !== 'default-user-id' && existing.owner_user_id !== ownerUserId) return null;

    const updated: Trip = {
      ...existing,
      ...updates,
      id: existing.id,
      owner_user_id: existing.owner_user_id,
      updated_at: new Date().toISOString(),
    };
    this.trips.set(id, updated);
    return updated;
  }

  async deleteTrip(id: string, ownerUserId: string): Promise<boolean> {
    const existing = this.trips.get(id);
    if (!existing) return false;
    if (ownerUserId !== 'default-user-id' && existing.owner_user_id !== ownerUserId) return false;

    this.trips.delete(id);
    return true;
  }

  async addTripDestination(destInput: Omit<TripDestination, 'id'> & { id?: string }): Promise<TripDestination> {
    const id = destInput.id || `dest-${Date.now()}`;
    const dest: TripDestination = { ...destInput, id };
    this.destinations.set(id, dest);
    return dest;
  }

  async createItineraryDay(dayInput: Omit<ItineraryDay, 'id' | 'items'> & { id?: string }): Promise<ItineraryDay> {
    const id = dayInput.id || `day-${Date.now()}`;
    const day: ItineraryDay = { ...dayInput, id, items: [] };
    this.days.set(id, day);
    return day;
  }

  async addItineraryItem(itemInput: Omit<ItineraryItem, 'id'> & { id?: string }): Promise<ItineraryItem> {
    const id = itemInput.id || `item-${Date.now()}`;
    const item: ItineraryItem = { ...itemInput, id };
    this.items.set(id, item);
    return item;
  }

  async deleteItineraryItem(itemId: string): Promise<boolean> {
    return this.items.delete(itemId);
  }

  // --- PREFERENCES ---
  async getPreferenceProfile(userId: string): Promise<PreferenceProfile> {
    const existing = this.preferences.get(userId) || this.preferences.get('default-user-id');
    if (existing) return existing;

    const defaultProfile: PreferenceProfile = {
      user_id: userId,
      pace: 'relaxed',
      walking_preference: 'moderate',
      rest_frequency: 'frequent',
      activity_density: 'low',
      transport_preference: 'taxi_private',
      day_start_preference: 'relaxed_morning',
      interests: ['Budaya', 'Taman'],
      food_preferences: ['halal'],
      shopping_preference: 'moderate',
      culture_preference: 'high',
      nature_preference: 'high',
      updated_at: new Date().toISOString(),
    };
    this.preferences.set(userId, defaultProfile);
    return defaultProfile;
  }

  async updatePreferenceProfile(userId: string, updates: Partial<PreferenceProfile>): Promise<PreferenceProfile> {
    const current = await this.getPreferenceProfile(userId);
    const updated: PreferenceProfile = {
      ...current,
      ...updates,
      user_id: userId,
      updated_at: new Date().toISOString(),
    };
    this.preferences.set(userId, updated);
    return updated;
  }

  // --- BUDGET (M4) ---
  async getBudgetSummary(tripId: string): Promise<BudgetSummary> {
    const items = Array.from(this.budgetItems.values()).filter((b) => b.trip_id === tripId);
    const trip = this.trips.get(tripId);
    const base_currency = trip?.base_currency || 'IDR';

    const total_planned = items.reduce((sum, item) => sum + (item.planned_amount || 0), 0);
    const total_actual = items.reduce((sum, item) => sum + (item.actual_amount || 0), 0);

    return {
      trip_id: tripId,
      base_currency,
      total_planned,
      total_actual,
      items,
    };
  }

  async addBudgetItem(itemInput: Omit<BudgetItem, 'id'> & { id?: string }): Promise<BudgetItem> {
    const id = itemInput.id || `budget-${Date.now()}`;
    const item: BudgetItem = { ...itemInput, id };
    this.budgetItems.set(id, item);
    return item;
  }

  async updateBudgetItem(itemId: string, updates: Partial<BudgetItem>): Promise<BudgetItem | null> {
    const existing = this.budgetItems.get(itemId);
    if (!existing) return null;

    const updated: BudgetItem = {
      ...existing,
      ...updates,
      id: existing.id,
      trip_id: existing.trip_id,
    };
    this.budgetItems.set(itemId, updated);
    return updated;
  }

  async deleteBudgetItem(itemId: string): Promise<boolean> {
    return this.budgetItems.delete(itemId);
  }

  // --- CHECKLIST (M4) ---
  async getChecklist(tripId: string): Promise<Checklist> {
    let checklist = this.checklists.get(`check-${tripId}`);
    if (!checklist) {
      checklist = {
        id: `check-${tripId}`,
        trip_id: tripId,
        title: 'Daftar Perlengkapan & Kesiapan Perjalanan',
        items: [
          { id: `c-${Date.now()}-1`, text: 'Paspor Asli & Dokumen Imigrasi', is_completed: false, category: 'Dokumen' },
          { id: `c-${Date.now()}-2`, text: 'Obat-obatan Pribadi & Vitamin', is_completed: false, category: 'Kesehatan' },
          { id: `c-${Date.now()}-3`, text: 'Pakaian Nyaman & Sepatu Jalan Empuk', is_completed: false, category: 'Pakaian' },
        ],
      };
      this.checklists.set(checklist.id, checklist);
    }
    return checklist;
  }

  async addChecklistItem(tripId: string, itemInput: Omit<ChecklistItem, 'id'> & { id?: string }): Promise<ChecklistItem> {
    const checklist = await this.getChecklist(tripId);
    const id = itemInput.id || `item-${Date.now()}`;
    const newItem: ChecklistItem = { ...itemInput, id };

    checklist.items.push(newItem);
    this.checklists.set(checklist.id, checklist);
    return newItem;
  }

  async toggleChecklistItem(arg1?: string, arg2?: string): Promise<ChecklistItem | null> {
    if (!arg1 && !arg2) return null;

    const allChecklists = Array.from(this.checklists.values());
    for (const checklist of allChecklists) {
      const item = checklist.items.find((i: ChecklistItem) => i.id === arg1 || (arg2 && i.id === arg2));
      if (item) {
        item.is_completed = !item.is_completed;
        this.checklists.set(checklist.id, checklist);
        return item;
      }
    }
    return null;
  }

  async deleteChecklistItem(arg1?: string, arg2?: string): Promise<boolean> {
    if (!arg1 && !arg2) return false;

    const allChecklists = Array.from(this.checklists.values());
    for (const checklist of allChecklists) {
      const initialLen = checklist.items.length;
      checklist.items = checklist.items.filter((i: ChecklistItem) => i.id !== arg1 && (!arg2 || i.id !== arg2));
      if (checklist.items.length < initialLen) {
        this.checklists.set(checklist.id, checklist);
        return true;
      }
    }
    return false;
  }

  // --- MEMORIES (M5) ---
  async listMemories(tripId: string): Promise<Memory[]> {
    return Array.from(this.memories.values())
      .filter((m) => m.trip_id === tripId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  async getAllMemories(): Promise<Memory[]> {
    return Array.from(this.memories.values()).sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }

  async createMemory(memoryInput: Omit<Memory, 'id' | 'created_at' | 'updated_at'> & { id?: string }): Promise<Memory> {
    const id = memoryInput.id || `mem-${Date.now()}`;
    const newMemory: Memory = {
      ...memoryInput,
      id,
      media: memoryInput.media || [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    this.memories.set(id, newMemory);
    return newMemory;
  }

  async updateMemory(memoryId: string, updates: Partial<Memory>): Promise<Memory | null> {
    const existing = this.memories.get(memoryId);
    if (!existing) return null;

    const updated: Memory = {
      ...existing,
      ...updates,
      id: existing.id,
      trip_id: existing.trip_id,
      updated_at: new Date().toISOString(),
    };
    this.memories.set(memoryId, updated);
    return updated;
  }

  async deleteMemory(memoryId: string): Promise<boolean> {
    return this.memories.delete(memoryId);
  }

  async toggleMemoryFavorite(memoryId: string): Promise<Memory | null> {
    const existing = this.memories.get(memoryId);
    if (!existing) return null;

    existing.is_favorite = !existing.is_favorite;
    existing.updated_at = new Date().toISOString();
    this.memories.set(memoryId, existing);
    return existing;
  }
}

// Singleton repository instance
export const tripRepository: ITripRepository = new MemoryTripRepository();
