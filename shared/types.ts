export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'STAFF' | 'CUSTOMER';
  phone?: string;
  loyaltyPoints?: number;
  visitCount?: number;
  skinToneInfo?: {
    skinType: string;
    concerns: string[];
    notes: string;
  };
}

export interface Service {
  _id: string;
  name: string;
  description: string;
  category: string;
  duration: number;
  price: number;
  isPackage: boolean;
  packageName?: string;
  isActive: boolean;
}

export interface Appointment {
  _id: string;
  customer: string | User;
  staff?: string | User;
  service: string | Service;
  appointmentDate: string;
  timeSlot: string;
  status: 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED' | 'NOSHOW';
  notes?: string;
}
