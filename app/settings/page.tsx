'use client';

import React, { useState, useEffect } from 'react';
import { 
  Settings, 
  Save, 
  Building2, 
  Mail, 
  Phone, 
  Calendar, 
  CheckCircle2, 
  Sliders, 
  Clock,
  Sparkles
} from 'lucide-react';

export default function SettingsPage() {
  const [profile, setProfile] = useState<any>({
    businessName: 'Apex Growth Agency',
    industry: 'Digital Marketing & Automation',
    servicesOffered: 'SEO & PPC Growth Engine, Custom Web Portals, Workflow Automation',
    basePricing: 'Starter: $1,500/mo, Growth: $3,500/mo, Enterprise Custom: $8,000+',
    operatingHours: 'Monday - Friday: 8:00 AM - 6:00 PM EST, Saturday: 10:00 AM - 2:00 PM EST',
    notificationEmail: 'leads@apexgrowth.ai',
    notificationPhone: '+1 (555) 392-8810',
    systemPrompt: 'You are Alex, the primary customer intake specialist for Apex Growth. Your goal is to qualify customer project needs and help them schedule a consultation on our calendar.',
    calendarTimeSlots: '09:00 AM, 10:30 AM, 01:00 PM, 02:30 PM, 04:00 PM'
  });

  const [loading, setLoading] = useState(true);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    fetch('/api/settings')
      .then((res) => res.json())
      .then((data) => {
        if (data.profile) setProfile(data.profile);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profile)
      });
      const data = await res.json();
      if (data.success) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      }
    } catch (err) {
      console.error('Failed to save profile', err);
    }
  };

  return (
    <main className="min-h-[calc(100vh-3.5rem)] bg-slate-50 p-4 sm:p-6 lg:p-8 space-y-6 max-w-4xl mx-auto">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Organization & Dispatch Settings
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Configure business hours, service offerings, calendar slots, and notification endpoints
          </p>
        </div>

        {saveSuccess && (
          <div className="flex items-center gap-1.5 rounded-md bg-emerald-50 border border-emerald-200 px-3 py-1.5 text-xs text-emerald-700 font-semibold animate-in fade-in">
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            <span>Settings Saved Successfully</span>
          </div>
        )}
      </div>

      <form onSubmit={handleSave} className="space-y-5">
        
        {/* Card 1: Company Profile */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Building2 className="h-4 w-4 text-slate-700" />
            <h2 className="text-sm font-bold text-slate-900">Organization Profile & Contact</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Company Name</label>
              <input
                type="text"
                value={profile.businessName || profile.name || ''}
                onChange={(e) => setProfile({ ...profile, businessName: e.target.value, name: e.target.value })}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:border-slate-900 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Industry / Domain</label>
              <input
                type="text"
                value={profile.industry || ''}
                onChange={(e) => setProfile({ ...profile, industry: e.target.value })}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:border-slate-900 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Notification Email</label>
              <input
                type="email"
                value={profile.notificationEmail || profile.email || ''}
                onChange={(e) => setProfile({ ...profile, notificationEmail: e.target.value, email: e.target.value })}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:border-slate-900 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Dispatch Phone</label>
              <input
                type="text"
                value={profile.notificationPhone || profile.phone || ''}
                onChange={(e) => setProfile({ ...profile, notificationPhone: e.target.value, phone: e.target.value })}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:border-slate-900 focus:outline-none font-mono"
              />
            </div>
          </div>
        </div>

        {/* Card 2: Operating Hours & Booking Slots */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Clock className="h-4 w-4 text-slate-700" />
            <h2 className="text-sm font-bold text-slate-900">Operating Hours & Booking Slots</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Operating Hours</label>
              <input
                type="text"
                value={profile.operatingHours || profile.businessHours || ''}
                onChange={(e) => setProfile({ ...profile, operatingHours: e.target.value, businessHours: e.target.value })}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:border-slate-900 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Available Appointment Slots</label>
              <input
                type="text"
                value={profile.calendarTimeSlots || ''}
                onChange={(e) => setProfile({ ...profile, calendarTimeSlots: e.target.value })}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 font-mono focus:border-slate-900 focus:outline-none"
              />
            </div>
          </div>

          <div className="text-xs">
            <label className="block font-semibold text-slate-700 mb-1">Services Offered (Comma-separated)</label>
            <textarea
              rows={2}
              value={profile.servicesOffered || ''}
              onChange={(e) => setProfile({ ...profile, servicesOffered: e.target.value })}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:border-slate-900 focus:outline-none resize-none"
            />
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            className="flex items-center gap-2 rounded-lg bg-slate-900 hover:bg-slate-800 px-5 py-2 text-xs font-semibold text-white shadow-sm transition-colors cursor-pointer"
          >
            <Save className="h-4 w-4" />
            <span>Save Settings</span>
          </button>
        </div>

      </form>

    </main>
  );
}
