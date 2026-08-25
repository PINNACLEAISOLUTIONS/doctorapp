'use client';

import React from 'react';
import { Calendar, Clock, Video, CheckCircle2, User, Sparkles, ExternalLink } from 'lucide-react';

interface CalendarAgendaProps {
  appointments: any[];
  onRefresh?: () => void;
}

export const CalendarAgenda: React.FC<CalendarAgendaProps> = ({ appointments, onRefresh }) => {
  return (
    <div className="rounded-2xl border border-slate-800/80 bg-slate-900/80 backdrop-blur-xl p-5 shadow-2xl flex flex-col h-full">
      
      <div className="flex items-center justify-between pb-4 border-b border-slate-800">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Calendar className="h-5 w-5 text-indigo-400" />
            <span>Confirmed Discovery Sessions</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">Autonomous appointments booked directly via AI</p>
        </div>
        <span className="rounded-full bg-emerald-950 px-2.5 py-0.5 text-xs font-mono font-bold text-emerald-300 border border-emerald-800/50">
          {appointments.length} Scheduled
        </span>
      </div>

      <div className="mt-4 space-y-3 overflow-y-auto flex-1 pr-1">
        {appointments.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-400">
            No upcoming sessions booked yet. Ask the AI agent in the chat widget to schedule one!
          </div>
        ) : (
          appointments.map((app) => (
            <div
              key={app.id}
              className="p-3.5 rounded-xl border border-slate-800/80 bg-slate-950/70 hover:border-indigo-700/50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            >
              <div className="flex items-start gap-3">
                <div className="flex flex-col items-center justify-center rounded-xl bg-slate-900 px-3 py-2 border border-slate-800 text-center min-w-[70px]">
                  <span className="font-mono text-xs font-extrabold text-white">{app.date}</span>
                  <span className="text-[11px] text-indigo-400 font-bold">{app.timeSlot}</span>
                </div>

                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-white">{app.clientName}</span>
                    <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/60 px-1.5 py-0.2 rounded border border-emerald-800/40">
                      {app.status}
                    </span>
                  </div>
                  <p className="text-xs text-indigo-300 font-medium">{app.serviceType}</p>
                  <p className="text-[11px] text-slate-400">{app.clientEmail}</p>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-center">
                <a
                  href={app.meetingLink || 'https://meet.google.com/apx-grow-demo'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 px-3 py-1.5 text-xs font-bold text-white shadow-md shadow-indigo-600/20 transition-all"
                >
                  <Video className="h-3.5 w-3.5" />
                  <span>Join Meet</span>
                  <ExternalLink className="h-3 w-3 opacity-70" />
                </a>
              </div>
            </div>
          ))
        )}
      </div>

    </div>
  );
};
