'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  CarFront,
  Users,
  CheckCircle2,
  TrendingUp,
  Plus,
  Trash2,
  Sparkles,
  Phone,
  Calendar,
  MessageSquare,
  Search,
  Filter,
  Check,
  AlertCircle,
  Loader2,
  ExternalLink,
  Clock,
  UserCheck,
  UserX,
  CalendarDays,
  ShieldAlert,
  ShieldCheck,
  Lock,
  LogOut,
} from 'lucide-react';
import { Car, CarStatus, Lead, LeadStatus, AttendanceRecord, AttendanceStatus } from '@/types';
import { formatPrice, formatMileage, formatDate } from '@/lib/utils';

export default function AdminDashboardPage() {
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<'inventory' | 'leads' | 'attendance'>('inventory');

  // Inventory State
  const [cars, setCars] = useState<Car[]>([]);
  const [loadingCars, setLoadingCars] = useState(true);
  const [showAddCarModal, setShowAddCarModal] = useState(false);

  // Leads State
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loadingLeads, setLoadingLeads] = useState(true);
  const [leadFilter, setLeadFilter] = useState<string>('all');

  // Staff Attendance State
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [loadingAttendance, setLoadingAttendance] = useState(true);
  const [attendanceFilter, setAttendanceFilter] = useState<string>('all');
  const [showAddStaffModal, setShowAddStaffModal] = useState(false);
  const [newStaff, setNewStaff] = useState({
    name: '',
    role: 'Senior Sales Consultant',
    notes: '',
  });

  // Add Car Form
  const [newCar, setNewCar] = useState({
    make: '',
    model: '',
    year: 2022,
    price: 1200000,
    mileage: 25000,
    fuel_type: 'petrol',
    transmission: 'automatic',
    condition: 'Certified Pre-Owned',
    color: 'White',
    imageUrl: '',
    description: '',
  });
  const [submittingCar, setSubmittingCar] = useState(false);

  // Load Inventory, Leads & Attendance
  useEffect(() => {
    loadInventory();
    loadLeads();
    loadAttendance();
  }, []);

  async function loadInventory() {
    setLoadingCars(true);
    try {
      const res = await fetch('/api/cars?status=all');
      if (res.ok) {
        const data = await res.json();
        setCars(data.cars || []);
      }
    } catch (err) {
      console.warn('Failed to load cars:', err);
    } finally {
      setLoadingCars(false);
    }
  }

  async function loadLeads() {
    setLoadingLeads(true);
    try {
      const res = await fetch('/api/leads');
      if (res.ok) {
        const data = await res.json();
        setLeads(data.leads || []);
      }
    } catch (err) {
      console.warn('Failed to load leads:', err);
    } finally {
      setLoadingLeads(false);
    }
  }

  async function loadAttendance() {
    setLoadingAttendance(true);
    try {
      const res = await fetch('/api/attendance');
      if (res.ok) {
        const data = await res.json();
        setAttendance(data.records || []);
      }
    } catch (err) {
      console.warn('Failed to load attendance:', err);
    } finally {
      setLoadingAttendance(false);
    }
  }

  // Update Car Status (available, reserved, sold)
  async function updateCarStatus(carId: string, status: CarStatus) {
    setCars((prev) => prev.map((c) => (c.id === carId ? { ...c, status } : c)));

    try {
      await fetch('/api/cars', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: carId, status }),
      });
    } catch (e) {
      console.warn(e);
      loadInventory();
    }
  }

  // Toggle Car Status between Available and Sold
  async function toggleCarStatus(car: Car) {
    const nextStatus: CarStatus = car.status === 'available' ? 'sold' : 'available';
    updateCarStatus(car.id, nextStatus);
  }

  // Update Lead Status
  async function updateLeadStatus(leadId: string, status: LeadStatus) {
    setLeads((prev) => prev.map((l) => (l.id === leadId ? { ...l, status } : l)));

    try {
      await fetch('/api/leads', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: leadId, status }),
      });
    } catch (e) {
      console.warn(e);
      loadLeads();
    }
  }

  // Update Staff Attendance Status
  async function updateStaffAttendance(id: string, status: AttendanceStatus) {
    setAttendance((prev) => prev.map((a) => (a.id === id ? { ...a, status } : a)));

    try {
      await fetch('/api/attendance', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status }),
      });
    } catch (e) {
      console.warn(e);
      loadAttendance();
    }
  }

  // Quick check-out action
  async function markStaffCheckOut(id: string) {
    const timeNow = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    setAttendance((prev) => prev.map((a) => (a.id === id ? { ...a, check_out: timeNow } : a)));

    try {
      await fetch('/api/attendance', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, check_out: timeNow }),
      });
    } catch (e) {
      console.warn(e);
    }
  }

  // Create new staff attendance entry
  async function handleAddStaff(e: React.FormEvent) {
    e.preventDefault();
    const newRecord: AttendanceRecord = {
      id: `att-${Date.now()}`,
      employee_id: `emp-${Date.now()}`,
      employee_name: newStaff.name,
      role: newStaff.role,
      date: new Date().toISOString().split('T')[0],
      check_in: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      check_out: null,
      status: 'present',
      notes: newStaff.notes || 'Marked on-shift',
    };

    setAttendance((prev) => [newRecord, ...prev]);
    setShowAddStaffModal(false);
    setNewStaff({ name: '', role: 'Senior Sales Consultant', notes: '' });

    try {
      await fetch('/api/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newRecord),
      });
    } catch (e) {
      console.warn(e);
    }
  }

  // Create new car
  async function handleAddCar(e: React.FormEvent) {
    e.preventDefault();
    setSubmittingCar(true);
    try {
      const res = await fetch('/api/cars', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          make: newCar.make,
          model: newCar.model,
          year: Number(newCar.year),
          price: Number(newCar.price),
          mileage: Number(newCar.mileage),
          fuel_type: newCar.fuel_type,
          transmission: newCar.transmission,
          condition: newCar.condition,
          color: newCar.color,
          description: newCar.description,
          images: [
            newCar.imageUrl ||
              'https://images.unsplash.com/photo-1590362891988-f77804f3747b?w=800',
          ],
          features: ['Power Steering', 'Air Conditioning', 'Touchscreen'],
          status: 'available',
        }),
      });

      if (res.ok) {
        setShowAddCarModal(false);
        setNewCar({
          make: '',
          model: '',
          year: 2022,
          price: 1200000,
          mileage: 25000,
          fuel_type: 'petrol',
          transmission: 'automatic',
          condition: 'Certified Pre-Owned',
          color: 'White',
          imageUrl: '',
          description: '',
        });
        loadInventory();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmittingCar(false);
    }
  }

  // Computed Metrics
  const activeInventoryCount = cars.filter((c) => c.status === 'available').length;
  const reservedCarsCount = cars.filter((c) => c.status === 'reserved').length;
  const soldCarsCount = cars.filter((c) => c.status === 'sold').length;
  const newLeadsCount = leads.filter((l) => l.status === 'new').length;
  const bookedDrivesCount = leads.filter((l) => l.status === 'test_drive_booked').length;
  const totalLeadsCount = leads.length;

  const presentCount = attendance.filter((a) => a.status === 'present').length;
  const lateCount = attendance.filter((a) => a.status === 'late').length;
  const onLeaveCount = attendance.filter((a) => a.status === 'on_leave' || a.status === 'absent').length;

  const filteredLeads =
    leadFilter === 'all' ? leads : leads.filter((l) => l.status === leadFilter);

  const filteredAttendance =
    attendanceFilter === 'all' ? attendance : attendance.filter((a) => a.status === attendanceFilter);

  return (
    <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-600">
            <CarFront className="h-4 w-4" />
            <span>SmartCar Executive CRM & HR</span>
          </div>
          <h1 className="mt-1 text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
            Dealer, Inventory & Staff Management
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <a
            href="/"
            className="inline-flex items-center gap-1.5 rounded-xl border border-border px-3.5 py-2 text-xs font-semibold text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            <span>Public Showroom</span>
          </a>

          {activeTab === 'attendance' ? (
            <button
              onClick={() => setShowAddStaffModal(true)}
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-blue-500/20 hover:bg-blue-700 transition-colors"
            >
              <UserCheck className="h-4 w-4" />
              <span>Mark Staff Check-In</span>
            </button>
          ) : (
            <button
              onClick={() => setShowAddCarModal(true)}
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-blue-500/20 hover:bg-blue-700 transition-colors"
            >
              <Plus className="h-4 w-4" />
              <span>Add Vehicle</span>
            </button>
          )}
        </div>
      </div>

      {/* Analytics KPI Widgets */}
      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-bold uppercase tracking-wider">Showroom Inventory</span>
            <CarFront className="h-4 w-4 text-blue-600" />
          </div>
          <p className="mt-2 text-2xl sm:text-3xl font-black text-foreground">{activeInventoryCount}</p>
          <span className="text-[11px] text-emerald-600 font-semibold">
            {reservedCarsCount > 0 ? `${reservedCarsCount} Booked/Reserved • ` : ''}Ready on floor
          </span>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-bold uppercase tracking-wider">Test Drives Scheduled</span>
            <Calendar className="h-4 w-4 text-blue-600" />
          </div>
          <p className="mt-2 text-2xl sm:text-3xl font-black text-foreground">{bookedDrivesCount}</p>
          <span className="text-[11px] text-blue-600 font-semibold">Doorstep & Showroom</span>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-bold uppercase tracking-wider">Customer Inquiries</span>
            <Users className="h-4 w-4 text-emerald-600" />
          </div>
          <p className="mt-2 text-2xl sm:text-3xl font-black text-foreground">{totalLeadsCount}</p>
          <span className="text-[11px] text-emerald-600 font-semibold">{newLeadsCount} New Leads pending</span>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-bold uppercase tracking-wider">Staff On Duty</span>
            <Clock className="h-4 w-4 text-indigo-600" />
          </div>
          <p className="mt-2 text-2xl sm:text-3xl font-black text-foreground">{presentCount} / {attendance.length}</p>
          <span className="text-[11px] text-indigo-600 font-semibold">{lateCount} Late • {onLeaveCount} On Leave</span>
        </div>
      </div>

      {/* Tabs Switcher */}
      <div className="mt-8 flex border-b border-border overflow-x-auto">
        <button
          onClick={() => setActiveTab('inventory')}
          className={`flex items-center gap-2 border-b-2 py-3 px-5 text-sm font-bold whitespace-nowrap transition-colors ${
            activeTab === 'inventory'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <CarFront className="h-4 w-4" />
          <span>Vehicle Inventory ({cars.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('leads')}
          className={`flex items-center gap-2 border-b-2 py-3 px-5 text-sm font-bold whitespace-nowrap transition-colors ${
            activeTab === 'leads'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <Users className="h-4 w-4" />
          <span>Leads & AI Chat Inquiries ({leads.length})</span>
          {newLeadsCount > 0 && (
            <span className="rounded-full bg-emerald-500 px-2 py-0.5 text-[10px] text-white">
              {newLeadsCount} New
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('attendance')}
          className={`flex items-center gap-2 border-b-2 py-3 px-5 text-sm font-bold whitespace-nowrap transition-colors ${
            activeTab === 'attendance'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <Clock className="h-4 w-4" />
          <span>Staff & Attendance (कर्मचारी उपस्थिति)</span>
          <span className="rounded-full bg-indigo-500 px-2 py-0.5 text-[10px] text-white">
            {presentCount} Present
          </span>
        </button>
      </div>

      {/* TAB 1: INVENTORY MANAGEMENT */}
      {activeTab === 'inventory' && (
        <div className="mt-6">
          <div className="overflow-x-auto rounded-2xl border border-border bg-card shadow-sm">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-border bg-muted/50 text-muted-foreground uppercase font-semibold">
                <tr>
                  <th className="py-3.5 px-4">Car Model</th>
                  <th className="py-3.5 px-4">Year & Specs</th>
                  <th className="py-3.5 px-4">Price</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {cars.map((car) => (
                  <tr key={car.id} className="hover:bg-muted/30 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={car.images?.[0] || 'https://images.unsplash.com/photo-1590362891988-f77804f3747b?w=200'}
                          alt={car.model}
                          className="h-10 w-14 rounded-lg object-cover"
                        />
                        <div>
                          <p className="font-bold text-foreground">
                            {car.make} {car.model}
                          </p>
                          <p className="text-[11px] text-muted-foreground">{car.condition}</p>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-4 text-muted-foreground">
                      <p className="font-medium text-foreground">{car.year} • {car.fuel_type.toUpperCase()}</p>
                      <p className="text-[11px]">{formatMileage(car.mileage)} • {car.transmission}</p>
                    </td>

                    <td className="py-3 px-4">
                      <p className="font-extrabold text-foreground">{formatPrice(car.price)}</p>
                    </td>

                    <td className="py-3 px-4">
                      <select
                        value={car.status}
                        onChange={(e) => updateCarStatus(car.id, e.target.value as CarStatus)}
                        className={`rounded-full border px-2.5 py-1 text-[11px] font-bold focus:outline-none transition-colors ${
                          car.status === 'available'
                            ? 'border-emerald-300 bg-emerald-50 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-400'
                            : car.status === 'reserved'
                            ? 'border-amber-300 bg-amber-50 text-amber-800 dark:bg-amber-950 dark:text-amber-400'
                            : 'border-slate-300 bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300'
                        }`}
                      >
                        <option value="available">🟢 Available</option>
                        <option value="reserved">🟡 Booked / Reserved</option>
                        <option value="sold">⚪ Sold Out</option>
                      </select>
                    </td>

                    <td className="py-3 px-4 text-right">
                      {car.status === 'available' ? (
                        <button
                          onClick={() => updateCarStatus(car.id, 'reserved')}
                          className="rounded-lg border border-amber-300 bg-amber-50 dark:bg-amber-950/40 dark:border-amber-800 px-2.5 py-1 text-[11px] font-bold text-amber-800 dark:text-amber-300 hover:bg-amber-100 transition-colors"
                        >
                          Mark as Booked
                        </button>
                      ) : car.status === 'reserved' ? (
                        <button
                          onClick={() => updateCarStatus(car.id, 'sold')}
                          className="rounded-lg border border-border px-2.5 py-1 text-[11px] font-semibold text-foreground hover:bg-muted transition-colors"
                        >
                          Mark as Sold
                        </button>
                      ) : (
                        <button
                          onClick={() => updateCarStatus(car.id, 'available')}
                          className="rounded-lg border border-border px-2.5 py-1 text-[11px] font-semibold text-foreground hover:bg-muted transition-colors"
                        >
                          Make Available
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: CRM & LEADS MANAGEMENT */}
      {activeTab === 'leads' && (
        <div className="mt-6 space-y-4">
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            <span className="text-xs font-bold text-muted-foreground whitespace-nowrap">Filter by Status:</span>
            {['all', 'new', 'contacted', 'test_drive_booked', 'closed'].map((status) => (
              <button
                key={status}
                onClick={() => setLeadFilter(status)}
                className={`rounded-lg px-2.5 py-1 text-xs font-semibold capitalize whitespace-nowrap transition-colors ${
                  leadFilter === status
                    ? 'bg-blue-600 text-white'
                    : 'bg-muted text-muted-foreground hover:text-foreground'
                }`}
              >
                {status.replace(/_/g, ' ')}
              </button>
            ))}
          </div>

          <div className="overflow-x-auto rounded-2xl border border-border bg-card shadow-sm">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-border bg-muted/50 text-muted-foreground uppercase font-semibold">
                <tr>
                  <th className="py-3.5 px-4">Customer</th>
                  <th className="py-3.5 px-4">Booked Vehicle</th>
                  <th className="py-3.5 px-4">Slot & Inquiry Details</th>
                  <th className="py-3.5 px-4">Source</th>
                  <th className="py-3.5 px-4">Date</th>
                  <th className="py-3.5 px-4">CRM Status</th>
                  <th className="py-3.5 px-4 text-right">Quick Contact</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredLeads.map((lead) => {
                  const leadCar =
                    (lead as any).cars ||
                    cars.find((c) => c.id === lead.car_id);
                  const cleanPhone = lead.customer_phone
                    ? lead.customer_phone.replace(/\D/g, '').replace(/^(91|0)(?=\d{10}$)/, '')
                    : '';
                  const carTitle = leadCar ? `${leadCar.year} ${leadCar.make} ${leadCar.model}` : 'Pre-Owned Car';
                  const waText = encodeURIComponent(
                    `Hello ${lead.customer_name}, greetings from SmartCar Dealership! We received your booking / test drive request for ${carTitle}. We would be delighted to schedule your test drive.`
                  );

                  return (
                    <tr key={lead.id} className="hover:bg-muted/30 transition-colors">
                      <td className="py-3 px-4 font-bold text-foreground">
                        <div className="flex items-center gap-2.5">
                          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-100 text-blue-700 font-bold dark:bg-blue-950 dark:text-blue-300">
                            {lead.customer_name ? lead.customer_name.charAt(0) : 'C'}
                          </div>
                          <div>
                            <p className="font-bold text-foreground leading-snug">{lead.customer_name}</p>
                            <a
                              href={`tel:${lead.customer_phone}`}
                              className="text-[11px] text-blue-600 hover:underline font-medium block"
                            >
                              {lead.customer_phone}
                            </a>
                            {lead.customer_email && (
                              <p className="text-[10px] text-muted-foreground">{lead.customer_email}</p>
                            )}
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        {leadCar ? (
                          <div className="flex items-center gap-2.5">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={leadCar.images?.[0] || 'https://images.unsplash.com/photo-1590362891988-f77804f3747b?w=200'}
                              alt={leadCar.model}
                              className="h-10 w-14 rounded-lg object-cover border border-border"
                            />
                            <div>
                              <a
                                href={`/cars/${leadCar.id}`}
                                target="_blank"
                                rel="noreferrer"
                                className="font-bold text-foreground hover:text-blue-600 flex items-center gap-1 transition-colors"
                              >
                                <span>{leadCar.make} {leadCar.model}</span>
                                <ExternalLink className="h-3 w-3 text-muted-foreground" />
                              </a>
                              <p className="text-[11px] text-muted-foreground font-semibold">
                                {leadCar.year} • {formatPrice(leadCar.price)}
                              </p>
                            </div>
                          </div>
                        ) : (
                          <span className="text-muted-foreground italic text-xs">General Inventory Inquiry</span>
                        )}
                      </td>

                      <td className="py-3 px-4 max-w-xs">
                        <p className="text-foreground line-clamp-1">{lead.message || 'Customer requested consultation'}</p>
                        {lead.preferred_date ? (
                          <span className="inline-flex items-center gap-1 mt-1 rounded-md bg-blue-50 px-2 py-0.5 text-[11px] font-bold text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                            <Calendar className="h-3 w-3" />
                            Slot: {formatDate(lead.preferred_date)}
                          </span>
                        ) : (
                          <span className="text-[11px] text-muted-foreground">Immediate Callback</span>
                        )}
                      </td>

                      <td className="py-3 px-4">
                        {lead.source === 'chatbot' ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-bold text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                            <Sparkles className="h-3 w-3" />
                            AI Chatbot
                          </span>
                        ) : (
                          <span className="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                            Web Form
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-4 text-muted-foreground text-[11px] whitespace-nowrap">
                        {formatDate(lead.created_at)}
                      </td>

                      <td className="py-3 px-4">
                        <select
                          value={lead.status}
                          onChange={(e) => updateLeadStatus(lead.id, e.target.value as LeadStatus)}
                          className={`rounded-lg border px-2 py-1 text-xs font-bold focus:outline-none transition-colors ${
                            lead.status === 'new'
                              ? 'border-emerald-300 bg-emerald-50 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-400'
                              : lead.status === 'test_drive_booked'
                              ? 'border-blue-300 bg-blue-50 text-blue-800 dark:bg-blue-950 dark:text-blue-400'
                              : lead.status === 'contacted'
                              ? 'border-indigo-300 bg-indigo-50 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-400'
                              : lead.status === 'closed'
                              ? 'border-purple-300 bg-purple-50 text-purple-800 dark:bg-purple-950 dark:text-purple-400'
                              : 'border-border bg-background text-foreground'
                          }`}
                        >
                          <option value="new">New Lead</option>
                          <option value="contacted">Contacted</option>
                          <option value="test_drive_booked">Test Drive Booked</option>
                          <option value="closed">Closed / Deal Won</option>
                          <option value="lost">Lost</option>
                        </select>
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {cleanPhone && (
                            <a
                              href={`https://wa.me/91${cleanPhone}?text=${waText}`}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-2.5 py-1 text-[11px] font-bold text-white shadow-sm hover:bg-emerald-700 transition-colors"
                              title="Chat on WhatsApp"
                            >
                              <MessageSquare className="h-3 w-3" />
                              <span>WhatsApp</span>
                            </a>
                          )}
                          <a
                            href={`tel:${lead.customer_phone}`}
                            className="rounded-lg border border-border p-1 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                            title="Call customer"
                          >
                            <Phone className="h-3.5 w-3.5 text-blue-600" />
                          </a>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: STAFF ATTENDANCE (कर्मचारी उपस्थिति) */}
      {activeTab === 'attendance' && (
        <div className="mt-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              <span className="text-xs font-bold text-muted-foreground whitespace-nowrap">Filter Status:</span>
              {['all', 'present', 'late', 'on_leave', 'absent'].map((status) => (
                <button
                  key={status}
                  onClick={() => setAttendanceFilter(status)}
                  className={`rounded-lg px-2.5 py-1 text-xs font-semibold capitalize whitespace-nowrap transition-colors ${
                    attendanceFilter === status
                      ? 'bg-blue-600 text-white'
                      : 'bg-muted text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {status.replace(/_/g, ' ')}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
              <CalendarDays className="h-4 w-4 text-blue-600" />
              <span>Shift Date: Today ({new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })})</span>
            </div>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-border bg-card shadow-sm">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-border bg-muted/50 text-muted-foreground uppercase font-semibold">
                <tr>
                  <th className="py-3.5 px-4">Staff Member</th>
                  <th className="py-3.5 px-4">Designation / Role</th>
                  <th className="py-3.5 px-4">Check-In</th>
                  <th className="py-3.5 px-4">Check-Out</th>
                  <th className="py-3.5 px-4">Notes / Activity</th>
                  <th className="py-3.5 px-4">Attendance Status</th>
                  <th className="py-3.5 px-4 text-right">Quick Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredAttendance.map((rec) => (
                  <tr key={rec.id} className="hover:bg-muted/30 transition-colors">
                    <td className="py-3 px-4 font-bold text-foreground">
                      <div className="flex items-center gap-2">
                        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-100 text-blue-700 font-bold dark:bg-blue-950 dark:text-blue-300">
                          {rec.employee_name.charAt(0)}
                        </div>
                        <span>{rec.employee_name}</span>
                      </div>
                    </td>

                    <td className="py-3 px-4 text-muted-foreground">
                      {rec.role}
                    </td>

                    <td className="py-3 px-4">
                      {rec.check_in ? (
                        <span className="font-semibold text-emerald-600">{rec.check_in}</span>
                      ) : (
                        <span className="text-muted-foreground italic">Not marked</span>
                      )}
                    </td>

                    <td className="py-3 px-4">
                      {rec.check_out ? (
                        <span className="font-semibold text-blue-600">{rec.check_out}</span>
                      ) : (
                        <span className="text-muted-foreground italic">On Shift</span>
                      )}
                    </td>

                    <td className="py-3 px-4 text-muted-foreground max-w-xs truncate">
                      {rec.notes || 'Routine dealership duty'}
                    </td>

                    <td className="py-3 px-4">
                      <select
                        value={rec.status}
                        onChange={(e) => updateStaffAttendance(rec.id, e.target.value as AttendanceStatus)}
                        className={`rounded-lg border px-2 py-1 text-xs font-bold focus:outline-none ${
                          rec.status === 'present'
                            ? 'border-emerald-300 bg-emerald-50 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-400'
                            : rec.status === 'late'
                            ? 'border-amber-300 bg-amber-50 text-amber-800 dark:bg-amber-950 dark:text-amber-400'
                            : rec.status === 'on_leave'
                            ? 'border-blue-300 bg-blue-50 text-blue-800 dark:bg-blue-950 dark:text-blue-400'
                            : 'border-red-300 bg-red-50 text-red-800 dark:bg-red-950 dark:text-red-400'
                        }`}
                      >
                        <option value="present">Present (उपस्थित)</option>
                        <option value="late">Late Arrival (देरी से)</option>
                        <option value="half_day">Half Day (आधा दिन)</option>
                        <option value="on_leave">Approved Leave (अवकाश)</option>
                        <option value="absent">Absent (अनुपस्थित)</option>
                      </select>
                    </td>

                    <td className="py-3 px-4 text-right">
                      {!rec.check_out && rec.status === 'present' ? (
                        <button
                          onClick={() => markStaffCheckOut(rec.id)}
                          className="rounded-lg border border-border px-2.5 py-1 text-[11px] font-semibold text-foreground hover:bg-muted"
                        >
                          Check Out
                        </button>
                      ) : (
                        <span className="text-[11px] text-muted-foreground">Logged</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Staff Check-In Modal */}
      {showAddStaffModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl">
            <h2 className="text-xl font-bold text-foreground">Mark Staff Attendance</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Add an employee to today&apos;s dealership shift register.
            </p>

            <form onSubmit={handleAddStaff} className="mt-4 space-y-3.5">
              <div>
                <label className="block text-xs font-medium text-foreground mb-1">Employee Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rajesh Kumar"
                  value={newStaff.name}
                  onChange={(e) => setNewStaff({ ...newStaff, name: e.target.value })}
                  className="w-full rounded-lg border border-input bg-background p-2 text-xs focus:border-blue-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-foreground mb-1">Role / Designation *</label>
                <select
                  value={newStaff.role}
                  onChange={(e) => setNewStaff({ ...newStaff, role: e.target.value })}
                  className="w-full rounded-lg border border-input bg-background p-2 text-xs focus:border-blue-600 focus:outline-none"
                >
                  <option value="Dealership General Manager">Dealership General Manager</option>
                  <option value="Senior Sales Consultant">Senior Sales Consultant</option>
                  <option value="Pre-Owned Car Evaluation Expert">Pre-Owned Car Evaluation Expert</option>
                  <option value="Master Quality Inspector & Mechanic">Master Quality Inspector & Mechanic</option>
                  <option value="Customer Relationship Manager">Customer Relationship Manager</option>
                  <option value="Test Drive Co-ordinator">Test Drive Co-ordinator</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-foreground mb-1">Shift Notes / Assignment</label>
                <input
                  type="text"
                  placeholder="e.g. Assigned to Honda/Hyundai luxury section"
                  value={newStaff.notes}
                  onChange={(e) => setNewStaff({ ...newStaff, notes: e.target.value })}
                  className="w-full rounded-lg border border-input bg-background p-2 text-xs focus:border-blue-600 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddStaffModal(false)}
                  className="rounded-xl border border-border px-4 py-2 text-xs font-semibold text-foreground hover:bg-muted"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white hover:bg-blue-700 transition-colors"
                >
                  Save Check-In
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add New Car Modal */}
      {showAddCarModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-2xl">
            <h2 className="text-xl font-bold text-foreground">Add New Vehicle to Inventory</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Instantly appears across the customer catalog and AI Chatbot live inventory queries.
            </p>

            <form onSubmit={handleAddCar} className="mt-4 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-foreground mb-1">Make / Brand *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Honda"
                    value={newCar.make}
                    onChange={(e) => setNewCar({ ...newCar, make: e.target.value })}
                    className="w-full rounded-lg border border-input bg-background p-2 text-xs focus:border-blue-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-foreground mb-1">Model *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. City ZX 1.5"
                    value={newCar.model}
                    onChange={(e) => setNewCar({ ...newCar, model: e.target.value })}
                    className="w-full rounded-lg border border-input bg-background p-2 text-xs focus:border-blue-600 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-foreground mb-1">Year *</label>
                  <input
                    type="number"
                    required
                    value={newCar.year}
                    onChange={(e) => setNewCar({ ...newCar, year: Number(e.target.value) })}
                    className="w-full rounded-lg border border-input bg-background p-2 text-xs focus:border-blue-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-foreground mb-1">Price (₹) *</label>
                  <input
                    type="number"
                    required
                    value={newCar.price}
                    onChange={(e) => setNewCar({ ...newCar, price: Number(e.target.value) })}
                    className="w-full rounded-lg border border-input bg-background p-2 text-xs focus:border-blue-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-foreground mb-1">Mileage (KM)</label>
                  <input
                    type="number"
                    value={newCar.mileage}
                    onChange={(e) => setNewCar({ ...newCar, mileage: Number(e.target.value) })}
                    className="w-full rounded-lg border border-input bg-background p-2 text-xs focus:border-blue-600 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-foreground mb-1">Fuel Type</label>
                  <select
                    value={newCar.fuel_type}
                    onChange={(e) => setNewCar({ ...newCar, fuel_type: e.target.value })}
                    className="w-full rounded-lg border border-input bg-background p-2 text-xs focus:border-blue-600 focus:outline-none"
                  >
                    <option value="petrol">Petrol</option>
                    <option value="diesel">Diesel</option>
                    <option value="electric">Electric</option>
                    <option value="hybrid">Hybrid</option>
                    <option value="cng">CNG</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-foreground mb-1">Transmission</label>
                  <select
                    value={newCar.transmission}
                    onChange={(e) => setNewCar({ ...newCar, transmission: e.target.value })}
                    className="w-full rounded-lg border border-input bg-background p-2 text-xs focus:border-blue-600 focus:outline-none"
                  >
                    <option value="automatic">Automatic</option>
                    <option value="manual">Manual</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-foreground mb-1">Image URL (Supabase or CDN)</label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/photo-..."
                  value={newCar.imageUrl}
                  onChange={(e) => setNewCar({ ...newCar, imageUrl: e.target.value })}
                  className="w-full rounded-lg border border-input bg-background p-2 text-xs focus:border-blue-600 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddCarModal(false)}
                  className="rounded-xl border border-border px-4 py-2 text-xs font-semibold text-foreground hover:bg-muted"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingCar}
                  className="rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white hover:bg-blue-700 disabled:opacity-50"
                >
                  {submittingCar ? 'Adding...' : 'Add Vehicle'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
