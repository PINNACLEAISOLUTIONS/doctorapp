import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { runAgentConversation } from '@/lib/agent';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.json().catch(() => ({}));
    
    // Support Twilio / Form / Webhook payload variants
    const fromPhone = rawBody.From || rawBody.phone || rawBody.sender;
    const bodyText = rawBody.Body || rawBody.message || rawBody.notes || 'Inbound inquiry via webhook';
    const callerName = rawBody.name || rawBody.callerName || (fromPhone ? `Inbound (${fromPhone})` : 'New Inbound Lead');
    const email = rawBody.email || rawBody.Email || undefined;
    const source = rawBody.source || (rawBody.From ? 'Inbound SMS Webhook' : 'External Webform Webhook');

    // 1. Initialize or find lead
    let lead = await prisma.lead.findFirst({
      where: {
        OR: [
          fromPhone ? { phone: fromPhone } : undefined,
          email ? { email } : undefined
        ].filter(Boolean) as any
      }
    });

    if (!lead) {
      lead = await prisma.lead.create({
        data: {
          name: callerName,
          phone: fromPhone,
          email,
          serviceRequested: 'Inbound Inquiry',
          projectDetails: bodyText,
          urgencyStatus: 'Qualified',
          status: 'Qualified',
          source
        }
      });
    } else {
      lead = await prisma.lead.update({
        where: { id: lead.id },
        data: {
          projectDetails: `${lead.projectDetails || ''} | ${bodyText}`,
          urgencyStatus: 'Needs Attention',
          status: 'Needs Attention'
        }
      });
    }

    // 2. Fire agent qualification run
    const agentResponse = await runAgentConversation({
      sessionId: `webhook_${lead.id}`,
      leadId: lead.id,
      userMessage: bodyText
    });

    return NextResponse.json({
      success: true,
      leadId: lead.id,
      leadName: lead.name,
      agentReply: agentResponse.reply,
      toolCalls: agentResponse.toolCallsExecuted,
      bookingConfirmed: agentResponse.bookingConfirmed,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('Inbound webhook error:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Webhook processing failed' },
      { status: 500 }
    );
  }
}
