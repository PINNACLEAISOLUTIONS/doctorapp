import { NextRequest, NextResponse } from 'next/server';
import { runAgentConversation, runAgentOrchestrator } from '@/lib/agent';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { message, sessionId, history = [], leadId } = body;

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'A valid message string is required' },
        { status: 400 }
      );
    }

    // Fetch active business profile
    const profile = await prisma.businessProfile.findFirst();
    const businessConfig = {
      name: profile?.name || profile?.businessName || 'LeadRescue AI Solutions',
      services: profile?.servicesOffered ? profile.servicesOffered.split(',').map(s => s.trim()) : ['AI Lead Qualification', 'Calendar Booking', 'CRM Sync'],
      businessHours: profile?.businessHours || profile?.operatingHours || 'Mon-Fri 8am-6pm EST',
      serviceArea: profile?.serviceArea || 'Nationwide & Global Remote',
      phone: profile?.phone || profile?.notificationPhone || '+1 (555) 392-8810',
      systemPrompt: profile?.systemPrompt
    };

    const result = await runAgentOrchestrator(
      history,
      message,
      businessConfig
    );

    // Persist to MessageLog
    const sessionKey = sessionId || `session_${Date.now()}`;
    try {
      await prisma.messageLog.create({
        data: {
          sessionId: sessionKey,
          leadId: result.lead?.id || result.appointment?.leadId || leadId || null,
          role: 'user',
          content: message
        }
      });
      await prisma.messageLog.create({
        data: {
          sessionId: sessionKey,
          leadId: result.lead?.id || result.appointment?.leadId || leadId || null,
          role: 'assistant',
          content: result.reply,
          toolCalls: result.toolCallsExecuted.length > 0 ? JSON.stringify(result.toolCallsExecuted) : null
        }
      });
    } catch (dbErr) {
      console.warn('MessageLog save note:', dbErr);
    }

    return NextResponse.json({
      success: true,
      reply: result.reply,
      updatedHistory: result.updatedHistory,
      toolCallsExecuted: result.toolCallsExecuted,
      bookingConfirmed: result.bookingConfirmed,
      appointment: result.appointment,
      lead: result.lead,
      sessionId: sessionKey
    });
  } catch (error: any) {
    console.error('Agent chat API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error?.message || 'Internal agent execution error',
        reply: "I'm experiencing a brief system latency, but I've noted your inquiry. Would you like to leave your name and email so our team can follow up directly?"
      },
      { status: 500 }
    );
  }
}
