import Link from 'next/link';
import { CarFront, ShieldCheck, MapPin, Phone, Mail, Clock } from 'lucide-react';
import { DEALERSHIP_CONFIG } from '@/lib/dealership-config';

export function Footer() {
  return (
    <footer className="border-t border-border bg-slate-950 text-slate-300">
      <div className="container mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 text-white">
                <CarFront className="h-5 w-5" />
              </div>
              <span className="text-xl font-bold tracking-tight text-white">
                Smart<span className="text-blue-500">Car</span>
              </span>
            </div>
            <p className="text-sm text-slate-400">
              {DEALERSHIP_CONFIG.tagline}
            </p>
            <div className="flex items-center gap-2 text-xs text-emerald-400">
              <ShieldCheck className="h-4 w-4" />
              <span>100% Non-Accidental Guarantee & {DEALERSHIP_CONFIG.warrantyPeriod} Warranty</span>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-white">Quick Links</h3>
            <ul className="mt-4 space-y-2 text-sm text-slate-400">
              <li>
                <Link href="/#inventory" className="hover:text-white transition-colors">
                  Explore Inventory
                </Link>
              </li>
              <li>
                <Link href="/#finance" className="hover:text-white transition-colors">
                  EMI & Loan Calculator
                </Link>
              </li>
              <li>
                <Link href="/admin/dashboard" className="hover:text-white transition-colors">
                  Dealer Portal
                </Link>
              </li>
              <li>
                <span className="text-xs text-blue-400">24/7 AI Chatbot Assistant Available</span>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-white">{DEALERSHIP_CONFIG.hubTitle}</h3>
            <ul className="mt-4 space-y-3 text-sm text-slate-400">
              <li className="flex items-start gap-2.5">
                <MapPin className="h-4 w-4 shrink-0 text-blue-400 mt-0.5" />
                <span>{DEALERSHIP_CONFIG.address}</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="h-4 w-4 shrink-0 text-blue-400" />
                <a href={`tel:${DEALERSHIP_CONFIG.primaryPhone}`} className="hover:text-white transition-colors">
                  {DEALERSHIP_CONFIG.primaryPhone} / {DEALERSHIP_CONFIG.tollFree}
                </a>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="h-4 w-4 shrink-0 text-blue-400" />
                <a href={`mailto:${DEALERSHIP_CONFIG.salesEmail}`} className="hover:text-white transition-colors">
                  {DEALERSHIP_CONFIG.salesEmail}
                </a>
              </li>
              <li className="flex items-center gap-2.5">
                <Clock className="h-4 w-4 shrink-0 text-blue-400" />
                <span>{DEALERSHIP_CONFIG.workingHours}</span>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-white">Why SmartCar?</h3>
            <p className="mt-4 text-xs text-slate-400 leading-relaxed">
              Every vehicle undergoes a stringent 150-point technical certification, RTO background checks, zero meter tampering assurance, and 7-day money-back guarantee.
            </p>
            <div className="mt-4 rounded-xl border border-slate-800 bg-slate-900/60 p-3">
              <span className="text-xs font-semibold text-white block">AI Concierge Active</span>
              <span className="text-xs text-slate-400">Click the bottom right bubble to chat with our AI expert instantly.</span>
            </div>
          </div>
        </div>

        <div className="mt-12 border-t border-slate-800 pt-6 text-center text-xs text-slate-500">
          <p>© {new Date().getFullYear()} SmartCar Dealer Management System. Built with Next.js App Router, Supabase & Vercel AI SDK.</p>
        </div>
      </div>
    </footer>
  );
}
