'use client';

import { useState, useEffect } from 'react';
import {
  Sparkles,
  ShieldCheck,
  Zap,
  ArrowRight,
  BadgeCheck,
  RotateCcw,
  Truck,
  CarFront,
} from 'lucide-react';
import { CarCard } from '@/components/car-card';
import { SearchFilters } from '@/components/search-filters';
import { TestDriveModal } from '@/components/test-drive-modal';
import { ChatbotWidget } from '@/components/chatbot';
import { Car, CarFilters } from '@/types';
import { INITIAL_20_CARS } from '@/lib/cars-data';

const FALLBACK_CARS: Car[] = INITIAL_20_CARS;

export default function HomePage() {
  const [cars, setCars] = useState<Car[]>(INITIAL_20_CARS);
  const [loading, setLoading] = useState(false);
  const [selectedCarForDrive, setSelectedCarForDrive] = useState<Car | null>(null);
  const [filters, setFilters] = useState<CarFilters>({
    make: 'all',
    fuel_type: 'all',
    transmission: 'all',
    maxPrice: undefined,
    searchQuery: '',
  });

  // Fetch cars from Supabase API route
  useEffect(() => {
    async function fetchInventory() {
      setLoading(true);
      try {
        const queryParams = new URLSearchParams();
        if (filters.make && filters.make !== 'all') queryParams.set('make', filters.make);
        if (filters.fuel_type && filters.fuel_type !== 'all') queryParams.set('fuel', filters.fuel_type);
        if (filters.maxPrice) queryParams.set('maxPrice', String(filters.maxPrice));
        if (filters.searchQuery) queryParams.set('search', filters.searchQuery);

        const res = await fetch(`/api/cars?${queryParams.toString()}`);
        if (res.ok) {
          const data = await res.json();
          if (data.cars && data.cars.length > 0) {
            setCars(data.cars);
          } else {
            // Apply local filter to fallback cars if API returns empty
            let filtered = FALLBACK_CARS;
            if (filters.make && filters.make !== 'all') {
              filtered = filtered.filter((c) => c.make.toLowerCase() === filters.make?.toLowerCase());
            }
            if (filters.fuel_type && filters.fuel_type !== 'all') {
              filtered = filtered.filter((c) => c.fuel_type === filters.fuel_type);
            }
            if (filters.transmission && filters.transmission !== 'all') {
              filtered = filtered.filter((c) => c.transmission === filters.transmission);
            }
            if (filters.maxPrice) {
              filtered = filtered.filter((c) => c.price <= (filters.maxPrice || 0));
            }
            if (filters.searchQuery) {
              const q = filters.searchQuery.toLowerCase();
              filtered = filtered.filter(
                (c) => c.make.toLowerCase().includes(q) || c.model.toLowerCase().includes(q)
              );
            }
            setCars(filtered);
          }
        }
      } catch (err) {
        console.warn('Could not fetch cars from API, using fallback data:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchInventory();
  }, [filters]);

  function handleResetFilters() {
    setFilters({
      make: 'all',
      fuel_type: 'all',
      transmission: 'all',
      maxPrice: undefined,
      searchQuery: '',
    });
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-slate-950 via-slate-900 to-background pt-16 pb-20 text-white">
        {/* Glow Gradients */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-blue-600/10 blur-[120px] pointer-events-none rounded-full" />

        <div className="container relative mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            {/* Pill */}
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-4 py-1.5 text-xs font-semibold text-blue-400 backdrop-blur-md">
              <Sparkles className="h-4 w-4" />
              <span>Next-Gen Smart Used Car Dealership</span>
            </div>

            <h1 className="mt-6 text-4xl font-extrabold tracking-tight sm:text-6xl text-white">
              Buy Certified Used Cars with <span className="bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">Complete Confidence</span>
            </h1>

            <p className="mt-4 text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
              Every vehicle passes our rigorous 150-point technical check. Enjoy fixed upfront pricing, 7-day money-back guarantee, and 24/7 AI sales assistance.
            </p>

            {/* Quick Action CTA */}
            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              <a
                href="#inventory"
                className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-blue-500/25 transition-all hover:bg-blue-700 hover:scale-105"
              >
                <span>Browse Available Cars</span>
                <ArrowRight className="h-4 w-4" />
              </a>

              <button
                onClick={() => {
                  const chatBtn = document.querySelector('button[aria-label="Open AI Car Assistant"]') as HTMLButtonElement;
                  if (chatBtn) chatBtn.click();
                }}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800/80 px-6 py-3.5 text-sm font-bold text-white backdrop-blur-md transition-all hover:bg-slate-700 hover:border-slate-600"
              >
                <Sparkles className="h-4 w-4 text-blue-400" />
                <span>Ask AI Sales Assistant</span>
              </button>
            </div>

            {/* Trust Badges */}
            <div className="mt-12 grid grid-cols-2 gap-4 border-t border-slate-800/80 pt-8 sm:grid-cols-4 text-left">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">150-Point Certified</h4>
                  <p className="text-[11px] text-slate-400">Non-accidental promise</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400">
                  <RotateCcw className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">7-Day Guarantee</h4>
                  <p className="text-[11px] text-slate-400">100% money back</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-400">
                  <Zap className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Instant Finance</h4>
                  <p className="text-[11px] text-slate-400">Low EMI in 2 hours</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/10 text-purple-400">
                  <Truck className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Doorstep Delivery</h4>
                  <p className="text-[11px] text-slate-400">Free home test drive</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Inventory Section */}
      <section id="inventory" className="container mx-auto px-4 py-16 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-600">
              <CarFront className="h-4 w-4" />
              <span>Verified Showroom Inventory</span>
            </div>
            <h2 className="mt-1 text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
              Explore Available Vehicles
            </h2>
          </div>
          <p className="text-xs text-muted-foreground font-medium">
            Showing <span className="font-bold text-foreground">{cars.length}</span> certified cars ready for immediate delivery
          </p>
        </div>

        {/* Search & Filters */}
        <div className="mb-8">
          <SearchFilters
            filters={filters}
            onFilterChange={setFilters}
            onReset={handleResetFilters}
          />
        </div>

        {/* Cars Grid */}
        {loading ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="h-80 rounded-2xl border border-border bg-muted/40 animate-pulse"
              />
            ))}
          </div>
        ) : cars.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {cars.map((car) => (
              <CarCard
                key={car.id}
                car={car}
                onBookTestDrive={(c) => setSelectedCarForDrive(c)}
              />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-border p-12 text-center">
            <CarFront className="mx-auto h-12 w-12 text-muted-foreground opacity-50" />
            <h3 className="mt-4 text-base font-bold text-foreground">No cars match your filters</h3>
            <p className="mt-1 text-xs text-muted-foreground">
              Try adjusting your price range, fuel type, or ask our 24/7 AI Sales Assistant to source one for you.
            </p>
            <button
              onClick={handleResetFilters}
              className="mt-4 rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700 transition-colors"
            >
              Reset All Filters
            </button>
          </div>
        )}
      </section>

      {/* Test Drive Booking Modal */}
      <TestDriveModal
        car={selectedCarForDrive}
        isOpen={!!selectedCarForDrive}
        onClose={() => setSelectedCarForDrive(null)}
      />

      {/* Floating AI Chatbot Widget */}
      <ChatbotWidget />
    </div>
  );
}
