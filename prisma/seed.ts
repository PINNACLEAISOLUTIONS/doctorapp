import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding LeadRescue AI database...');

  // 1. Business Profile
  await prisma.businessProfile.upsert({
    where: { id: 'biz_default' },
    update: {},
    create: {
      id: 'biz_default',
      name: 'LeadRescue AI Solutions',
      businessName: 'LeadRescue AI Solutions',
      industry: 'Autonomous AI Lead Ingestion & Booking',
      servicesOffered: 'AI Phone & SMS Answering, Lead Qualification, Automated Calendar Booking, CRM Sync',
      servicesJson: JSON.stringify([
        'AI Phone & SMS Answering',
        'Lead Qualification',
        'Automated Calendar Booking',
        'CRM Sync'
      ]),
      basePricing: 'Starter: $1,500/mo, Growth: $3,500/mo, Enterprise Custom: $8,000+',
      businessHours: 'Monday - Friday: 8:00 AM - 6:00 PM EST, Saturday: 10:00 AM - 2:00 PM EST',
      operatingHours: 'Monday - Friday: 8:00 AM - 6:00 PM EST, Saturday: 10:00 AM - 2:00 PM EST',
      serviceArea: 'Nationwide & Global Remote',
      phone: '+1 (555) 392-8810',
      notificationPhone: '+1 (555) 392-8810',
      email: 'leads@leadrescue.ai',
      notificationEmail: 'leads@leadrescue.ai',
      systemPrompt: 'You are Alex, the primary autonomous intake and scheduling AI agent for LeadRescue AI. Your mission is to warmly engage potential clients, qualify their budget, timeline, and project needs, answer questions accurately, and book a 30-minute discovery consultation on our calendar.',
      calendarTimeSlots: '09:00 AM, 10:30 AM, 01:00 PM, 02:30 PM, 04:00 PM'
    }
  });

  // 2. Initial Sample Leads across statuses (Qualified, Booked, New)
  const lead1 = await prisma.lead.create({
    data: {
      name: 'Marcus Sterling',
      email: 'marcus@sterlingluxury.com',
      phone: '(555) 912-3049',
      companyName: 'Sterling Luxury Properties',
      projectDetails: 'Automate high-ticket buyer qualification and property tour scheduling via custom AI agents.',
      serviceRequested: 'AI Lead Qualification Engine',
      budget: '$5,000/mo',
      urgency: 'high',
      urgencyStatus: 'Booked',
      status: 'Booked',
      notes: 'High-value enterprise real estate firm with 300+ monthly inquiries.',
      estimatedValue: 6000,
      source: 'Website Chat Agent',
      appointments: {
        create: {
          clientName: 'Marcus Sterling',
          customerName: 'Marcus Sterling',
          clientEmail: 'marcus@sterlingluxury.com',
          email: 'marcus@sterlingluxury.com',
          clientPhone: '(555) 912-3049',
          phone: '(555) 912-3049',
          date: '2026-08-28',
          timeSlot: '10:30 AM',
          serviceType: 'AI Architecture & Qualification Strategy',
          status: 'Confirmed',
          notes: 'Autonomous booking via website agent. Focus on CRM integration.',
          meetingLink: 'https://meet.google.com/apx-ster-2026'
        }
      },
      messageLogs: {
        create: [
          {
            sessionId: 'sess_marcus_01',
            role: 'user',
            content: 'Hi! Do you build custom AI agents that can qualify leads for real estate?'
          },
          {
            sessionId: 'sess_marcus_01',
            role: 'assistant',
            content: 'Yes! We build autonomous multi-channel AI agents that qualify buyer budgets and book appointments directly on your calendar. What is your current inbound volume?',
            toolCalls: JSON.stringify([{ name: 'save_lead_to_crm', args: { name: 'Marcus Sterling', urgency: 'high' } }])
          },
          {
            sessionId: 'sess_marcus_01',
            role: 'user',
            content: 'Around 300 inquiries/month. Let\'s schedule a consultation for Friday at 10:30 AM. My email is marcus@sterlingluxury.com.'
          },
          {
            sessionId: 'sess_marcus_01',
            role: 'assistant',
            content: 'Confirmed! I\'ve booked your consultation for Friday, Aug 28 at 10:30 AM. A Google Meet link has been dispatched to marcus@sterlingluxury.com (#CONF-STRL99).',
            toolCalls: JSON.stringify([{ name: 'book_calendar_appointment', args: { customerName: 'Marcus Sterling', date: '2026-08-28', timeSlot: '10:30 AM' } }])
          }
        ]
      }
    }
  });

  const lead2 = await prisma.lead.create({
    data: {
      name: 'Elena Rostova',
      email: 'elena@rostovatech.io',
      phone: '(555) 381-9920',
      companyName: 'Rostova Health Tech',
      projectDetails: 'Revamp inpatient triage intake and booking portal with AI phone backup.',
      serviceRequested: 'AI Phone & SMS Ingestion',
      budget: '$8,000+',
      urgency: 'high',
      urgencyStatus: 'Booked',
      status: 'Booked',
      notes: 'Healthcare clinic network requiring HIPAA-compliant intake workflows.',
      estimatedValue: 12000,
      source: 'Inbound SMS Webhook',
      appointments: {
        create: {
          clientName: 'Elena Rostova',
          customerName: 'Elena Rostova',
          clientEmail: 'elena@rostovatech.io',
          email: 'elena@rostovatech.io',
          clientPhone: '(555) 381-9920',
          phone: '(555) 381-9920',
          date: '2026-08-29',
          timeSlot: '02:30 PM',
          serviceType: 'Healthcare AI Ingestion & Booking Strategy',
          status: 'Confirmed',
          notes: 'Webhook SMS origin. High-priority inquiry.',
          meetingLink: 'https://meet.google.com/apx-rost-9021'
        }
      }
    }
  });

  const lead3 = await prisma.lead.create({
    data: {
      name: 'David Vance',
      email: 'david@vancecapital.com',
      phone: '(555) 740-1192',
      companyName: 'Vance Venture Partners',
      projectDetails: 'Inquiring regarding automated inbound lead capture and calendar routing for portfolio founders.',
      serviceRequested: 'Automated Calendar Booking',
      budget: '$3,500/mo',
      urgency: 'medium',
      urgencyStatus: 'Qualified',
      status: 'Qualified',
      notes: 'Evaluating for 4 portfolio companies.',
      estimatedValue: 4200,
      source: 'Website Chat Agent'
    }
  });

  const lead4 = await prisma.lead.create({
    data: {
      name: 'Sarah Lin',
      email: 'sarah@linboutique.com',
      phone: '(555) 602-8819',
      companyName: 'Lin Ecommerce Brands',
      projectDetails: 'Needs automated cart abandonment AI SMS agent and webhook pipeline.',
      serviceRequested: 'AI SMS Follow-Up',
      budget: '$2,000/mo',
      urgency: 'low',
      urgencyStatus: 'New',
      status: 'New',
      notes: 'Initial inquiry via webform.',
      estimatedValue: 2500,
      source: 'External Webform Webhook'
    }
  });

  console.log('Database seeded successfully with 4 leads and 2 appointments!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
