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
  clientName?: string;  // populated for admin view
  clientEmail?: string;
  adminComment?: string;
  statusUpdatedAt?: string;
  created_at?: string;
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

interface TravelStore {
  // Auth state
  user: User | null;
  isAuthenticated: boolean;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (fullName: string, email: string, password: string, role: string, securityQuestion?: string, securityAnswer?: string) => Promise<void>;
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

  // Sync
  startPolling: () => void;
  stopPolling: () => void;
  _pollInterval: ReturnType<typeof setInterval> | null;
}

const defaultSettings: UserSettings = {
  companyName: 'Acme Travel Inc.',
  currency: 'USD',
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

export const useTravelStore = create<TravelStore>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      token: localStorage.getItem('travel_token'),

      // Settings
      settings: defaultSettings,
      updateSettings: (updates) => set((state) => ({ settings: { ...state.settings, ...updates } })),
      updateNotificationSettings: (key, value) => set((state) => ({
        settings: { ...state.settings, notifications: { ...state.settings.notifications, [key]: value } }
      })),

      // Auth
      login: async (email, password) => {
        const { data } = await api.post('/auth/login', { email, password });
        localStorage.setItem('travel_token', data.token);
        set({ user: data.user, isAuthenticated: true, token: data.token });
        await get().fetchData();
      },

      register: async (fullName, email, password, role, securityQuestion, securityAnswer) => {
        const payload: any = { full_name: fullName, email, password, role };
        if (securityQuestion && securityAnswer) {
            payload.security_question = securityQuestion;
            payload.security_answer = securityAnswer;
        }
        const { data } = await api.post('/auth/register', payload);
        localStorage.setItem('travel_token', data.token);
        set({ user: data.user, isAuthenticated: true, token: data.token });
        await get().fetchData();
      },

      logout: () => {
        localStorage.removeItem('travel_token');
        set({ user: null, isAuthenticated: false, token: null, bookings: [], trips: [], travelers: [], expenses: [] });
      },

      updateProfile: async (updates) => {
        const { data } = await api.patch('/auth/profile', updates);
        set({ user: data });
        return data;
      },

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
          const mappedBookings = bookingsRes.data.map((b: any) => ({
                ...b,
                userId: b.user_id,
                tripId: b.trip_id,
                dates: { start: b.start_date, end: b.end_date },
                price: Number(b.price),
                clientName: b.user?.full_name,
                clientEmail: b.user?.email,
                adminComment: b.admin_comment,
                statusUpdatedAt: b.status_updated_at,
          }));

          const mappedTrips = tripsRes.data.map((t: any) => ({
                ...t,
                userId: t.user_id,
                startDate: t.start_date,
                endDate: t.end_date,
                bookingIds: mappedBookings.filter((b: any) => b.tripId === t.id).map((b: any) => b.id)
          }));

          const history = mappedBookings
            .filter((b: any) => (b.status === 'confirmed' || b.status === 'cancelled') && b.statusUpdatedAt)
            .map((b: any) => ({
                id: b.id,
                bookingId: b.id,
                timestamp: b.statusUpdatedAt,
                action: b.status === 'confirmed' ? 'approved' : 'rejected',
                adminName: 'TRAVEL Administrator', // Simplified
                comment: b.adminComment
            }));

          set({ 
            bookings: mappedBookings, 
            trips: mappedTrips,
            approvalHistory: history,
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
        try {
          const payload = {
              ...booking,
              startDate: (booking as any).dates.start,
              endDate: (booking as any).dates.end
          };
          await api.post('/bookings', payload);
          await get().fetchData();
        } catch (err: any) {
          console.error('[addBooking] ERROR:', err.response?.data || err.message);
          throw err;
        }
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
      approveBooking: async (bookingId, comment) => {
        await api.patch(`/bookings/${bookingId}`, { status: 'confirmed', admin_comment: comment });
        await get().fetchData();
      },

      rejectBooking: async (bookingId, comment) => {
        await api.patch(`/bookings/${bookingId}`, { status: 'cancelled', admin_comment: comment });
        await get().fetchData();
      },

      // Polling — keeps admin & client in sync every 30s
      _pollInterval: null,

      startPolling: () => {
        if (get()._pollInterval) return; // already running
        const interval = setInterval(async () => {
          if (get().isAuthenticated) {
            await get().fetchData();
          }
        }, 30000);
        set({ _pollInterval: interval });
      },

      stopPolling: () => {
        const interval = get()._pollInterval;
        if (interval) {
          clearInterval(interval);
          set({ _pollInterval: null });
        }
      },
    }),
    {
      name: 'travel-storage',
      partialize: (state) => ({
        user: import.meta.env.DEV ? null : state.user,
        isAuthenticated: import.meta.env.DEV ? false : state.isAuthenticated,
        settings: state.settings,
      }),
    }
  )
);

