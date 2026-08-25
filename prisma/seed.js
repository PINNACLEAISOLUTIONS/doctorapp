const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding Autonomous Lead & Booking Agent Database...');

  // 1. Business Profile
  await prisma.businessProfile.upsert({
    where: { id: 'biz_default' },
    update: {},
    create: {
      id: 'biz_default',
      businessName: 'Apex Growth Agency',
      industry: 'Digital Marketing & AI Automation',
      servicesOffered: 'SEO & PPC Growth Engine, Custom AI Chatbot Agents, Full-Stack Web Development, Workflow Automation',
      basePricing: 'Starter: $1,500/mo, Growth: $3,500/mo, Enterprise Custom: $8,000+',
      operatingHours: 'Monday - Friday: 8:00 AM - 6:00 PM EST, Saturday: 10:00 AM - 2:00 PM EST',
      notificationEmail: 'leads@apexgrowth.ai',
      notificationPhone: '+1 (555) 392-8810',
      systemPrompt: 'You are Alex, the Senior Growth Advisor & Autonomous Booking Specialist for Apex Growth Agency. Your primary mission is to warmly engage potential clients, qualify their budget, timeline, and project needs, answer questions accurately regarding our services, and guide qualified leads to schedule a free 30-minute discovery consultation on our calendar.',
      calendarTimeSlots: '09:00 AM, 10:30 AM, 01:00 PM, 02:30 PM, 04:00 PM'
    }
  });

  // 2. Initial Sample Leads
  const lead1 = await prisma.lead.create({
    data: {
      name: 'Marcus Sterling',
      email: 'marcus@sterlingrealestate.com',
      phone: '(555) 912-3049',
      companyName: 'Sterling Luxury Properties',
      projectDetails: 'Looking to automate high-ticket buyer qualification and property tour scheduling via custom AI agents.',
      budget: '$5,000/mo',
      estimatedValue: 6000,
      urgencyStatus: 'Booked',
      source: 'Website Chat Agent',
      appointments: {
        create: {
          clientName: 'Marcus Sterling',
          clientEmail: 'marcus@sterlingrealestate.com',
          clientPhone: '(555) 912-3049',
          date: '2026-08-28',
          timeSlot: '10:30 AM',
          serviceType: 'AI Agent Architecture Strategy',
          status: 'Confirmed',
          notes: 'Autonomous booking via website agent. Focus on CRM integration.',
          meetingLink: 'https://meet.google.com/apx-ster-2026'
        }
      },
      messageLogs: {
        create: [
          {
            role: 'user',
            content: 'Hi! Do you guys build custom AI agents that can qualify leads for real estate?'
          },
          {
            role: 'assistant',
            content: 'Yes, absolutely! We specialize in developing autonomous multi-channel AI agents that qualify buyer budgets, verify financing readiness, and book property tours directly onto your calendar. What is your current monthly inbound lead volume?',
            toolCalls: JSON.stringify([{ name: 'save_lead_to_crm', args: { name: 'Marcus Sterling', company: 'Sterling Real Estate' } }])
          },
          {
            role: 'user',
            content: 'We get around 300 inquiries a month. I would like to schedule a 30-min call tomorrow or Friday around 10:30 AM. My email is marcus@sterlingrealestate.com.'
          },
          {
            role: 'assistant',
            content: 'Fantastic! I checked our calendar and locked in Friday, Aug 28 at 10:30 AM for your AI Agent Strategy Session. A Google Meet link has been dispatched to marcus@sterlingrealestate.com (#CONF-STRL99).',
            toolCalls: JSON.stringify([{ name: 'book_calendar_appointment', args: { name: 'Marcus Sterling', date: '2026-08-28', timeSlot: '10:30 AM' } }])
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
      projectDetails: 'Need full-stack web application revamp and Next.js portal integration.',
      budget: '$8,000+',
      estimatedValue: 12000,
      urgencyStatus: 'Booked',
      source: 'Inbound SMS Webhook',
      appointments: {
        create: {
          clientName: 'Elena Rostova',
          clientEmail: 'elena@rostovatech.io',
          clientPhone: '(555) 381-9920',
          date: '2026-08-29',
          timeSlot: '02:30 PM',
          serviceType: 'Full-Stack Web Architecture Review',
          status: 'Confirmed',
          notes: 'Webhook SMS origin. High-priority enterprise inquiry.',
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
      projectDetails: 'Inquiring regarding monthly SEO growth engine and conversion rate optimization.',
      budget: '$3,500/mo',
      estimatedValue: 4200,
      urgencyStatus: 'Qualified',
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
      budget: '$2,000/mo',
      estimatedValue: 2500,
      urgencyStatus: 'New',
      source: 'External Webform Webhook'
    }
  });

  console.log('Seeding complete! 4 Leads and 2 Appointments generated.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
