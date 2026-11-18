import { streamText, tool } from 'ai';
import { google } from '@ai-sdk/google';
import { openai } from '@ai-sdk/openai';
import { z } from 'zod';
import { createAdminClient } from '@/lib/supabase/admin';
import { DEALERSHIP_CONFIG } from '@/lib/dealership-config';
import { INITIAL_20_CARS } from '@/lib/cars-data';

export const maxDuration = 30;

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const FALLBACK_IMG = 'https://images.unsplash.com/photo-1590362891988-f77804f3747b?w=600';

// PostgREST .or()/.ilike filter ke liye special characters hatao
const sanitize = (s: string) => s.replace(/[,()%*\\]/g, ' ').trim();

const formatCar = (car: any) => ({
  id: car.id,
  title: `${car.year} ${car.make} ${car.model}`,
  price: car.price,
  mileage: `${Number(car.mileage ?? 0).toLocaleString('en-IN')} km`,
  fuel: car.fuel_type,
  transmission: car.transmission,
  image: car.images?.[0] || FALLBACK_IMG,
});

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    if (!Array.isArray(messages) || messages.length === 0) {
      return new Response(JSON.stringify({ error: 'messages required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const provider = process.env.AI_PROVIDER || 'google';
    const hasGoogleKey = Boolean(process.env.GOOGLE_GENERATIVE_AI_API_KEY || process.env.GOOGLE_API_KEY);
    const hasOpenAIKey = Boolean(process.env.OPENAI_API_KEY);

    // Key nahi hai to 401 -> client fallback assistant chalega
    if (!hasGoogleKey && !hasOpenAIKey) {
      return new Response(
        JSON.stringify({
          error: 'AI Provider key not configured. Add GOOGLE_GENERATIVE_AI_API_KEY or OPENAI_API_KEY to .env.local',
        }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Provider choice: preferred available ho to wahi, warna jo key available ho
    const useOpenAI = (provider === 'openai' && hasOpenAIKey) || (!hasGoogleKey && hasOpenAIKey);
    const model = useOpenAI
      ? openai(process.env.OPENAI_MODEL || 'gpt-4o-mini')
      : google(process.env.GOOGLE_MODEL || 'gemini-3.8-flash');

    const result = streamText({
      model,
      maxSteps: 5,
      system: `You are 'AutoAssist AI', the dedicated sales concierge for SmartCar Pre-Owned.
Official Contact Information:
- Phone / WhatsApp: ${DEALERSHIP_CONFIG.primaryPhone}
- Email: ${DEALERSHIP_CONFIG.salesEmail}
- Showroom Address: ${DEALERSHIP_CONFIG.address}
- Working Hours: ${DEALERSHIP_CONFIG.workingHours}

Your duties:
1. Help buyers search inventory using 'searchAvailableCars'.
2. Provide car specifications and prices using 'getCarDetails'.
3. Offer free doorstep test drives across Agra and Uttar Pradesh.
4. When the user requests a callback or test drive, ask for their name and phone number if missing, then use 'captureCustomerLead'. Never call it without both name and phone.
5. Only mention cars returned by tools. Never invent cars, prices, or specs. If nothing matches, say so and suggest adjusting budget/filters.
6. If a tool returns status 'error', tell the customer honestly and give the showroom phone number.
7. Be polite, professional, and concise. Reply in English or Hindi/Hinglish, matching the customer.`,
      messages,
      tools: {
        searchAvailableCars: tool({
          description: 'Search dealership inventory for available cars by make, fuel type, budget limit, or transmission.',
          parameters: z.object({
            make: z.string().optional().describe('Manufacturer: Honda, Hyundai, Tata, Toyota, Mahindra, Maruti Suzuki, Renault'),
            fuel_type: z.enum(['petrol', 'diesel', 'electric', 'hybrid', 'cng']).optional(),
            transmission: z.enum(['automatic', 'manual']).optional(),
            max_price: z.number().optional().describe('Maximum budget in INR (e.g. 1500000 for 15 Lakhs)'),
            min_year: z.number().optional().describe('Minimum manufacturing year, e.g. 2018'),
            query: z.string().optional().describe('Car model name or free text query'),
          }),
          execute: async ({ make, fuel_type, transmission, max_price, min_year, query }) => {
            try {
              const supabase = createAdminClient();
              let q = supabase
                .from('cars')
                .select('id, make, model, year, price, mileage, fuel_type, transmission, condition, images, features, status')
                .eq('status', 'available');

              if (make) q = q.ilike('make', `%${sanitize(make)}%`);
              if (fuel_type) q = q.eq('fuel_type', fuel_type);
              if (transmission) q = q.eq('transmission', transmission);
              if (max_price) q = q.lte('price', max_price);
              if (min_year) q = q.gte('year', min_year);
              if (query) {
                const s = sanitize(query);
                if (s) q = q.or(`model.ilike.%${s}%,make.ilike.%${s}%`);
              }

              const { data, error } = await q.order('price', { ascending: true }).limit(6);
              if (error) throw error;

              // DB sahi chala: 0 results bhi valid answer hai, local data mat dikhao
              return { status: 'success', count: data?.length ?? 0, cars: (data ?? []).map(formatCar) };
            } catch (err) {
              console.warn('Supabase inventory search failed, using local showroom data:', err);
            }

            // Fallback sirf DB error par
            let filtered = INITIAL_20_CARS.filter((c) => c.status === 'available');
            if (make) filtered = filtered.filter((c) => c.make.toLowerCase().includes(make.toLowerCase()));
            if (fuel_type) filtered = filtered.filter((c) => c.fuel_type === fuel_type);
            if (transmission) filtered = filtered.filter((c) => c.transmission === transmission);
            if (max_price) filtered = filtered.filter((c) => c.price <= max_price);
            if (min_year) filtered = filtered.filter((c) => c.year >= min_year);
            if (query) {
              const s = query.toLowerCase();
              filtered = filtered.filter((c) => c.make.toLowerCase().includes(s) || c.model.toLowerCase().includes(s));
            }
            filtered.sort((a, b) => a.price - b.price);
            const results = filtered.slice(0, 6);
            return { status: 'success', count: results.length, cars: results.map(formatCar) };
          },
        }),

        getCarDetails: tool({
          description: 'Get comprehensive technical specs for a specific car by ID or name.',
          parameters: z.object({
            car_id: z.string().describe('The ID (UUID) or name of the car'),
          }),
          execute: async ({ car_id }) => {
            try {
              const supabase = createAdminClient();

              if (UUID_RE.test(car_id)) {
                const { data, error } = await supabase.from('cars').select('*').eq('id', car_id).maybeSingle();
                if (error) throw error;
                if (data) return { status: 'success', car: data };
              } else {
                const s = sanitize(car_id);
                const { data, error } = await supabase
                  .from('cars')
                  .select('*')
                  .eq('status', 'available')
                  .or(`model.ilike.%${s}%,make.ilike.%${s}%`)
                  .limit(1);
                if (error) throw error;
                if (data && data.length > 0) return { status: 'success', car: data[0] };
              }
            } catch (err) {
              console.warn('Supabase car detail fetch error:', err);
            }

            const needle = car_id.toLowerCase();
            const localCar = INITIAL_20_CARS.find(
              (c) => c.id === car_id || `${c.year} ${c.make} ${c.model}`.toLowerCase().includes(needle)
            );
            if (localCar) return { status: 'success', car: localCar };
            return { status: 'error', message: 'Car details not found.' };
          },
        }),

        captureCustomerLead: tool({
          description: 'Captures customer contact details and saves a lead into the CRM for test drives, callbacks, or inquiries. Requires name and phone.',
          parameters: z.object({
            customer_name: z.string().min(2).describe('Customer full name'),
            customer_phone: z.string().describe('Customer 10-digit Indian phone/WhatsApp number'),
            customer_email: z.string().optional().describe('Customer email address'),
            car_id: z.string().optional().describe('UUID or name of the car they are interested in'),
            preferred_date: z.string().optional().describe('Desired test drive date (YYYY-MM-DD)'),
            message: z.string().optional().describe('Notes or query details'),
          }),
          execute: async ({ customer_name, customer_phone, customer_email, car_id, preferred_date, message }) => {
            // Phone validate (Indian mobile, optional +91/0 prefix)
            const digits = customer_phone.replace(/\D/g, '').replace(/^(91|0)(?=\d{10}$)/, '');
            if (!/^[6-9]\d{9}$/.test(digits)) {
              return {
                status: 'error',
                message: 'Invalid phone number. Ask the customer for a valid 10-digit mobile number.',
              };
            }

            const isUUID = Boolean(car_id && UUID_RE.test(car_id));
            const notes =
              car_id && !isUUID
                ? `Interested car: ${car_id}. ${message || ''}`.trim()
                : message || 'Expressed interest via AutoAssist AI';

            const leadData = {
              customer_name: customer_name.trim(),
              customer_phone: digits,
              customer_email: customer_email || null,
              car_id: isUUID ? car_id : null,
              preferred_date: preferred_date || null,
              message: notes,
              source: 'chatbot' as const,
              status: 'new' as const,
            };

            try {
              const supabase = createAdminClient();
              const { data, error } = await (supabase.from('leads') as any).insert(leadData).select('id').single();
              if (error) throw error;

              return {
                status: 'success',
                lead_id: data.id,
                confirmation: `Lead recorded for ${customer_name}. Our showroom team will reach out at ${digits}.`,
              };
            } catch (err) {
              const { inMemoryLeads } = await import('@/lib/leads-data');
              const matchedCar = car_id
                ? INITIAL_20_CARS.find(
                  (c) =>
                    c.id === car_id ||
                    `${c.year} ${c.make} ${c.model}`.toLowerCase().includes(car_id.toLowerCase())
                )
                : null;

              const fallbackId = `lead-${Date.now()}`;
              inMemoryLeads.unshift({
                id: fallbackId,
                customer_name: customer_name.trim(),
                customer_phone: digits,
                customer_email: customer_email || null,
                car_id: matchedCar?.id ?? (isUUID && car_id ? car_id : null),
                preferred_date: preferred_date || null,
                message: notes,
                source: 'chatbot',
                status: 'new',
                assigned_to: null,
                notes: 'Captured via AutoAssist AI concierge',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                cars: matchedCar
                  ? {
                    id: matchedCar.id,
                    make: matchedCar.make,
                    model: matchedCar.model,
                    year: matchedCar.year,
                    price: matchedCar.price,
                    images: matchedCar.images,
                  }
                  : null,
              });

              return {
                status: 'success',
                lead_id: fallbackId,
                confirmation: `Lead recorded for ${customer_name}. Our showroom team will reach out at ${digits}.`,
              };
            }
          },
        }),
      },
    });

    return result.toDataStreamResponse();
  } catch (error: any) {
    console.error('Chat route error:', error);
    return new Response(JSON.stringify({ error: error?.message || 'Internal error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}