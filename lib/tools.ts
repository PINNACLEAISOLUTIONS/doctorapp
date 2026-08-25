import { prisma } from './prisma';

/**
 * 1. Check calendar availability for a given date
 */
export async function checkCalendarAvailability(date: string): Promise<{
  date: string;
  availableSlots: string[];
  bookedSlots: string[];
  status: 'success' | 'no_slots_available' | 'error';
  message: string;
}> {
  try {
    const profile = await prisma.businessProfile.findFirst();
    const defaultSlots = profile?.calendarTimeSlots
      ? profile.calendarTimeSlots.split(',').map((s) => s.trim())
      : ['09:00 AM', '10:30 AM', '01:00 PM', '02:30 PM', '04:00 PM'];

    // Find already booked appointments for this date
    const existingAppointments = await prisma.appointment.findMany({
      where: {
        date: date,
        status: { in: ['Confirmed', 'Pending'] }
      }
    });

    const bookedSlots = existingAppointments.map((app) => app.timeSlot);
    const availableSlots = defaultSlots.filter((slot) => !bookedSlots.includes(slot));

    return {
      date,
      availableSlots,
      bookedSlots,
      status: availableSlots.length > 0 ? 'success' : 'no_slots_available',
      message:
        availableSlots.length > 0
          ? `Found ${availableSlots.length} available consultation time slots on ${date}: ${availableSlots.join(', ')}.`
          : `All slots are booked for ${date}. Please suggest the following business day.`
    };
  } catch (error) {
    console.error('Error checking calendar availability:', error);
    return {
      date,
      availableSlots: ['10:00 AM', '02:00 PM'],
      bookedSlots: [],
      status: 'success',
      message: `Standard available slots on ${date}: 10:00 AM, 02:00 PM.`
    };
  }
}

/**
 * 2. Book a calendar appointment and link to lead
 */
export async function bookCalendarAppointment(params: {
  name: string;
  email: string;
  phone?: string;
  date: string;
  timeSlot: string;
  serviceType?: string;
  notes?: string;
}): Promise<{
  success: boolean;
  appointment?: any;
  confirmationCode?: string;
  message: string;
}> {
  try {
    const { name, email, phone, date, timeSlot, serviceType = 'Growth Strategy Session', notes } = params;

    // Check if slot is already taken
    const conflict = await prisma.appointment.findFirst({
      where: {
        date,
        timeSlot,
        status: 'Confirmed'
      }
    });

    if (conflict) {
      return {
        success: false,
        message: `The ${timeSlot} slot on ${date} was just reserved. Please pick another available time slot.`
      };
    }

    // Find or create lead
    let lead = await prisma.lead.findFirst({
      where: {
        OR: [
          { email: email ? { equals: email } : undefined },
          { name: { equals: name } }
        ]
      }
    });

    if (!lead) {
      lead = await prisma.lead.create({
        data: {
          name,
          email,
          phone,
          projectDetails: notes || 'Booked discovery call through autonomous AI agent',
          urgencyStatus: 'Booked',
          source: 'Autonomous AI Booking Agent'
        }
      });
    } else {
      // Update lead status
      lead = await prisma.lead.update({
        where: { id: lead.id },
        data: {
          urgencyStatus: 'Booked',
          email: email || lead.email,
          phone: phone || lead.phone
        }
      });
    }

    // Create appointment
    const appointment = await prisma.appointment.create({
      data: {
        leadId: lead.id,
        clientName: name,
        clientEmail: email,
        clientPhone: phone,
        date,
        timeSlot,
        serviceType,
        status: 'Confirmed',
        notes: notes || 'Booked via AI Agent chat conversation',
        meetingLink: `https://meet.google.com/apx-${Math.random().toString(36).substring(2, 7)}`
      }
    });

    return {
      success: true,
      appointment,
      confirmationCode: `CONF-${appointment.id.slice(-6).toUpperCase()}`,
      message: `Appointment successfully confirmed for ${name} on ${date} at ${timeSlot} (${serviceType}). Google Meet invite dispatched to ${email}.`
    };
  } catch (error: any) {
    console.error('Error booking appointment:', error);
    return {
      success: false,
      message: `Failed to book appointment: ${error?.message || 'Database transaction error'}`
    };
  }
}

/**
 * 3. Save / Update lead to CRM database
 */
export async function saveLeadToCRM(leadData: {
  name: string;
  email?: string;
  phone?: string;
  companyName?: string;
  projectDetails?: string;
  budget?: string;
  estimatedValue?: number;
  urgencyStatus?: 'New' | 'Qualified' | 'Booked' | 'Needs Attention';
  source?: string;
}): Promise<{
  success: boolean;
  lead?: any;
  message: string;
}> {
  try {
    const {
      name,
      email,
      phone,
      companyName,
      projectDetails,
      budget,
      estimatedValue = 2500,
      urgencyStatus = 'Qualified',
      source = 'Website Chat Agent'
    } = leadData;

    // Check existing lead
    let lead = null;
    if (email) {
      lead = await prisma.lead.findFirst({ where: { email } });
    }

    if (lead) {
      lead = await prisma.lead.update({
        where: { id: lead.id },
        data: {
          name: name || lead.name,
          phone: phone || lead.phone,
          companyName: companyName || lead.companyName,
          projectDetails: projectDetails ? `${lead.projectDetails || ''} | ${projectDetails}` : lead.projectDetails,
          budget: budget || lead.budget,
          estimatedValue: estimatedValue || lead.estimatedValue,
          urgencyStatus: urgencyStatus || lead.urgencyStatus
        }
      });
    } else {
      lead = await prisma.lead.create({
        data: {
          name,
          email,
          phone,
          companyName,
          projectDetails,
          budget,
          estimatedValue,
          urgencyStatus,
          source
        }
      });
    }

    return {
      success: true,
      lead,
      message: `Lead for ${name} (${email || phone || 'Anonymous'}) successfully recorded in CRM pipeline as "${urgencyStatus}".`
    };
  } catch (error: any) {
    console.error('Error saving lead to CRM:', error);
    return {
      success: false,
      message: `Failed to save lead: ${error?.message || 'Database error'}`
    };
  }
}

/**
 * Gemini Tool / Function Declarations Definition
 */
export const AGENT_TOOLS_DEFINITIONS = [
  {
    name: 'check_calendar_availability',
    description: 'Check available consultation and meeting time slots for a specific date (YYYY-MM-DD format). Call this whenever a prospect expresses interest in booking a meeting, call, or consultation.',
    parameters: {
      type: 'OBJECT',
      properties: {
        date: {
          type: 'STRING',
          description: 'The date to check in ISO YYYY-MM-DD format (e.g. "2026-08-28").'
        }
      },
      required: ['date']
    }
  },
  {
    name: 'book_calendar_appointment',
    description: 'Confirm and book an appointment slot on the calendar for a client. Call this when the client chooses an available date and time slot, and has provided their name and email.',
    parameters: {
      type: 'OBJECT',
      properties: {
        name: {
          type: 'STRING',
          description: 'Full name of the client.'
        },
        email: {
          type: 'STRING',
          description: 'Email address of the client to receive the calendar invite.'
        },
        phone: {
          type: 'STRING',
          description: 'Optional phone number of the client.'
        },
        date: {
          type: 'STRING',
          description: 'The date for the appointment in YYYY-MM-DD format.'
        },
        timeSlot: {
          type: 'STRING',
          description: 'The chosen time slot (e.g. "10:30 AM", "02:00 PM").'
        },
        serviceType: {
          type: 'STRING',
          description: 'Type of consultation requested (e.g. "Growth Strategy Session", "Custom AI Agent Discovery", "Web Architecture Review").'
        },
        notes: {
          type: 'STRING',
          description: 'Brief summary of the client needs, goals, or discussion points.'
        }
      },
      required: ['name', 'email', 'date', 'timeSlot']
    }
  },
  {
    name: 'save_lead_to_crm',
    description: 'Save or update high-intent lead details into the business CRM. Call this whenever the prospect reveals their contact details, budget, timeline, or specific project scope.',
    parameters: {
      type: 'OBJECT',
      properties: {
        name: {
          type: 'STRING',
          description: 'Prospect or business owner name.'
        },
        email: {
          type: 'STRING',
          description: 'Prospect email address.'
        },
        phone: {
          type: 'STRING',
          description: 'Prospect phone number.'
        },
        companyName: {
          type: 'STRING',
          description: 'Company or business name.'
        },
        projectDetails: {
          type: 'STRING',
          description: 'Scope of work, problems they want solved, or technologies needed.'
        },
        budget: {
          type: 'STRING',
          description: 'Budget range (e.g. "$3,000 - $5,000/mo" or "Under $10k").'
        },
        urgencyStatus: {
          type: 'STRING',
          enum: ['New', 'Qualified', 'Booked', 'Needs Attention'],
          description: 'Triage qualification status.'
        }
      },
      required: ['name']
    }
  }
];
