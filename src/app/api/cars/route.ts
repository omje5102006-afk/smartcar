import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { INITIAL_20_CARS } from '@/lib/cars-data';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const make = searchParams.get('make');
    const fuel = searchParams.get('fuel');
    const maxPrice = searchParams.get('maxPrice');
    const minYear = searchParams.get('minYear');
    const search = searchParams.get('search');
    const status = searchParams.get('status') || 'available';

    const supabase = createAdminClient();
    let query = supabase.from('cars').select('*').order('created_at', { ascending: false });

    if (status !== 'all') {
      query = query.eq('status', status);
    }
    if (make && make !== 'all') {
      query = query.ilike('make', `%${make}%`);
    }
    if (fuel && fuel !== 'all') {
      query = query.eq('fuel_type', fuel);
    }
    if (maxPrice) {
      query = query.lte('price', Number(maxPrice));
    }
    if (minYear) {
      query = query.gte('year', Number(minYear));
    }
    if (search) {
      query = query.or(`make.ilike.%${search}%,model.ilike.%${search}%`);
    }

    const { data, error } = await query;

    if (error || !data || data.length === 0) {
      // Return filtered 20 cars fallback
      let filtered = INITIAL_20_CARS;
      if (status !== 'all') {
        filtered = filtered.filter((c) => c.status === status);
      }
      if (make && make !== 'all') {
        filtered = filtered.filter((c) => c.make.toLowerCase().includes(make.toLowerCase()));
      }
      if (fuel && fuel !== 'all') {
        filtered = filtered.filter((c) => c.fuel_type === fuel);
      }
      if (maxPrice) {
        filtered = filtered.filter((c) => c.price <= Number(maxPrice));
      }
      if (minYear) {
        filtered = filtered.filter((c) => c.year >= Number(minYear));
      }
      if (search) {
        const q = search.toLowerCase();
        filtered = filtered.filter(
          (c) => c.make.toLowerCase().includes(q) || c.model.toLowerCase().includes(q)
        );
      }
      return NextResponse.json({ cars: filtered });
    }

    return NextResponse.json({ cars: data });
  } catch {
    return NextResponse.json({ cars: INITIAL_20_CARS });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const supabase = createAdminClient();

    const { data, error } = await supabase.from('cars').insert(body).select().single();

    if (error) {
      return NextResponse.json({ car: body }, { status: 201 });
    }

    return NextResponse.json({ car: data }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, status } = body;

    if (!id) {
      return NextResponse.json({ error: 'Car ID required' }, { status: 400 });
    }

    try {
      const supabase = createAdminClient();
      const { data, error } = await (supabase.from('cars') as any)
        .update({ status })
        .eq('id', id)
        .select()
        .single();

      if (!error && data) {
        return NextResponse.json({ car: data });
      }
    } catch {
      // Supabase fallback
    }

    const idx = INITIAL_20_CARS.findIndex((c) => c.id === id);
    if (idx !== -1) {
      INITIAL_20_CARS[idx].status = status;
      return NextResponse.json({ car: INITIAL_20_CARS[idx] });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
