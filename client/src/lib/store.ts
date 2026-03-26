import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from './api';

export type BookingType = 'flight' | 'hotel' | 'car';
export type BookingStatus = 'confirmed' | 'pending' | 'in-review' | 'cancelled';
export type UserRole = 'client' | 'admin';

export interface User {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  phone?: string;
  company?: string;
  avatar?: string;
}

export interface Booking {
  id: string;
  type: BookingType;
  name?: string;
  route?: string;
  property?: string;
  dates: {
    start: string;
    end: string;
  };
  price: number;
  status: BookingStatus;
  tripId?: string;
  notes?: string;
  userId?: string;
}

export interface Trip {
  id: string;
  destination: string;
  startDate: string;
  endDate: string;
  nights: number;
  bookingIds: string[];
  userId?: string;
}

// ... other types from original file (Expense, TravelerProfile) ...
export interface Expense {
  id: string;
  tripId?: string;
  category: string;
  amount: number;
  date: string;
  description: string;
  userId?: string;
}

export interface TravelerProfile {
  id: string;
  name: string;
  email: string;
  passportNumber?: string;
  seatPreference?: string;
  loyaltyNumbers?: Record<string, string>;
  userId?: string;
}

export interface UserSettings {
  companyName: string;
  currency: string;
  budgetThreshold: number;
  notifications: {
    bookingConfirmations: boolean;
    approvalRequests: boolean;
    budgetAlerts: boolean;
    tripReminders: boolean;
    emailNotifications: boolean;
    weeklySummary: boolean;
    marketingEmails: boolean;
  };
  theme: 'dark' | 'light';
}

interface WayfarerStore {
  // Auth state
  user: User | null;
  isAuthenticated: boolean;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (fullName: string, email: string, password: string, role: string) => Promise<void>;
  logout: () => void;
  updateProfile: (updates: Partial<User>) => void;

  // Settings
  settings: UserSettings;
  updateSettings: (updates: Partial<UserSettings>) => void;
  updateNotificationSettings: (key: string, value: boolean) => void;

  // Data state
  bookings: Booking[];
  trips: Trip[];
  expenses: Expense[];
  travelers: TravelerProfile[];
  approvalHistory: any[];
  
  // Data Fetching
  fetchData: () => Promise<void>;

  // Booking CRUD
  addBooking: (booking: Partial<Booking>) => Promise<void>;
  updateBooking: (id: string, updates: Partial<Booking>) => Promise<void>;
  deleteBooking: (id: string) => Promise<void>;

  // Trip CRUD
  addTrip: (trip: Partial<Trip>) => Promise<void>;
  updateTrip: (id: string, updates: Partial<Trip>) => Promise<void>;
  deleteTrip: (id: string) => Promise<void>;

  // Expense CRUD
  addExpense: (expense: Partial<Expense>) => Promise<void>;
  updateExpense: (id: string, updates: Partial<Expense>) => Promise<void>;
  deleteExpense: (id: string) => Promise<void>;

  // Traveler CRUD
  addTraveler: (traveler: Partial<TravelerProfile>) => Promise<void>;
  updateTraveler: (id: string, updates: Partial<TravelerProfile>) => Promise<void>;
  deleteTraveler: (id: string) => Promise<void>;

  // Approval actions (Admin)
  approveBooking: (bookingId: string, _comment: string) => Promise<void>;
  rejectBooking: (bookingId: string, _comment: string) => Promise<void>;
}

const defaultSettings: UserSettings = {
  companyName: 'Acme Travel Inc.',
  currency: 'USD ($)',
  budgetThreshold: 10000,
  notifications: {
    bookingConfirmations: true,
    approvalRequests: true,
    budgetAlerts: true,
    tripReminders: false,
    emailNotifications: true,
    weeklySummary: true,
    marketingEmails: false,
  },
  theme: 'light',
};

export const useWayfarerStore = create<WayfarerStore>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      token: localStorage.getItem('wayfarer_token'),

      // Settings
      settings: defaultSettings,
      updateSettings: (updates) => set((state) => ({ settings: { ...state.settings, ...updates } })),
      updateNotificationSettings: (key, value) => set((state) => ({
        settings: { ...state.settings, notifications: { ...state.settings.notifications, [key]: value } }
      })),

      // Auth
      login: async (email, password) => {
        const { data } = await api.post('/auth/login', { email, password });
        localStorage.setItem('wayfarer_token', data.token);
        set({ user: data.user, isAuthenticated: true, token: data.token });
        await get().fetchData();
      },

      register: async (fullName, email, password, role) => {
        const { data } = await api.post('/auth/register', { full_name: fullName, email, password, role });
        localStorage.setItem('wayfarer_token', data.token);
        set({ user: data.user, isAuthenticated: true, token: data.token });
        await get().fetchData();
      },

      logout: () => {
        localStorage.removeItem('wayfarer_token');
        set({ user: null, isAuthenticated: false, token: null, bookings: [], trips: [], travelers: [], expenses: [] });
      },

      updateProfile: (updates) => set((state) => ({
        user: state.user ? { ...state.user, ...updates } : null
      })),

      // Data
      bookings: [],
      trips: [],
      expenses: [],
      travelers: [],
      approvalHistory: [],

      fetchData: async () => {
        try {
          const [bookingsRes, tripsRes, expensesRes, travelersRes] = await Promise.all([
            api.get('/bookings'),
            api.get('/trips'),
            api.get('/expenses'),
            api.get('/travelers'),
          ]);
          set({ 
            bookings: bookingsRes.data.map((b: any) => ({
                ...b,
                userId: b.user_id,
                tripId: b.trip_id,
                dates: { start: b.start_date, end: b.end_date },
                price: Number(b.price)
            })), 
            trips: tripsRes.data.map((t: any) => ({
                ...t,
                userId: t.user_id,
                startDate: t.start_date,
                endDate: t.end_date,
                bookingIds: [] // Recomputed if needed
            })),
            expenses: expensesRes.data.map((e: any) => ({
                ...e,
                userId: e.user_id,
                tripId: e.trip_id,
                amount: Number(e.amount)
            })),
            travelers: travelersRes.data.map((t: any) => ({
                ...t,
                userId: t.user_id,
                passportNumber: t.passport_number,
                seatPreference: t.seat_preference,
                loyaltyNumbers: typeof t.loyalty_numbers === 'string' ? JSON.parse(t.loyalty_numbers) : t.loyalty_numbers
            }))
          });
        } catch (err) {
          console.error("Fetch Data Error:", err);
        }
      },

      // Booking CRUD
      addBooking: async (booking) => {
        const payload = {
            ...booking,
            startDate: (booking as any).dates.start,
            endDate: (booking as any).dates.end
        };
        await api.post('/bookings', payload);
        await get().fetchData();
      },

      updateBooking: async (id, updates) => {
        await api.patch(`/bookings/${id}`, updates);
        await get().fetchData();
      },

      deleteBooking: async (id) => {
        await api.delete(`/bookings/${id}`);
        await get().fetchData();
      },

      // Trip CRUD
      addTrip: async (trip) => {
        const payload = {
            ...trip,
            startDate: trip.startDate,
            endDate: trip.endDate
        };
        await api.post('/trips', payload);
        await get().fetchData();
      },

      updateTrip: async (id, updates) => {
        await api.patch(`/trips/${id}`, updates);
        await get().fetchData();
      },

      deleteTrip: async (id) => {
        await api.delete(`/trips/${id}`);
        await get().fetchData();
      },

      // Expense CRUD
      addExpense: async (expense) => {
        await api.post('/expenses', expense);
        await get().fetchData();
      },

      updateExpense: async (id, updates) => {
        await api.patch(`/expenses/${id}`, updates);
        await get().fetchData();
      },

      deleteExpense: async (id) => {
        await api.delete(`/expenses/${id}`);
        await get().fetchData();
      },

      // Traveler CRUD
      addTraveler: async (traveler) => {
        await api.post('/travelers', traveler);
        await get().fetchData();
      },

      updateTraveler: async (id, updates) => {
        await api.patch(`/travelers/${id}`, updates);
        await get().fetchData();
      },

      deleteTraveler: async (id) => {
        await api.delete(`/travelers/${id}`);
        await get().fetchData();
      },

      // Approval actions (Admin)
      approveBooking: async (bookingId, _comment) => {
        await api.patch(`/bookings/${bookingId}`, { status: 'confirmed' });
        await get().fetchData();
      },

      rejectBooking: async (bookingId, _comment) => {
        await api.patch(`/bookings/${bookingId}`, { status: 'cancelled' });
        await get().fetchData();
      },
    }),
    {
      name: 'wayfarer-storage',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        settings: state.settings,
      }),
    }
  )
);

