'use client';

import React from 'react';
import { X, User, Clock, Terminal, Phone, Mail } from 'lucide-react';

interface TranscriptDrawerProps {
  lead: any | null;
  isOpen: boolean;
  onClose: () => void;
}

export const TranscriptDrawer: React.FC<TranscriptDrawerProps> = ({ lead, isOpen, onClose }) => {
  if (!isOpen || !lead) return null;

  const logs = lead.messageLogs || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-100">
      <div className="relative w-full max-w-2xl rounded-xl border border-slate-200 bg-white p-6 shadow-xl max-h-[85vh] flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-semibold text-slate-900">Inquiry Communication Log</h3>
              <span className="text-xs text-slate-700 bg-slate-100 px-2 py-0.5 rounded font-medium border border-slate-200">
                {lead.name}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1 flex items-center gap-3">
              {lead.email && <span className="flex items-center gap-1"><Mail className="h-3 w-3" /> {lead.email}</span>}
              {lead.phone && <span className="flex items-center gap-1"><Phone className="h-3 w-3" /> {lead.phone}</span>}
              <span>• Source: {lead.source}</span>
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Message Logs */}
        <div className="overflow-y-auto py-4 flex-1 space-y-3 pr-1 text-xs">
          {logs.length === 0 ? (
            <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 text-slate-600 space-y-1.5">
              <p className="font-semibold text-slate-800">Initial Project Details Recorded:</p>
              <p className="text-slate-700 bg-white p-3 rounded border border-slate-200">
                {lead.projectDetails || 'No dialogue messages saved.'}
              </p>
            </div>
          ) : (
            logs.map((log: any, idx: number) => {
              const isCustomer = log.role === 'user';
              let parsedToolCalls = null;
              if (log.toolCalls) {
                try {
                  parsedToolCalls = JSON.parse(log.toolCalls);
                } catch {}
              }

              return (
                <div
                  key={log.id || idx}
                  className={`flex gap-3 ${isCustomer ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[82%] rounded-lg p-3.5 space-y-2 border ${
                    isCustomer
                      ? 'bg-slate-900 text-white border-slate-900'
                      : 'bg-slate-50 text-slate-900 border-slate-200'
                  }`}>
                    <div className="flex items-center justify-between gap-2 pb-1 border-b border-black/10">
                      <span className="font-semibold text-[11px] opacity-80">
                        {isCustomer ? 'Customer' : 'System Intake Assistant'}
                      </span>
                    </div>

                    <p className="leading-relaxed whitespace-pre-wrap">{log.content}</p>

                    {parsedToolCalls && parsedToolCalls.length > 0 && (
                      <div className="pt-2 border-t border-slate-200 text-[11px] text-slate-600 font-mono space-y-1">
                        <span className="font-semibold text-slate-700 flex items-center gap-1">
                          <Terminal className="h-3 w-3" /> System Action:
                        </span>
                        {parsedToolCalls.map((tc: any, tIdx: number) => (
                          <div key={tIdx} className="bg-white p-2 rounded border border-slate-200 text-slate-800">
                            <span className="font-bold text-indigo-700">{tc.name}()</span>
                            <span className="text-slate-500 ml-1">Args: {JSON.stringify(tc.args)}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
          <span className="text-[11px] text-slate-400 font-mono">
            REF: #{lead.id}
          </span>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 px-3.5 py-1.5 text-xs font-semibold transition-colors"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
