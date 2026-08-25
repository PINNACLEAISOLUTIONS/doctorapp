import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding Pinnacle AI Solutions Inbound Operations & Dispatch Database...');

  // 1. Business Profile with Operating Manual
  await prisma.businessProfile.upsert({
    where: { id: 'biz_default' },
    update: {
      name: 'Pinnacle AI Solutions',
      businessName: 'Pinnacle AI Solutions',
      industry: 'AI Operations, Intake & Autonomous Dispatch',
      servicesOffered: 'AI Phone & SMS Ingestion, Lead Qualification, Automated Calendar Booking, CRM Integration',
      servicesJson: JSON.stringify([
        'AI Phone & SMS Ingestion',
        'Lead Qualification',
        'Automated Calendar Booking',
        'CRM Integration'
      ]),
      basePricing: 'Starter: $1,500/mo, Growth: $3,500/mo, Enterprise Custom: $8,000+',
      businessHours: 'Monday - Friday: 8:00 AM - 6:00 PM EST, Saturday: 10:00 AM - 2:00 PM EST',
      operatingHours: 'Monday - Friday: 8:00 AM - 6:00 PM EST, Saturday: 10:00 AM - 2:00 PM EST',
      serviceArea: 'Nationwide & Global Remote',
      phone: '+1 (555) 392-8810',
      notificationPhone: '+1 (555) 392-8810',
      email: 'dispatch@pinnacleai.solutions',
      notificationEmail: 'dispatch@pinnacleai.solutions',
      systemPrompt: `You are the primary intake and dispatch agent for Pinnacle AI Solutions. You are a pragmatic, solutions-focused digital receptionist. You are not a chatty AI assistant; you are a professional, efficient system designed to solve the customer's problem by capturing their needs and getting them on the schedule. Convert inbound inquiries into qualified, booked appointments while accurately capturing the client's name, phone number, and requested service.`,
      calendarTimeSlots: '09:00 AM, 10:30 AM, 01:00 PM, 02:30 PM, 04:00 PM'
    },
    create: {
      id: 'biz_default',
      name: 'Pinnacle AI Solutions',
      businessName: 'Pinnacle AI Solutions',
      industry: 'AI Operations, Intake & Autonomous Dispatch',
      servicesOffered: 'AI Phone & SMS Ingestion, Lead Qualification, Automated Calendar Booking, CRM Integration',
      servicesJson: JSON.stringify([
        'AI Phone & SMS Ingestion',
        'Lead Qualification',
        'Automated Calendar Booking',
        'CRM Integration'
      ]),
      basePricing: 'Starter: $1,500/mo, Growth: $3,500/mo, Enterprise Custom: $8,000+',
      businessHours: 'Monday - Friday: 8:00 AM - 6:00 PM EST, Saturday: 10:00 AM - 2:00 PM EST',
      operatingHours: 'Monday - Friday: 8:00 AM - 6:00 PM EST, Saturday: 10:00 AM - 2:00 PM EST',
      serviceArea: 'Nationwide & Global Remote',
      phone: '+1 (555) 392-8810',
      notificationPhone: '+1 (555) 392-8810',
      email: 'dispatch@pinnacleai.solutions',
      notificationEmail: 'dispatch@pinnacleai.solutions',
      systemPrompt: `You are the primary intake and dispatch agent for Pinnacle AI Solutions. You are a pragmatic, solutions-focused digital receptionist. You are not a chatty AI assistant; you are a professional, efficient system designed to solve the customer's problem by capturing their needs and getting them on the schedule. Convert inbound inquiries into qualified, booked appointments while accurately capturing the client's name, phone number, and requested service.`,
      calendarTimeSlots: '09:00 AM, 10:30 AM, 01:00 PM, 02:30 PM, 04:00 PM'
    }
  });

  console.log('Database synced with Pinnacle AI Solutions operating profile!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
