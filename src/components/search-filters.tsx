'use client';

import { Search, SlidersHorizontal, RotateCcw } from 'lucide-react';
import { CarFilters } from '@/types';

interface SearchFiltersProps {
  filters: CarFilters;
  onFilterChange: (filters: CarFilters) => void;
  onReset: () => void;
}

export function SearchFilters({ filters, onFilterChange, onReset }: SearchFiltersProps) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-lg">
      <div className="flex flex-col gap-4">
        {/* Search Bar */}
        <div className="relative w-full">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by make or model (e.g. Honda City, Creta, Fortuner)..."
            value={filters.searchQuery || ''}
            onChange={(e) => onFilterChange({ ...filters, searchQuery: e.target.value })}
            className="w-full rounded-xl border border-input bg-background py-2.5 pl-10 pr-4 text-sm focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600"
          />
        </div>

        {/* Dropdown Filters */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {/* Make Filter */}
          <div>
            <label className="mb-1 block text-xs font-semibold text-muted-foreground uppercase">
              Brand / Make
            </label>
            <select
              value={filters.make || 'all'}
              onChange={(e) => onFilterChange({ ...filters, make: e.target.value })}
              className="w-full rounded-lg border border-input bg-background p-2 text-xs font-medium focus:border-blue-600 focus:outline-none"
            >
              <option value="all">All Brands</option>
              <option value="Honda">Honda</option>
              <option value="Hyundai">Hyundai</option>
              <option value="Tata">Tata</option>
              <option value="Toyota">Toyota</option>
              <option value="Maruti Suzuki">Maruti Suzuki</option>
              <option value="Mahindra">Mahindra</option>
            </select>
          </div>

          {/* Fuel Type */}
          <div>
            <label className="mb-1 block text-xs font-semibold text-muted-foreground uppercase">
              Fuel Type
            </label>
            <select
              value={filters.fuel_type || 'all'}
              onChange={(e) => onFilterChange({ ...filters, fuel_type: e.target.value })}
              className="w-full rounded-lg border border-input bg-background p-2 text-xs font-medium focus:border-blue-600 focus:outline-none"
            >
              <option value="all">All Fuels</option>
              <option value="petrol">Petrol</option>
              <option value="diesel">Diesel</option>
              <option value="electric">Electric (EV)</option>
              <option value="hybrid">Hybrid</option>
              <option value="cng">CNG</option>
            </select>
          </div>

          {/* Max Price Budget */}
          <div>
            <label className="mb-1 block text-xs font-semibold text-muted-foreground uppercase">
              Max Budget
            </label>
            <select
              value={filters.maxPrice ? String(filters.maxPrice) : 'all'}
              onChange={(e) =>
                onFilterChange({
                  ...filters,
                  maxPrice: e.target.value === 'all' ? undefined : Number(e.target.value),
                })
              }
              className="w-full rounded-lg border border-input bg-background p-2 text-xs font-medium focus:border-blue-600 focus:outline-none"
            >
              <option value="all">Any Budget</option>
              <option value="300000">Under ₹3 Lakhs (Budget)</option>
              <option value="500000">Under ₹5 Lakhs (Affordable)</option>
              <option value="800000">Under ₹8 Lakhs</option>
              <option value="1200000">Under ₹12 Lakhs</option>
              <option value="1800000">Under ₹18 Lakhs</option>
              <option value="3500000">Under ₹35 Lakhs</option>
            </select>
          </div>

          {/* Transmission */}
          <div>
            <label className="mb-1 block text-xs font-semibold text-muted-foreground uppercase">
              Transmission
            </label>
            <select
              value={filters.transmission || 'all'}
              onChange={(e) => onFilterChange({ ...filters, transmission: e.target.value })}
              className="w-full rounded-lg border border-input bg-background p-2 text-xs font-medium focus:border-blue-600 focus:outline-none"
            >
              <option value="all">All Transmissions</option>
              <option value="automatic">Automatic</option>
              <option value="manual">Manual</option>
            </select>
          </div>
        </div>

        {/* Quick Filter Reset */}
        <div className="flex justify-end pt-1">
          <button
            type="button"
            onClick={onReset}
            className="flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Reset Filters</span>
          </button>
        </div>
      </div>
    </div>
  );
}
