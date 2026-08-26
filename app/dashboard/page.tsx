'use client';

import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Calendar, 
  TrendingUp, 
  DollarSign, 
  RefreshCw, 
  Plus, 
  Search, 
  PhoneCall, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Mail, 
  Phone, 
  ChevronRight, 
  ExternalLink,
  Filter,
  FileText
} from 'lucide-react';
import { TranscriptDrawer } from '@/components/TranscriptDrawer';

export default function DashboardPage() {
  const [statsData, setStatsData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedLeadForTranscript, setSelectedLeadForTranscript] = useState<any | null>(null);

  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  // Manual Inbound Intake Modal
  const [newLeadModalOpen, setNewLeadModalOpen] = useState(false);
  const [leadFormData, setLeadFormData] = useState({
    name: '',
    email: '',
    phone: '',
    companyName: '',
    serviceRequested: 'Growth Strategy Session',
    projectDetails: '',
    budget: '$3,500/mo',
    urgencyStatus: 'Qualified'
  });

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/dashboard/stats');
      const data = await res.json();
      if (data.success) {
        setStatsData(data);
      }
    } catch (e) {
      console.error('Failed to load dashboard stats', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleCreateLead = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...leadFormData,
          urgencyStatus: leadFormData.urgencyStatus
        })
      });
      setNewLeadModalOpen(false);
      setLeadFormData({
        name: '',
        email: '',
        phone: '',
        companyName: '',
        serviceRequested: 'Growth Strategy Session',
        projectDetails: '',
        budget: '$3,500/mo',
        urgencyStatus: 'Qualified'
      });
      fetchDashboardData();
    } catch (err) {
      console.error('Failed to create lead', err);
    }
  };

  const stats = statsData?.stats || {
    totalLeads: 8,
    qualifiedLeads: 6,
    totalAppointments: 4,
    confirmedAppointments: 4,
    conversionRate: '53.0%',
    totalPipelineValue: '$27,200',
    estimatedMonthlyValue: '$14,000'
  };

  const leads = statsData?.recentLeads || [];
  const appointments = statsData?.upcomingAppointments || [];

  // Filtered Leads
  const filteredLeads = leads.filter((lead: any) => {
    const matchesSearch =
      lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (lead.email && lead.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (lead.phone && lead.phone.includes(searchTerm)) ||
      (lead.serviceRequested && lead.serviceRequested.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (lead.projectDetails && lead.projectDetails.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus = statusFilter === 'All' || lead.urgencyStatus === statusFilter || lead.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusPill = (status: string) => {
    switch (status) {
      case 'Booked':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Qualified':
        return 'bg-sky-50 text-sky-700 border-sky-200';
      case 'Needs Attention':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'New':
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <main className="min-h-[calc(100vh-3.5rem)] bg-slate-50 p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Operations & Dispatch Portal
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Real-time customer inquiries, scheduled consultations, and conversion pipeline
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={fetchDashboardData}
            className="flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-700 shadow-sm hover:bg-slate-50 transition-colors"
            title="Refresh Table Data"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin text-slate-900' : 'text-slate-500'}`} />
            <span>Refresh</span>
          </button>

          <button
            onClick={() => setNewLeadModalOpen(true)}
            className="flex items-center gap-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 px-4 py-2 text-xs font-semibold text-white shadow-sm transition-all cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>+ Log New Call</span>
          </button>
        </div>
      </div>

      {/* Metric Cards (Top 4-Card Grid) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total Inquiries */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Total Inquiries
            </span>
            <div className="p-2 rounded-lg bg-slate-100 text-slate-700">
              <Users className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 tabular-nums">
              {stats.totalLeads}
            </span>
            <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              +12% this month
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">Inbound phone, chat & web leads</p>
        </div>

        {/* Confirmed Bookings */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Confirmed Bookings
            </span>
            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-700">
              <Calendar className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 tabular-nums">
              {stats.totalAppointments}
            </span>
            <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              {stats.conversionRate} conversion
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">Direct calendar reservations</p>
        </div>

        {/* Pending Follow-ups */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Pending Follow-ups
            </span>
            <div className="p-2 rounded-lg bg-amber-50 text-amber-700">
              <Clock className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 tabular-nums">
              {Math.max(0, stats.totalLeads - stats.totalAppointments)}
            </span>
            <span className="text-[11px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
              Requires review
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">Awaiting customer callback</p>
        </div>

        {/* Pipeline Value */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Pipeline Value
            </span>
            <div className="p-2 rounded-lg bg-indigo-50 text-indigo-700">
              <DollarSign className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 tabular-nums font-mono">
              {stats.totalPipelineValue}
            </span>
            <span className="text-[11px] font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
              Est. revenue
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">Active customer engagement potential</p>
        </div>

      </div>

      {/* Main Section: Recent Activity & Inquiries Table */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        
        {/* Table Toolbar */}
        <div className="p-4 sm:p-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white">
          <div>
            <h2 className="text-base font-semibold text-slate-900">
              Recent Activity & Inquiries
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Live customer records captured via online intake, direct chat, and inbound calls
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Search Bar */}
            <div className="relative w-full sm:w-64">
              <Search className="pointer-events-none absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search name, email, service..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-slate-50 pl-9 pr-3 py-1.5 text-xs text-slate-900 placeholder-slate-400 focus:border-slate-900 focus:bg-white focus:outline-none transition-colors"
              />
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-lg border border-slate-300 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-700 focus:border-slate-900 focus:outline-none"
            >
              <option value="All">All Statuses</option>
              <option value="Booked">Booked</option>
              <option value="Qualified">Qualified</option>
              <option value="New">New</option>
            </select>
          </div>
        </div>

        {/* Full Width Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-semibold text-slate-600 uppercase tracking-wider">
                <th className="py-3 px-4">Customer Name & Contact</th>
                <th className="py-3 px-4">Service Requested</th>
                <th className="py-3 px-4">Date / Time</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Est. Value</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredLeads.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500">
                    No inquiries found matching your filter criteria.
                  </td>
                </tr>
              ) : (
                filteredLeads.map((lead: any) => {
                  const appointment = lead.appointments?.[0] || appointments.find((a: any) => a.leadId === lead.id);

                  return (
                    <tr key={lead.id} className="hover:bg-slate-50/80 transition-colors">
                      
                      {/* Customer Name & Contact */}
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-900">{lead.name}</div>
                        <div className="text-[11px] text-slate-500 flex items-center gap-3 mt-0.5">
                          {lead.email && <span>{lead.email}</span>}
                          {lead.phone && <span className="font-mono">{lead.phone}</span>}
                        </div>
                      </td>

                      {/* Service Requested */}
                      <td className="py-3.5 px-4 text-slate-700">
                        <div className="font-medium text-slate-900">
                          {lead.serviceRequested || 'Growth Strategy Session'}
                        </div>
                        {lead.projectDetails && (
                          <div className="text-[11px] text-slate-500 line-clamp-1 italic mt-0.5">
                            "{lead.projectDetails}"
                          </div>
                        )}
                      </td>

                      {/* Date / Time */}
                      <td className="py-3.5 px-4 text-slate-600 tabular-nums">
                        {appointment ? (
                          <div>
                            <div className="font-semibold text-slate-900">{appointment.date}</div>
                            <div className="text-[11px] text-slate-500 font-medium">{appointment.timeSlot}</div>
                          </div>
                        ) : (
                          <div>
                            <div>{new Date(lead.createdAt).toLocaleDateString()}</div>
                            <div className="text-[11px] text-slate-400">{new Date(lead.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                          </div>
                        )}
                      </td>

                      {/* Status Badge */}
                      <td className="py-3.5 px-4">
                        <span className={`inline-flex items-center rounded-md border px-2 py-0.5 text-[11px] font-semibold ${getStatusPill(lead.urgencyStatus || lead.status)}`}>
                          {lead.urgencyStatus || lead.status}
                        </span>
                      </td>

                      {/* Estimated Value */}
                      <td className="py-3.5 px-4 text-right font-mono font-medium text-slate-900 tabular-nums">
                        ${lead.estimatedValue?.toLocaleString() || '2,500'}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right space-x-2 whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => setSelectedLeadForTranscript(lead)}
                          className="inline-flex items-center gap-1 rounded-md border border-slate-300 bg-white hover:bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-700 shadow-sm transition-colors cursor-pointer"
                        >
                          <FileText className="h-3.5 w-3.5 text-slate-500" />
                          <span>View Details</span>
                        </button>

                        {appointment?.meetingLink ? (
                          <a
                            href={appointment.meetingLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 rounded-md bg-slate-900 hover:bg-slate-800 px-2.5 py-1 text-xs font-semibold text-white shadow-sm transition-colors"
                          >
                            <span>Join Meet</span>
                            <ExternalLink className="h-3 w-3 opacity-70" />
                          </a>
                        ) : (
                          <a
                            href={`tel:${lead.phone || ''}`}
                            className="inline-flex items-center gap-1 rounded-md border border-slate-300 bg-white hover:bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-700 shadow-sm transition-colors"
                          >
                            <PhoneCall className="h-3 w-3 text-slate-500" />
                            <span>Call</span>
                          </a>
                        )}
                      </td>

                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer Summary */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs text-slate-500">
          <span>Showing {filteredLeads.length} of {leads.length} total customer records</span>
          <span className="font-mono">Database Synced</span>
        </div>

      </div>

      {/* Transcript / Ingestion Details Modal */}
      <TranscriptDrawer
        lead={selectedLeadForTranscript}
        isOpen={!!selectedLeadForTranscript}
        onClose={() => setSelectedLeadForTranscript(null)}
        onUpdate={fetchDashboardData}
      />

      {/* Manual Inbound Intake Modal */}
      {newLeadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-100">
          <div className="relative w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-xl">
            <h3 className="text-base font-bold text-slate-900 mb-0.5">Log Inbound Customer Inquiry</h3>
            <p className="text-xs text-slate-500 mb-4">Record call or manual contact directly into operational dispatch</p>

            <form onSubmit={handleCreateLead} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Customer Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rachel Adams"
                  value={leadFormData.name}
                  onChange={(e) => setLeadFormData({ ...leadFormData, name: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 placeholder-slate-400 focus:border-slate-900 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Email</label>
                  <input
                    type="email"
                    placeholder="rachel@company.com"
                    value={leadFormData.email}
                    onChange={(e) => setLeadFormData({ ...leadFormData, email: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 placeholder-slate-400 focus:border-slate-900 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Phone</label>
                  <input
                    type="text"
                    placeholder="(555) 000-0000"
                    value={leadFormData.phone}
                    onChange={(e) => setLeadFormData({ ...leadFormData, phone: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 placeholder-slate-400 focus:border-slate-900 focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Service Requested</label>
                <input
                  type="text"
                  placeholder="e.g. Growth Consultation, System Revamp"
                  value={leadFormData.serviceRequested}
                  onChange={(e) => setLeadFormData({ ...leadFormData, serviceRequested: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 placeholder-slate-400 focus:border-slate-900 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Project Scope & Customer Notes</label>
                <textarea
                  rows={2}
                  placeholder="Customer requested consultation regarding workflow scaling..."
                  value={leadFormData.projectDetails}
                  onChange={(e) => setLeadFormData({ ...leadFormData, projectDetails: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 placeholder-slate-400 focus:border-slate-900 focus:outline-none resize-none"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setNewLeadModalOpen(false)}
                  className="w-1/2 rounded-lg border border-slate-300 bg-slate-100 hover:bg-slate-200 px-3 py-2 font-semibold text-slate-700 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-1/2 rounded-lg bg-slate-900 hover:bg-slate-800 px-3 py-2 font-bold text-white shadow-sm cursor-pointer"
                >
                  Save Inquiry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </main>
  );
}
