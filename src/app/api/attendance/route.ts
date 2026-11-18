import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

// Default mock roster for initial setup
const DEFAULT_STAFF_ATTENDANCE = [
  {
    id: 'att-1',
    employee_id: 'emp-1',
    employee_name: 'Vikram Malhotra',
    role: 'Dealership General Manager',
    date: new Date().toISOString().split('T')[0],
    check_in: '09:15 AM',
    check_out: null,
    status: 'present',
    notes: 'Managing weekend VIP deliveries',
  },
  {
    id: 'att-2',
    employee_id: 'emp-2',
    employee_name: 'Ananya Deshmukh',
    role: 'Senior Sales Consultant',
    date: new Date().toISOString().split('T')[0],
    check_in: '09:28 AM',
    check_out: null,
    status: 'present',
    notes: 'Handled 4 test drive walk-ins',
  },
  {
    id: 'att-3',
    employee_id: 'emp-3',
    employee_name: 'Rohit Verma',
    role: 'Pre-Owned Car Evaluation Expert',
    date: new Date().toISOString().split('T')[0],
    check_in: '10:05 AM',
    check_out: null,
    status: 'late',
    notes: 'Field visit for doorstep car inspection',
  },
  {
    id: 'att-4',
    employee_id: 'emp-4',
    employee_name: 'Sameer Khan',
    role: 'Master Quality Inspector & Mechanic',
    date: new Date().toISOString().split('T')[0],
    check_in: null,
    check_out: null,
    status: 'on_leave',
    notes: 'Approved medical leave',
  },
  {
    id: 'att-5',
    employee_id: 'emp-5',
    employee_name: 'Sneha Rao',
    role: 'Customer Relationship Manager',
    date: new Date().toISOString().split('T')[0],
    check_in: '09:30 AM',
    check_out: null,
    status: 'present',
    notes: 'Handling AI Chatbot lead follow-ups',
  },
];

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date') || new Date().toISOString().split('T')[0];

    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from('attendance' as any)
      .select('*')
      .eq('date', date);

    if (error || !data || data.length === 0) {
      return NextResponse.json({ records: DEFAULT_STAFF_ATTENDANCE });
    }

    return NextResponse.json({ records: data });
  } catch {
    return NextResponse.json({ records: DEFAULT_STAFF_ATTENDANCE });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const supabase = createAdminClient();

    const { data, error } = await (supabase.from('attendance' as any) as any)
      .insert(body)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ success: true, record: body });
    }

    return NextResponse.json({ record: data }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, status, check_out, notes } = body;

    const supabase = createAdminClient();
    const updatePayload: any = {};
    if (status) updatePayload.status = status;
    if (check_out) updatePayload.check_out = check_out;
    if (notes !== undefined) updatePayload.notes = notes;

    const { data, error } = await (supabase.from('attendance' as any) as any)
      .update(updatePayload)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ success: true, updated: body });
    }

    return NextResponse.json({ record: data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
