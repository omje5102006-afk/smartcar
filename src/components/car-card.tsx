'use client';

import Link from 'next/link';
import { Fuel, Gauge, Calendar, ShieldCheck, Sparkles, ArrowRight } from 'lucide-react';
import { Car } from '@/types';
import { formatPrice, formatMileage } from '@/lib/utils';

interface CarCardProps {
  car: Car;
  onBookTestDrive?: (car: Car) => void;
}

export function CarCard({ car, onBookTestDrive }: CarCardProps) {
  const isAvailable = car.status === 'available';
  const primaryImage =
    car.images?.[0] ||
    'https://images.unsplash.com/photo-1590362891988-f77804f3747b?auto=format&fit=crop&w=800&q=80';

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-2xl border border-border bg-card text-card-foreground shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:border-blue-500/30">
      {/* Image Container */}
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-muted">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={primaryImage}
          alt={`${car.year} ${car.make} ${car.model}`}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />

        {/* Status Badge */}
        <div className="absolute top-3 left-3 flex gap-2">
          {car.status === 'available' ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/90 px-2.5 py-0.5 text-xs font-semibold text-white backdrop-blur-sm shadow-sm">
              <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
              Available
            </span>
          ) : car.status === 'reserved' ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/90 px-2.5 py-0.5 text-xs font-semibold text-white backdrop-blur-sm shadow-sm">
              <span className="h-1.5 w-1.5 rounded-full bg-white" />
              Booked / Reserved
            </span>
          ) : (
            <span className="inline-flex items-center rounded-full bg-slate-800/90 px-2.5 py-0.5 text-xs font-semibold text-slate-300 backdrop-blur-sm">
              Sold Out
            </span>
          )}

          {car.condition === 'Certified Pre-Owned' && (
            <span className="inline-flex items-center gap-1 rounded-full bg-blue-600/90 px-2.5 py-0.5 text-xs font-semibold text-white backdrop-blur-sm">
              <ShieldCheck className="h-3 w-3" />
              Certified
            </span>
          )}
        </div>

        {/* Transmission Pill */}
        <div className="absolute bottom-3 right-3">
          <span className="rounded-md bg-black/60 px-2 py-1 text-xs font-medium text-white backdrop-blur-md uppercase tracking-wide">
            {car.transmission}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-blue-600">
            {car.make}
          </span>
          <span className="text-xs font-medium text-muted-foreground flex items-center gap-1">
            <Calendar className="h-3.5 w-3.5" />
            {car.year}
          </span>
        </div>

        <h3 className="mt-1 text-lg font-bold text-foreground line-clamp-1 group-hover:text-blue-600 transition-colors">
          {car.model}
        </h3>

        {/* Key Specs Row */}
        <div className="mt-3.5 grid grid-cols-2 gap-2 border-y border-border/60 py-2.5 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <Gauge className="h-3.5 w-3.5 text-blue-500" />
            <span>{formatMileage(car.mileage)}</span>
          </div>
          <div className="flex items-center gap-1.5 capitalize">
            <Fuel className="h-3.5 w-3.5 text-emerald-500" />
            <span>{car.fuel_type}</span>
          </div>
        </div>

        {/* Price & Action */}
        <div className="mt-4 flex items-center justify-between pt-1">
          <div>
            <p className="text-xs text-muted-foreground">Offered Price</p>
            <p className="text-xl font-extrabold text-foreground tracking-tight">
              {formatPrice(car.price)}
            </p>
          </div>

          <div className="flex gap-2">
            {onBookTestDrive && isAvailable && (
              <button
                type="button"
                onClick={() => onBookTestDrive(car)}
                className="rounded-lg bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-700 hover:bg-blue-100 transition-colors dark:bg-blue-950 dark:text-blue-300 dark:hover:bg-blue-900"
              >
                Test Drive
              </button>
            )}

            <Link
              href={`/cars/${car.id}`}
              className="inline-flex items-center justify-center rounded-lg bg-blue-600 p-2 text-white shadow-sm hover:bg-blue-700 transition-all hover:scale-105"
              aria-label={`View ${car.make} ${car.model}`}
            >
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
