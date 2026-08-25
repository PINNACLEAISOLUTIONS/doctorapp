'use client';

import React, { useState } from 'react';
import { 
  Users, 
  Search, 
  Filter, 
  MessageSquareText, 
  Calendar, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  Building, 
  DollarSign,
  ChevronRight,
  Phone,
  Mail
} from 'lucide-react';

interface LeadStreamProps {
  leads: any[];
  onOpenTranscript: (lead: any) => void;
  onRefresh?: () => void;
}

export const LeadStream: React.FC<LeadStreamProps> = ({ leads, onOpenTranscript, onRefresh }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  const filteredLeads = leads.filter((lead) => {
    const matchesSearch =
      lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (lead.email && lead.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (lead.phone && lead.phone.includes(searchTerm)) ||
      (lead.projectDetails && lead.projectDetails.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus = statusFilter === 'All' || lead.urgencyStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Booked':
        return 'bg-emerald-950/80 text-emerald-300 border-emerald-700/60 ring-emerald-500/20';
      case 'Qualified':
        return 'bg-indigo-950/80 text-indigo-300 border-indigo-700/60 ring-indigo-500/20';
      case 'Needs Attention':
        return 'bg-amber-950/80 text-amber-300 border-amber-700/60 ring-amber-500/20';
      case 'New':
      default:
        return 'bg-sky-950/80 text-sky-300 border-sky-700/60 ring-sky-500/20';
    }
  };

  return (
    <div className="rounded-2xl border border-slate-800/80 bg-slate-900/80 backdrop-blur-xl p-5 shadow-2xl flex flex-col h-full">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Users className="h-5 w-5 text-indigo-400" />
              <span>Live Captured Lead Stream</span>
            </h3>
            <span className="rounded-full bg-indigo-950 px-2.5 py-0.5 text-xs font-mono font-bold text-indigo-300 border border-indigo-800/50">
              {filteredLeads.length} Leads
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">Autonomous CRM pipeline updated in real time</p>
        </div>

        {/* Search Input */}
        <div className="relative sm:w-64">
          <Search className="pointer-events-none absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search leads, email, scope..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-xl border border-slate-700 bg-slate-950/90 pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 py-3 border-b border-slate-800/60 text-xs overflow-x-auto">
        <span className="text-[11px] text-slate-400 px-1 font-semibold">Filter:</span>
        {['All', 'Booked', 'Qualified', 'Needs Attention', 'New'].map((st) => (
          <button
            key={st}
            onClick={() => setStatusFilter(st)}
            className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-all ${
              statusFilter === st
                ? 'bg-indigo-600 text-white font-bold shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            {st}
          </button>
        ))}
      </div>

      {/* Leads List */}
      <div className="divide-y divide-slate-800/60 mt-2 overflow-y-auto flex-1 pr-1">
        {filteredLeads.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-400 space-y-1">
            <p>No leads found matching current filters.</p>
          </div>
        ) : (
          filteredLeads.map((lead) => (
            <div
              key={lead.id}
              className="py-3.5 hover:bg-slate-800/40 rounded-xl px-3 transition-colors group flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-bold text-white group-hover:text-indigo-300 transition-colors">
                    {lead.name}
                  </span>
                  <span className={`rounded-md border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${getStatusBadge(lead.urgencyStatus)}`}>
                    {lead.urgencyStatus}
                  </span>
                  <span className="font-mono text-[11px] text-emerald-400 font-semibold bg-emerald-950/40 px-1.5 py-0.2 rounded border border-emerald-800/30">
                    Est. ${lead.estimatedValue?.toLocaleString() || '2,500'}
                  </span>
                </div>

                <div className="flex items-center gap-3 text-xs text-slate-400 flex-wrap">
                  {lead.email && (
                    <span className="flex items-center gap-1 text-slate-300">
                      <Mail className="h-3 w-3 text-indigo-400" /> {lead.email}
                    </span>
                  )}
                  {lead.phone && (
                    <span className="flex items-center gap-1 font-mono text-slate-300">
                      <Phone className="h-3 w-3 text-indigo-400" /> {lead.phone}
                    </span>
                  )}
                  <span className="text-[11px] text-slate-500 font-mono">Source: {lead.source}</span>
                </div>

                {lead.projectDetails && (
                  <p className="text-xs text-slate-300 line-clamp-1 italic mt-0.5">
                    "{lead.projectDetails}"
                  </p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 self-end sm:self-center">
                <button
                  type="button"
                  onClick={() => onOpenTranscript(lead)}
                  className="flex items-center gap-1.5 rounded-xl border border-indigo-800/40 bg-indigo-950/40 hover:bg-indigo-900/60 px-3 py-1.5 text-xs font-semibold text-indigo-300 hover:text-white transition-colors"
                >
                  <MessageSquareText className="h-3.5 w-3.5" />
                  <span>Transcript</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>

    </div>
  );
};
