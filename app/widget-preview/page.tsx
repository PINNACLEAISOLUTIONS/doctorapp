'use client';

import React, { useState } from 'react';
import { 
  CheckCircle2, 
  Code2, 
  Copy, 
  Check, 
  ArrowRight,
  ExternalLink,
  Calendar,
  Users,
  ShieldCheck
} from 'lucide-react';
import { ChatWidget } from '@/components/ChatWidget';

export default function WidgetPreviewPage() {
  const [copied, setCopied] = useState(false);

  const embedCode = `<script src="https://cdn.apexgrowth.ai/intake-widget.js" data-account-id="apex_growth_2026" async></script>`;

  const copyEmbedCode = () => {
    navigator.clipboard.writeText(embedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative min-h-[calc(100vh-3.5rem)] bg-slate-50 p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto space-y-8">
      
      {/* Hero Container */}
      <div className="rounded-xl border border-slate-200 bg-white p-8 sm:p-12 text-center space-y-6 shadow-sm">
        
        <div className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-700">
          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
          <span>Interactive Customer Intake Simulation</span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 max-w-2xl mx-auto leading-tight">
          Automated Inbound Intake & Calendar Scheduling
        </h1>

        <p className="text-sm text-slate-600 max-w-xl mx-auto leading-relaxed">
          Simulate how your visitors qualify project requirements and reserve consultations on your calendar. Test the live widget in the bottom-right corner.
        </p>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 max-w-3xl mx-auto text-left text-xs">
          <div className="p-4 rounded-lg border border-slate-200 bg-slate-50 space-y-1">
            <span className="font-semibold text-slate-900 block">Instant Reservation</span>
            <p className="text-slate-500 text-[11px]">
              Directly books available slots into your database with zero double-booking.
            </p>
          </div>

          <div className="p-4 rounded-lg border border-slate-200 bg-slate-50 space-y-1">
            <span className="font-semibold text-slate-900 block">Contact Qualification</span>
            <p className="text-slate-500 text-[11px]">
              Extracts customer names, emails, phones, and project needs into CRM.
            </p>
          </div>

          <div className="p-4 rounded-lg border border-slate-200 bg-slate-50 space-y-1">
            <span className="font-semibold text-slate-900 block">Live Dashboard Sync</span>
            <p className="text-slate-500 text-[11px]">
              Syncs immediately to the Operations & Dispatch portal.
            </p>
          </div>
        </div>

        {/* Embed Code Snippet */}
        <div className="pt-4 max-w-xl mx-auto text-left">
          <div className="flex items-center justify-between text-xs text-slate-600 mb-2">
            <span className="font-semibold flex items-center gap-1.5">
              <Code2 className="h-4 w-4 text-slate-700" /> Embed Script
            </span>
            <button
              onClick={copyEmbedCode}
              className="flex items-center gap-1 text-[11px] text-slate-700 hover:text-slate-900 font-semibold cursor-pointer"
            >
              {copied ? <Check className="h-3 w-3 text-emerald-600" /> : <Copy className="h-3 w-3" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>

          <div className="rounded-lg border border-slate-200 bg-slate-900 p-3 font-mono text-xs text-slate-100 overflow-x-auto">
            <code>{embedCode}</code>
          </div>
        </div>

      </div>

      {/* Floating Chat Widget */}
      <ChatWidget initialOpen={true} />

    </div>
  );
}
