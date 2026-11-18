'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Calendar,
  Fuel,
  Gauge,
  ShieldCheck,
  CheckCircle2,
  Phone,
  User,
  Sparkles,
  CarFront,
  BadgePercent,
  Check,
  Loader2,
} from 'lucide-react';
import { Car } from '@/types';
import { formatPrice, formatMileage } from '@/lib/utils';
import { ChatbotWidget } from '@/components/chatbot';
import { INITIAL_20_CARS } from '@/lib/cars-data';

export default function CarDetailPage() {
  const params = useParams();
  const router = useRouter();
  const carId = params.id as string;

  const [car, setCar] = useState<Car | null>(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  // Form State
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [date, setDate] = useState('');
  const [formLoading, setFormLoading] = useState(false);
  const [formSuccess, setFormSuccess] = useState(false);

  useEffect(() => {
    async function loadCar() {
      setLoading(true);
      try {
        const res = await fetch(`/api/cars?search=`);
        if (res.ok) {
          const data = await res.json();
          const found = data.cars?.find((c: Car) => c.id === carId);
          if (found) {
            setCar(found);
            setLoading(false);
            return;
          }
        }
      } catch (err) {
        console.warn('DB lookup failed, checking fallback data:', err);
      }

      // Check 20 cars library
      const fallback = INITIAL_20_CARS.find((c) => c.id === carId) || INITIAL_20_CARS[0];
      setCar(fallback);
      setLoading(false);
    }

    if (carId) loadCar();
  }, [carId]);

  async function handleBookTestDrive(e: React.FormEvent) {
    e.preventDefault();
    setFormLoading(true);
    try {
      await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          car_id: car?.id,
          customer_name: name,
          customer_phone: phone,
          preferred_date: date || null,
          message: `Booked test drive from detail page for ${car?.year} ${car?.make} ${car?.model}`,
          source: 'web_form',
        }),
      });
      setFormSuccess(true);
    } catch (err) {
      console.error(err);
    } finally {
      setFormLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex h-[70vh] items-center justify-center">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
          <span>Loading vehicle specifications...</span>
        </div>
      </div>
    );
  }

  if (!car) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <h2 className="text-xl font-bold">Vehicle Not Found</h2>
        <Link href="/" className="mt-4 inline-block text-sm text-blue-600 underline">
          Back to Inventory
        </Link>
      </div>
    );
  }

  const images = car.images?.length > 0 ? car.images : [
    'https://images.unsplash.com/photo-1590362891988-f77804f3747b?auto=format&fit=crop&w=1200&q=80',
  ];

  return (
    <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
      {/* Back button */}
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>Back to Inventory</span>
      </Link>

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-12">
        {/* Left Column: Image Gallery & Specs */}
        <div className="lg:col-span-8 space-y-8">
          {/* Main Photo Gallery */}
          <div className="space-y-3">
            <div className="relative aspect-[16/10] w-full overflow-hidden rounded-2xl border border-border bg-black">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={images[activeImageIndex] || images[0]}
                alt={`${car.make} ${car.model}`}
                className="h-full w-full object-cover"
              />
              <div className="absolute top-4 left-4 flex gap-2">
                <span
                  className={`rounded-full px-3 py-1 text-xs font-bold text-white shadow-sm ${
                    car.status === 'available'
                      ? 'bg-emerald-500'
                      : car.status === 'reserved'
                      ? 'bg-amber-500'
                      : 'bg-slate-700'
                  }`}
                >
                  {car.status === 'available'
                    ? 'Available'
                    : car.status === 'reserved'
                    ? 'Booked / Reserved'
                    : 'Sold Out'}
                </span>
                <span className="rounded-full bg-blue-600 px-3 py-1 text-xs font-bold text-white shadow-sm flex items-center gap-1">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  {car.condition}
                </span>
              </div>
            </div>

            {/* Thumbnail Strip */}
            {images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-1">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActiveImageIndex(idx)}
                    className={`relative aspect-[16/10] w-24 overflow-hidden rounded-xl border-2 transition-all ${
                      activeImageIndex === idx
                        ? 'border-blue-600 shadow-md'
                        : 'border-transparent opacity-60 hover:opacity-100'
                    }`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={img} alt="Thumbnail" className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Title & Core Meta */}
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-600">
              <span>{car.make}</span>
              <span>•</span>
              <span>{car.year}</span>
            </div>
            <h1 className="mt-1 text-3xl font-extrabold text-foreground sm:text-4xl">
              {car.make} {car.model}
            </h1>
            <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
              {car.description || 'Pristine vehicle, thoroughly checked and certified.'}
            </p>
          </div>

          {/* Key Specs Matrix */}
          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
            <h3 className="text-sm font-bold uppercase tracking-wider text-foreground mb-4">
              Vehicle Overview & Specifications
            </h3>

            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <div className="rounded-xl bg-muted/50 p-3.5">
                <div className="flex items-center gap-2 text-muted-foreground text-xs">
                  <Calendar className="h-4 w-4 text-blue-500" />
                  <span>Year</span>
                </div>
                <p className="mt-1 text-sm font-bold text-foreground">{car.year}</p>
              </div>

              <div className="rounded-xl bg-muted/50 p-3.5">
                <div className="flex items-center gap-2 text-muted-foreground text-xs">
                  <Gauge className="h-4 w-4 text-blue-500" />
                  <span>Kilometers</span>
                </div>
                <p className="mt-1 text-sm font-bold text-foreground">{formatMileage(car.mileage)}</p>
              </div>

              <div className="rounded-xl bg-muted/50 p-3.5">
                <div className="flex items-center gap-2 text-muted-foreground text-xs">
                  <Fuel className="h-4 w-4 text-emerald-500" />
                  <span>Fuel Type</span>
                </div>
                <p className="mt-1 text-sm font-bold text-foreground capitalize">{car.fuel_type}</p>
              </div>

              <div className="rounded-xl bg-muted/50 p-3.5">
                <div className="flex items-center gap-2 text-muted-foreground text-xs">
                  <CarFront className="h-4 w-4 text-indigo-500" />
                  <span>Transmission</span>
                </div>
                <p className="mt-1 text-sm font-bold text-foreground capitalize">{car.transmission}</p>
              </div>

              <div className="rounded-xl bg-muted/50 p-3.5">
                <div className="text-muted-foreground text-xs">Condition</div>
                <p className="mt-1 text-sm font-bold text-foreground">{car.condition}</p>
              </div>

              <div className="rounded-xl bg-muted/50 p-3.5">
                <div className="text-muted-foreground text-xs">Color</div>
                <p className="mt-1 text-sm font-bold text-foreground">{car.color || 'Original'}</p>
              </div>

              <div className="rounded-xl bg-muted/50 p-3.5">
                <div className="text-muted-foreground text-xs">No. of Owners</div>
                <p className="mt-1 text-sm font-bold text-foreground">{car.owners || 1}st Owner</p>
              </div>

              <div className="rounded-xl bg-muted/50 p-3.5">
                <div className="text-muted-foreground text-xs">Warranty</div>
                <p className="mt-1 text-sm font-bold text-emerald-600">1 Year Included</p>
              </div>
            </div>
          </div>

          {/* Features Checklist */}
          {car.features && car.features.length > 0 && (
            <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
              <h3 className="text-sm font-bold uppercase tracking-wider text-foreground mb-4">
                Premium Features & Highlights
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {car.features.map((feature, idx) => (
                  <div key={idx} className="flex items-center gap-2.5 text-xs font-medium text-foreground">
                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                      <Check className="h-3 w-3" />
                    </div>
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Pricing & Test Drive Booking Widget */}
        <div className="lg:col-span-4 space-y-6">
          <div className="sticky top-24 rounded-2xl border border-border bg-card p-6 shadow-xl">
            <span className="text-xs font-semibold text-muted-foreground uppercase">Offered Price</span>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-foreground tracking-tight">
                {formatPrice(car.price)}
              </span>
              <span className="text-xs text-muted-foreground line-through">
                {formatPrice(car.price * 1.08)}
              </span>
            </div>

            {/* EMI snippet */}
            <div className="mt-3 rounded-xl border border-blue-200 bg-blue-50/60 p-3 dark:border-blue-900/40 dark:bg-blue-950/40">
              <div className="flex items-center gap-2 text-xs font-semibold text-blue-800 dark:text-blue-300">
                <BadgePercent className="h-4 w-4" />
                <span>Estimated EMI: ₹{Math.round(car.price * 0.021).toLocaleString('en-IN')}/mo</span>
              </div>
              <p className="mt-0.5 text-[11px] text-blue-700/80 dark:text-blue-400">
                Zero down payment options available with partner banks.
              </p>
            </div>

            {/* Test Drive Form */}
            <div className="mt-6 border-t border-border pt-6">
              <h4 className="text-sm font-bold text-foreground">Book VIP Test Drive</h4>
              <p className="mt-0.5 text-xs text-muted-foreground">
                We bring the car directly to your home or office.
              </p>

              {formSuccess ? (
                <div className="mt-4 rounded-xl bg-emerald-50 p-4 text-center dark:bg-emerald-950/40">
                  <CheckCircle2 className="mx-auto h-8 w-8 text-emerald-600 dark:text-emerald-400" />
                  <p className="mt-2 text-xs font-bold text-emerald-800 dark:text-emerald-300">
                    Booking Confirmed!
                  </p>
                  <p className="mt-1 text-[11px] text-emerald-700/80 dark:text-emerald-400">
                    Our sales manager will call you shortly to confirm your preferred time slot.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleBookTestDrive} className="mt-4 space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-foreground mb-1">Your Name *</label>
                    <div className="relative">
                      <User className="absolute left-3 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                      <input
                        type="text"
                        required
                        placeholder="John Doe"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full rounded-lg border border-input bg-background py-2 pl-9 pr-3 text-xs focus:border-blue-600 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-foreground mb-1">Phone / WhatsApp *</label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                      <input
                        type="tel"
                        required
                        placeholder="+91 74099 10264"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full rounded-lg border border-input bg-background py-2 pl-9 pr-3 text-xs focus:border-blue-600 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-foreground mb-1">Preferred Date</label>
                    <input
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="w-full rounded-lg border border-input bg-background py-2 px-3 text-xs focus:border-blue-600 focus:outline-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={formLoading}
                    className="w-full flex items-center justify-center gap-2 rounded-xl bg-blue-600 py-3 text-xs font-bold text-white shadow-md shadow-blue-500/25 hover:bg-blue-700 transition-colors disabled:opacity-50"
                  >
                    {formLoading ? (
                      <>
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        <span>Reserving slot...</span>
                      </>
                    ) : (
                      <span>Schedule Free Doorstep Test Drive</span>
                    )}
                  </button>
                </form>
              )}
            </div>

            {/* Assistance badge */}
            <div className="mt-6 flex items-center gap-3 border-t border-border pt-4 text-xs text-muted-foreground">
              <Sparkles className="h-4 w-4 text-blue-600 shrink-0" />
              <span>Questions? Use the AI Assistant in the bottom right corner.</span>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Chatbot */}
      <ChatbotWidget />
    </div>
  );
}
