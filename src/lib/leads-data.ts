import { Lead } from '@/types';
import { INITIAL_20_CARS } from './cars-data';

export type LeadWithCar = Lead & {
  cars?: {
    id: string;
    make: string;
    model: string;
    year: number;
    price: number;
    images?: string[];
  } | null;
};

export const INITIAL_LEADS: LeadWithCar[] = [
  {
    id: 'lead-01',
    customer_name: 'Rahul Sharma',
    customer_phone: '9876543210',
    customer_email: 'rahul.sharma@gmail.com',
    car_id: 'car-01-alto',
    message: 'Booked doorstep test drive for Maruti Suzuki Alto 800 LXi',
    preferred_date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    source: 'web_form',
    status: 'test_drive_booked',
    assigned_to: null,
    notes: 'Customer requested weekend morning test drive slot',
    created_at: new Date(Date.now() - 3600000).toISOString(),
    updated_at: new Date(Date.now() - 3600000).toISOString(),
    cars: {
      id: 'car-01-alto',
      make: 'Maruti Suzuki',
      model: 'Alto 800 LXi',
      year: 2018,
      price: 210000,
      images: ['https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&w=1000&q=80'],
    },
  },
  {
    id: 'lead-02',
    customer_name: 'Pooja Verma',
    customer_phone: '9812345678',
    customer_email: 'pooja.verma@outlook.com',
    car_id: 'car-06-nexon',
    message: 'Booked Tata Nexon EV home demo via AutoAssist AI concierge',
    preferred_date: new Date(Date.now() + 172800000).toISOString().split('T')[0],
    source: 'chatbot',
    status: 'new',
    assigned_to: null,
    notes: 'Inquired about home fast charging installation',
    created_at: new Date(Date.now() - 7200000).toISOString(),
    updated_at: new Date(Date.now() - 7200000).toISOString(),
    cars: {
      id: 'car-06-nexon',
      make: 'Tata',
      model: 'Nexon EV Prime XZ Plus',
      year: 2022,
      price: 1180000,
      images: ['https://images.unsplash.com/photo-1590362891988-f77804f3747b?auto=format&fit=crop&w=1000&q=80'],
    },
  },
  {
    id: 'lead-03',
    customer_name: 'Amitabh Sen',
    customer_phone: '9988776655',
    customer_email: 'amitabh.sen@yahoo.com',
    car_id: 'car-10-city',
    message: 'Test drive inquiry for Honda City VX CVT Automatic',
    preferred_date: new Date(Date.now() + 259200000).toISOString().split('T')[0],
    source: 'web_form',
    status: 'contacted',
    assigned_to: null,
    notes: 'Interested in exchange value for 2014 Swift',
    created_at: new Date(Date.now() - 86400000).toISOString(),
    updated_at: new Date(Date.now() - 86400000).toISOString(),
    cars: {
      id: 'car-10-city',
      make: 'Honda',
      model: 'City VX CVT Automatic',
      year: 2021,
      price: 1045000,
      images: ['https://images.unsplash.com/photo-1590362891988-f77804f3747b?auto=format&fit=crop&w=1000&q=80'],
    },
  },
];

// Persistent across requests in Node server memory
export const inMemoryLeads: LeadWithCar[] = [...INITIAL_LEADS];
