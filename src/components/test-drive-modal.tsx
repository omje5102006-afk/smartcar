'use client';

import { useState } from 'react';
import { X, Calendar, User, Phone, Mail, CheckCircle2, Loader2, CarFront } from 'lucide-react';
import { Car } from '@/types';
import { formatPrice } from '@/lib/utils';

interface TestDriveModalProps {
  car: Car | null;
  isOpen: boolean;
  onClose: () => void;
}

export function TestDriveModal({ car, isOpen, onClose }: TestDriveModalProps) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [date, setDate] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen || !car) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          car_id: car?.id,
          customer_name: name,
          customer_phone: phone,
          customer_email: email,
          preferred_date: date || null,
          message: notes || `Requested Test Drive for ${car?.year} ${car?.make} ${car?.model}`,
          source: 'web_form',
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to book test drive. Please check details.');
      }

      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  function handleReset() {
    setSuccess(false);
    setName('');
    setPhone('');
    setEmail('');
    setDate('');
    setNotes('');
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-2xl">
        <button
          onClick={handleReset}
          className="absolute top-4 right-4 rounded-full p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        {success ? (
          <div className="py-8 text-center space-y-4">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400">
              <CheckCircle2 className="h-8 w-8" />
            </div>
            <h3 className="text-xl font-bold text-foreground">Test Drive Requested!</h3>
            <p className="text-sm text-muted-foreground max-w-sm mx-auto">
              Thank you, <span className="font-semibold text-foreground">{name}</span>. Our sales relationship manager will call you at <span className="font-semibold text-foreground">{phone}</span> to confirm your slot for the <span className="font-semibold text-foreground">{car.make} {car.model}</span>.
            </p>
            <div className="pt-2">
              <button
                onClick={handleReset}
                className="w-full rounded-xl bg-blue-600 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        ) : (
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-blue-600 mb-1">
              <CarFront className="h-4 w-4" />
              <span>Schedule a VIP Test Drive</span>
            </div>
            <h2 className="text-xl font-bold text-foreground">
              {car.year} {car.make} {car.model}
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Price: <span className="font-semibold text-foreground">{formatPrice(car.price)}</span> • Doorstep test drive available
            </p>

            {error && (
              <div className="mt-4 rounded-lg bg-red-50 p-3 text-xs text-red-600 dark:bg-red-950/50 dark:text-red-400">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-5 space-y-3.5">
              <div>
                <label className="block text-xs font-medium text-foreground mb-1">Full Name *</label>
                <div className="relative">
                  <User className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Rahul Sharma"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full rounded-xl border border-input bg-background py-2 pl-9 pr-3 text-sm focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-foreground mb-1">Phone / WhatsApp *</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <input
                    type="tel"
                    required
                    placeholder="+91 74099 10264"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full rounded-xl border border-input bg-background py-2 pl-9 pr-3 text-sm focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-foreground mb-1">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <input
                      type="email"
                      placeholder="rahul@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full rounded-xl border border-input bg-background py-2 pl-9 pr-3 text-sm focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-foreground mb-1">Preferred Date</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <input
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="w-full rounded-xl border border-input bg-background py-2 pl-9 pr-3 text-sm focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-foreground mb-1">Special Requests / Notes</label>
                <textarea
                  rows={2}
                  placeholder="Need home delivery test drive or loan assistance?"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full rounded-xl border border-input bg-background p-2.5 text-sm focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-blue-600 py-3 text-sm font-semibold text-white shadow-md shadow-blue-500/20 hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Reserving Slot...</span>
                    </>
                  ) : (
                    <span>Confirm Test Drive Booking</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
