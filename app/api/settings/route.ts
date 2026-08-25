import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    let profile = await prisma.businessProfile.findFirst();
    if (!profile) {
      profile = await prisma.businessProfile.create({
        data: {
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
    }
    return NextResponse.json({ success: true, profile });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error?.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const profile = await prisma.businessProfile.upsert({
      where: { id: 'biz_default' },
      update: {
        businessName: body.businessName,
        industry: body.industry,
        servicesOffered: body.servicesOffered,
        basePricing: body.basePricing,
        operatingHours: body.operatingHours,
        notificationEmail: body.notificationEmail,
        notificationPhone: body.notificationPhone,
        systemPrompt: body.systemPrompt,
        calendarTimeSlots: body.calendarTimeSlots
      },
      create: {
        id: 'biz_default',
        businessName: body.businessName || 'Apex Growth Agency',
        industry: body.industry || 'Digital Marketing & AI Automation',
        servicesOffered: body.servicesOffered || 'AI Agents & Growth Systems',
        basePricing: body.basePricing || 'Starter: $1,500/mo',
        operatingHours: body.operatingHours || 'Mon-Fri 8AM-6PM',
        notificationEmail: body.notificationEmail || 'leads@apexgrowth.ai',
        systemPrompt: body.systemPrompt || 'You are Alex, an autonomous booking specialist.',
        calendarTimeSlots: body.calendarTimeSlots || '10:00 AM, 02:00 PM'
      }
    });

    return NextResponse.json({ success: true, profile });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error?.message }, { status: 500 });
  }
}
