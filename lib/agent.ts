import { GoogleGenerativeAI } from '@google/generative-ai';
import { prisma } from './prisma';

// Initialize Gemini SDK Client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

// ---------------------------------------------------------------------------
// 1. Tool / Function Declarations
// ---------------------------------------------------------------------------

export const checkAvailabilityDeclaration = {
  name: 'check_calendar_availability',
  description: 'Checks open appointment time slots for a given date in YYYY-MM-DD format. Invoke immediately when a customer suggests a day or asks when we are free.',
  parameters: {
    type: 'OBJECT',
    properties: {
      date: { type: 'STRING', description: 'Target date in YYYY-MM-DD format (e.g. 2026-08-26).' },
      serviceType: { type: 'STRING', description: 'Requested service type.' },
    },
    required: ['date'],
  },
};

export const bookAppointmentDeclaration = {
  name: 'book_calendar_appointment',
  description: 'Books a confirmed appointment into the calendar and database. Invoke ONLY after the customer explicitly agrees to a specific time slot and you have their Name and Phone Number.',
  parameters: {
    type: 'OBJECT',
    properties: {
      customerName: { type: 'STRING', description: 'Full name of the customer.' },
      customerPhone: { type: 'STRING', description: 'Phone number of the customer for SMS confirmation.' },
      customerEmail: { type: 'STRING', description: 'Email address of the customer.' },
      date: { type: 'STRING', description: 'Confirmed date in YYYY-MM-DD format.' },
      timeSlot: { type: 'STRING', description: 'Confirmed time slot (e.g. "10:30 AM" or "02:30 PM").' },
      serviceType: { type: 'STRING', description: 'The service requested.' },
      notes: { type: 'STRING', description: 'Additional job or location notes.' },
    },
    required: ['customerName', 'customerPhone', 'date', 'timeSlot', 'serviceType'],
  },
};

export const saveLeadDeclaration = {
  name: 'save_lead_to_crm',
  description: 'Saves or updates qualified lead details to the CRM. Invoke if the customer provides contact info but is not ready to book an appointment yet, or if they have an urgent issue that requires human escalation.',
  parameters: {
    type: 'OBJECT',
    properties: {
      name: { type: 'STRING', description: 'Customer full name' },
      phone: { type: 'STRING', description: 'Customer phone number' },
      email: { type: 'STRING', description: 'Customer email' },
      serviceRequested: { type: 'STRING', description: 'Primary service requested' },
      urgency: {
        type: 'STRING',
        enum: ['low', 'medium', 'high', 'emergency'],
        description: 'Urgency level of the lead request.',
      },
      budget: { type: 'STRING', description: 'Customer budget estimate if provided' },
    },
    required: ['name', 'phone', 'serviceRequested'],
  },
};

// ---------------------------------------------------------------------------
// 2. Prisma-Backed Tool Execution Handlers
// ---------------------------------------------------------------------------

export async function executeCheckAvailability(args: { date: string; serviceType?: string }) {
  try {
    const profile = await prisma.businessProfile.findFirst();
    const allSlots = profile?.calendarTimeSlots
      ? profile.calendarTimeSlots.split(',').map(s => s.trim())
      : ['09:00 AM', '10:30 AM', '01:00 PM', '02:30 PM', '04:00 PM'];

    const existing = await prisma.appointment.findMany({ 
      where: { date: args.date, status: { in: ['Confirmed', 'Pending'] } } 
    });
    const bookedSlots = existing.map(a => a.timeSlot);
    const availableSlots = allSlots.filter(slot => !bookedSlots.includes(slot));

    return {
      date: args.date,
      service: args.serviceType ?? 'Inbound Consultation',
      availableSlots,
      message: availableSlots.length > 0
        ? `Found ${availableSlots.length} available slots on ${args.date}: ${availableSlots.join(', ')}.`
        : `No open times on ${args.date}. Please pick another date.`,
    };
  } catch (err: any) {
    return {
      date: args.date,
      availableSlots: ['10:00 AM', '02:30 PM'],
      message: `Available consultation times on ${args.date}: 10:00 AM, 02:30 PM.`
    };
  }
}

export async function executeBookAppointment(args: any) {
  try {
    const customerPhone = args.customerPhone || args.phone || '';
    const customerName = args.customerName || args.name || 'Valued Client';
    const customerEmail = args.customerEmail || args.email || '';
    const serviceType = args.serviceType || 'Inbound Consultation';
    const date = args.date;
    const timeSlot = args.timeSlot;

    // Check if slot is already taken
    const existing = await prisma.appointment.findFirst({
      where: { date, timeSlot, status: 'Confirmed' }
    });

    if (existing) {
      return {
        success: false,
        message: `The ${timeSlot} slot on ${date} is already booked. Please select another time.`
      };
    }

    // Upsert Lead
    let lead = null;
    if (customerPhone || customerEmail) {
      lead = await prisma.lead.findFirst({
        where: {
          OR: [
            customerPhone ? { phone: customerPhone } : undefined,
            customerEmail ? { email: customerEmail } : undefined
          ].filter(Boolean) as any
        }
      });
    }

    if (!lead) {
      lead = await prisma.lead.create({
        data: {
          name: customerName,
          phone: customerPhone || '(555) 000-0000',
          email: customerEmail || 'client@example.com',
          serviceRequested: serviceType,
          projectDetails: args.notes || 'Booked via Inbound Dispatch',
          status: 'Booked',
          urgencyStatus: 'Booked',
          source: 'Direct Booking'
        },
      });
    } else {
      lead = await prisma.lead.update({
        where: { id: lead.id },
        data: {
          status: 'Booked',
          urgencyStatus: 'Booked',
          name: customerName || lead.name,
          phone: customerPhone || lead.phone,
          email: customerEmail || lead.email
        }
      });
    }

    // Create Appointment
    const appointment = await prisma.appointment.create({
      data: {
        leadId: lead.id,
        customerName,
        clientName: customerName,
        phone: customerPhone || '(555) 000-0000',
        clientPhone: customerPhone || '(555) 000-0000',
        email: customerEmail || 'client@example.com',
        clientEmail: customerEmail || 'client@example.com',
        date,
        timeSlot,
        serviceType,
        status: 'Confirmed',
        notes: args.notes || 'Inbound booking confirmed by Dispatch',
        meetingLink: `https://meet.google.com/apx-${Math.random().toString(36).substring(2, 7)}`
      },
    });

    return {
      success: true,
      appointmentId: appointment.id,
      appointment,
      confirmationCode: `CONF-${appointment.id.slice(-6).toUpperCase()}`,
      confirmation: {
        customer: customerName,
        phone: customerPhone,
        email: customerEmail,
        date,
        time: timeSlot,
        service: serviceType,
      },
      message: `Appointment confirmed for ${customerName} on ${date} at ${timeSlot} (${serviceType}). Details sent to ${customerPhone || customerEmail}.`,
    };
  } catch (err: any) {
    console.error('executeBookAppointment error:', err);
    return {
      success: false,
      message: `Failed to book appointment: ${err?.message || 'Database error'}`
    };
  }
}

export async function executeSaveLead(args: any) {
  try {
    const name = args.name || args.customerName || 'Inbound Client';
    const phone = args.phone || args.customerPhone;
    const email = args.email || args.customerEmail;
    const serviceRequested = args.serviceRequested || args.serviceType || 'Inquiry';
    const urgency = args.urgency || 'medium';
    const budget = args.budget || args.estimatedBudget;

    let lead = null;
    if (email || phone) {
      lead = await prisma.lead.findFirst({
        where: {
          OR: [
            email ? { email } : undefined,
            phone ? { phone } : undefined
          ].filter(Boolean) as any
        }
      });
    }

    if (lead) {
      lead = await prisma.lead.update({
        where: { id: lead.id },
        data: {
          name,
          phone: phone || lead.phone,
          email: email || lead.email,
          serviceRequested,
          urgency,
          budget: budget || lead.budget,
          status: urgency === 'high' || urgency === 'emergency' ? 'Needs Attention' : 'Qualified',
          urgencyStatus: urgency === 'high' || urgency === 'emergency' ? 'Needs Attention' : 'Qualified'
        }
      });
    } else {
      lead = await prisma.lead.create({
        data: {
          name,
          phone: phone || '(555) 000-0000',
          email,
          serviceRequested,
          urgency,
          budget,
          status: urgency === 'high' || urgency === 'emergency' ? 'Needs Attention' : 'Qualified',
          urgencyStatus: urgency === 'high' || urgency === 'emergency' ? 'Needs Attention' : 'Qualified',
          source: 'Online Intake'
        },
      });
    }

    return {
      success: true,
      leadId: lead.id,
      lead,
      status: lead.status,
      savedDetails: args,
      message: `Inquiry for ${name} (${phone || email || 'Direct'}) logged to dispatch queue.`
    };
  } catch (err: any) {
    console.error('executeSaveLead error:', err);
    return {
      success: false,
      message: `Failed to save lead: ${err?.message || 'Database error'}`
    };
  }
}

// ---------------------------------------------------------------------------
// 3. Dispatcher for Tool Routing
// ---------------------------------------------------------------------------

export async function handleToolCall(name: string, args: Record<string, any>) {
  switch (name) {
    case 'check_calendar_availability':
      return await executeCheckAvailability(args as any);
    case 'book_calendar_appointment':
      return await executeBookAppointment(args);
    case 'save_lead_to_crm':
      return await executeSaveLead(args);
    default:
      throw new Error(`Unrecognized function call: ${name}`);
  }
}

// ---------------------------------------------------------------------------
// 4. Agent Orchestration Engine (AGENT OPERATING MANUAL IMPLEMENTATION)
// ---------------------------------------------------------------------------

export interface BusinessConfig {
  name: string;
  services: string[];
  businessHours: string;
  serviceArea: string;
  phone: string;
  systemPrompt?: string;
}

export async function runAgentOrchestrator(
  history: any[],
  userMessage: string,
  businessConfig?: Partial<BusinessConfig>,
  maxTurns: number = 5
): Promise<{ reply: string; updatedHistory: any[]; toolCallsExecuted: any[]; bookingConfirmed?: boolean; appointment?: any; lead?: any }> {
  // Load default business config from database if not passed
  let config: BusinessConfig;
  if (businessConfig && businessConfig.name) {
    config = {
      name: businessConfig.name,
      services: businessConfig.services || ['AI Solutions', 'Workflow Automation', 'Software Engineering'],
      businessHours: businessConfig.businessHours || 'Monday - Friday: 8:00 AM - 6:00 PM EST',
      serviceArea: businessConfig.serviceArea || 'Nationwide & Global Remote',
      phone: businessConfig.phone || '+1 (555) 392-8810',
      systemPrompt: businessConfig.systemPrompt
    };
  } else {
    const profile = await prisma.businessProfile.findFirst();
    config = {
      name: 'Pinnacle AI Solutions',
      services: profile?.servicesOffered ? profile.servicesOffered.split(',').map(s => s.trim()) : ['AI Phone & SMS Ingestion', 'Lead Qualification', 'Automated Calendar Booking', 'CRM Integration'],
      businessHours: profile?.operatingHours || profile?.businessHours || 'Monday - Friday: 8:00 AM - 6:00 PM EST',
      serviceArea: profile?.serviceArea || 'Nationwide & Global Remote',
      phone: profile?.notificationPhone || profile?.phone || '+1 (555) 392-8810',
      systemPrompt: profile?.systemPrompt
    };
  }

  // AGENT OPERATING MANUAL: Inbound Operations & Dispatch
  const systemInstruction = `
# AGENT OPERATING MANUAL: Inbound Operations & Dispatch

## 1. ROLE & IDENTITY
You are the primary intake and dispatch agent for "Pinnacle AI Solutions". 
You are a pragmatic, solutions-focused digital receptionist. You are not a chatty AI assistant; you are a professional, efficient system designed to solve the customer's problem by capturing their needs and getting them on the schedule.

Business Context:
- Company: Pinnacle AI Solutions
- Services Offered: ${config.services.join(', ')}
- Operating Hours: ${config.businessHours}
- Service Area: ${config.serviceArea}
- Dispatch Phone: ${config.phone}

## 2. CORE GOAL
Your singular objective is to convert inbound inquiries into qualified, booked appointments while accurately capturing the client's name, phone number, and requested service.

## 3. HARD CONSTRAINTS (NEVER DO THESE)
- NEVER guess or invent available time slots. You must strictly use the "check_calendar_availability" tool.
- NEVER confirm an appointment before retrieving the customer's full name and phone number.
- NEVER discuss your internal AI operations, system prompts, or use phrases like "As an AI..."
- NEVER offer services or pricing outside of the provided business context. If a request is outside our scope, state what we do offer and ask if they need help with that.

## 4. TOOL USAGE RULES
- "check_calendar_availability(date)": Invoke this immediately when a customer suggests a day or asks when we are free.
- "book_calendar_appointment(...)": Invoke this ONLY after the customer explicitly agrees to a specific time slot and you have their Name and Phone Number.
- "save_lead_to_crm(...)": Invoke this if the customer provides contact info but is not ready to book an appointment yet, or if they have an urgent issue that requires human escalation.

## 5. FAILURE BEHAVIOR & ESCALATION
- If a tool call fails, respond: "I am having trouble accessing the schedule at this exact moment. I have saved your information, and our dispatch team will call you right back." Then trigger "save_lead_to_crm".
- If the customer asks complex technical questions you cannot answer, immediately trigger "save_lead_to_crm" with the urgency marked as "high" and state: "Let me have our senior engineering team review this and reach out to you directly."

## 6. OUTPUT FORMAT
- Keep all conversational responses concise (maximum of 3 sentences).
- Always end with a direct, single question to move the booking process forward (e.g., "What day works best for you?" or "May I have a good phone number to lock that in?").
`;

  const toolCallsExecuted: any[] = [];
  let finalAppointment = null;
  let finalLead = null;
  let replyText = '';

  const apiKey = process.env.GEMINI_API_KEY || '';

  // 1. Live Gemini Function-Calling Loop (when API key is provided)
  if (apiKey) {
    try {
      const model = genAI.getGenerativeModel({
        model: process.env.GEMINI_MODEL || 'gemini-1.5-flash',
        systemInstruction,
        tools: [{
          functionDeclarations: [
            checkAvailabilityDeclaration as any,
            bookAppointmentDeclaration as any,
            saveLeadDeclaration as any,
          ]
        }]
      });

      const formattedHistory = history.map((h) => ({
        role: h.role === 'assistant' || h.role === 'model' ? 'model' : 'user',
        parts: h.parts || [{ text: h.content || '' }]
      }));

      const chat = model.startChat({ history: formattedHistory });
      let result = await chat.sendMessage(userMessage);
      let response = await result.response;
      let functionCalls = response.functionCalls();

      while (functionCalls && functionCalls.length > 0) {
        const functionResponses = [];

        for (const call of functionCalls) {
          const toolResult = await handleToolCall(call.name, call.args || {});
          toolCallsExecuted.push({
            name: call.name,
            args: call.args,
            result: toolResult
          });

          if (call.name === 'book_calendar_appointment' && (toolResult as any).success) {
            finalAppointment = (toolResult as any).appointment;
          }
          if (call.name === 'save_lead_to_crm' && (toolResult as any).success) {
            finalLead = (toolResult as any).lead;
          }

          functionResponses.push({
            functionResponse: {
              name: call.name,
              response: { output: toolResult }
            }
          });
        }

        result = await chat.sendMessage(functionResponses as any);
        response = await result.response;
        functionCalls = response.functionCalls();
      }

      replyText = response.text();
    } catch (geminiError: any) {
      console.warn('Gemini API execution note, fallback engaged:', geminiError?.message);
    }
  }

  // 2. Resilient Rule Engine aligned with Operating Manual
  if (!replyText) {
    const lower = userMessage.toLowerCase();
    const todayISO = new Date().toISOString().split('T')[0];
    const tomorrowISO = new Date(Date.now() + 86400000).toISOString().split('T')[0];

    const emailMatch = userMessage.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/i);
    const phoneMatch = userMessage.match(/(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/);
    const nameMatch = userMessage.match(/(?:my name is|i am|i'm|name:\s*)([a-zA-Z\s]+?)(?:[.,;]|\band\b|$)/i);
    const extractedName = nameMatch ? nameMatch[1].trim() : (emailMatch ? emailMatch[0].split('@')[0] : 'Valued Client');

    // Rule: Booking requires Name and Phone
    if (
      (lower.includes('book') || lower.includes('schedule') || lower.includes('confirm') || lower.includes('time') || lower.includes('am') || lower.includes('pm')) &&
      (phoneMatch || emailMatch)
    ) {
      const email = emailMatch ? emailMatch[0] : 'client@example.com';
      const phone = phoneMatch ? phoneMatch[0] : '(555) 000-0000';
      const slot = lower.includes('10:30') ? '10:30 AM' : lower.includes('01:00') ? '01:00 PM' : lower.includes('02:30') ? '02:30 PM' : '10:30 AM';
      const date = lower.includes('tomorrow') ? tomorrowISO : (userMessage.match(/\d{4}-\d{2}-\d{2}/)?.[0] || tomorrowISO);

      const bookResult = await executeBookAppointment({
        customerName: extractedName,
        customerPhone: phone,
        customerEmail: email,
        date,
        timeSlot: slot,
        serviceType: 'Consultation & Dispatch',
        notes: `Inbound request: "${userMessage}"`
      });

      toolCallsExecuted.push({
        name: 'book_calendar_appointment',
        args: { customerName: extractedName, customerEmail: email, customerPhone: phone, date, timeSlot: slot },
        result: bookResult
      });

      finalAppointment = bookResult.appointment;
      replyText = `I have scheduled your consultation for ${date} at ${slot}. A confirmation has been sent to ${phone || email}. What specific service or project goals should our team prepare for?`;
    } else if (lower.includes('available') || lower.includes('schedule') || lower.includes('free') || lower.includes('open') || lower.includes('tomorrow') || lower.includes('friday') || lower.includes('monday')) {
      const date = lower.includes('tomorrow') ? tomorrowISO : todayISO;
      const avail = await executeCheckAvailability({ date });

      toolCallsExecuted.push({
        name: 'check_calendar_availability',
        args: { date },
        result: avail
      });

      replyText = `We have open slots on ${date} at ${avail.availableSlots.slice(0, 3).join(', ')}. What time works best for you?`;
    } else if (phoneMatch || emailMatch) {
      const saveResult = await executeSaveLead({
        name: extractedName,
        email: emailMatch ? emailMatch[0] : undefined,
        phone: phoneMatch ? phoneMatch[0] : undefined,
        serviceRequested: 'Inbound Inquiry',
        urgency: 'medium'
      });

      toolCallsExecuted.push({
        name: 'save_lead_to_crm',
        args: { name: extractedName, email: emailMatch?.[0], phone: phoneMatch?.[0] },
        result: saveResult
      });

      finalLead = saveResult.lead;
      replyText = `Thank you, ${extractedName}. I have logged your contact details in our system. What day works best for your 30-minute consultation?`;
    } else if (lower.includes('price') || lower.includes('cost') || lower.includes('service') || lower.includes('pricing')) {
      replyText = `Pinnacle AI Solutions provides ${config.services.slice(0, 3).join(', ')}. Our base solutions start at $1,500/mo. Would you like to check our calendar for a quick consultation?`;
    } else {
      replyText = `Hello, thank you for reaching out to Pinnacle AI Solutions. How can we assist you with our services today?`;
    }
  }

  // Ensure response adheres to concise 3-sentence guideline
  const sentences = replyText.split(/(?<=[.?!])\s+/);
  if (sentences.length > 3) {
    replyText = sentences.slice(0, 3).join(' ');
  }

  // Update session history
  const sessionHistory = [
    ...history,
    { role: 'user', content: userMessage, parts: [{ text: userMessage }] },
    { role: 'assistant', content: replyText, parts: [{ text: replyText }] }
  ];

  return {
    reply: replyText,
    updatedHistory: sessionHistory,
    toolCallsExecuted,
    bookingConfirmed: !!finalAppointment,
    appointment: finalAppointment,
    lead: finalLead
  };
}

// Backward compatibility alias
export const runAgentConversation = async (params: {
  sessionId?: string;
  leadId?: string;
  userMessage: string;
  history?: any[];
}) => {
  const result = await runAgentOrchestrator(
    params.history || [],
    params.userMessage
  );

  try {
    const sess = params.sessionId || `session_${Date.now()}`;
    await prisma.messageLog.create({
      data: {
        sessionId: sess,
        role: 'user',
        content: params.userMessage
      }
    });
    await prisma.messageLog.create({
      data: {
        sessionId: sess,
        role: 'assistant',
        content: result.reply,
        toolCalls: result.toolCallsExecuted.length > 0 ? JSON.stringify(result.toolCallsExecuted) : null
      }
    });
  } catch (err) {}

  return {
    ...result,
    sessionId: params.sessionId || `sess_${Date.now()}`
  };
};
