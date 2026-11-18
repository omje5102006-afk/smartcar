import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { LeadUpdate } from '@/types';
import { inMemoryLeads, LeadWithCar } from '@/lib/leads-data';
import { INITIAL_20_CARS } from '@/lib/cars-data';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    try {
      const supabase = createAdminClient();
      let query = supabase
        .from('leads')
        .select('*, cars(id, make, model, year, price, images)')
        .order('created_at', { ascending: false });

      if (status && status !== 'all') {
        query = query.eq('status', status);
      }

      const { data, error } = await query;

      if (!error && data && data.length > 0) {
        return NextResponse.json({ leads: data });
      }
    } catch {
      // Supabase unavailable, use fallback
    }

    let filtered = inMemoryLeads;
    if (status && status !== 'all') {
      filtered = filtered.filter((l) => l.status === status);
    }

    return NextResponse.json({ leads: filtered });
  } catch (err: any) {
    return NextResponse.json({ leads: inMemoryLeads, error: err.message }, { status: 200 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // 1. Try Supabase first
    try {
      const supabase = createAdminClient();
      const { data, error } = await supabase
        .from('leads')
        .insert({
          ...body,
          source: body.source || 'web_form',
          status: 'new',
        })
        .select('*, cars(id, make, model, year, price, images)')
        .single();

      if (!error && data) {
        return NextResponse.json({ lead: data }, { status: 201 });
      }
    } catch {
      // Supabase fallback
    }

    // 2. In-memory fallback
    const matchedCar = body.car_id ? INITIAL_20_CARS.find((c) => c.id === body.car_id) : null;
    const newLead: LeadWithCar = {
      id: `lead-${Date.now()}`,
      customer_name: body.customer_name || 'Customer',
      customer_phone: body.customer_phone,
      customer_email: body.customer_email || null,
      car_id: body.car_id || null,
      message: body.message || 'Customer requested car booking / test drive',
      preferred_date: body.preferred_date || null,
      source: body.source || 'web_form',
      status: 'new',
      assigned_to: null,
      notes: body.notes || 'Inquiry captured via web application',
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
    };

    inMemoryLeads.unshift(newLead);
    return NextResponse.json({ lead: newLead }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, status, notes } = body;

    if (!id) {
      return NextResponse.json({ error: 'Lead ID required' }, { status: 400 });
    }

    try {
      const supabase = createAdminClient();
      const updateData: LeadUpdate = {};
      if (status) updateData.status = status;
      if (notes !== undefined) updateData.notes = notes;

      const { data, error } = await (supabase
        .from('leads') as any)
        .update(updateData)
        .eq('id', id)
        .select('*, cars(id, make, model, year, price, images)')
        .single();

      if (!error && data) {
        return NextResponse.json({ lead: data });
      }
    } catch {
      // Supabase fallback
    }

    // Update in-memory fallback
    const idx = inMemoryLeads.findIndex((l) => l.id === id);
    if (idx !== -1) {
      if (status) inMemoryLeads[idx].status = status;
      if (notes !== undefined) inMemoryLeads[idx].notes = notes;
      inMemoryLeads[idx].updated_at = new Date().toISOString();
      return NextResponse.json({ lead: inMemoryLeads[idx] });
    }

    return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
