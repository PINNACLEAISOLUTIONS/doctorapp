import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const totalLeads = await prisma.lead.count();
    const qualifiedLeads = await prisma.lead.count({
      where: { urgencyStatus: { in: ['Qualified', 'Booked'] } }
    });
    const totalAppointments = await prisma.appointment.count();
    const confirmedAppointments = await prisma.appointment.count({
      where: { status: 'Confirmed' }
    });

    const leads = await prisma.lead.findMany({
      orderBy: { createdAt: 'desc' },
      take: 10,
      include: {
        appointments: true,
        messageLogs: {
          take: 4,
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    const appointments = await prisma.appointment.findMany({
      orderBy: { date: 'asc' },
      take: 10,
      include: {
        lead: true
      }
    });

    // Pipeline Revenue Calculation
    const allLeads = await prisma.lead.findMany();
    const totalPipelineValue = allLeads.reduce((acc, lead) => acc + (lead.estimatedValue || 2500), 0);
    const conversionRate = totalLeads > 0 ? ((totalAppointments / totalLeads) * 100).toFixed(1) : '0.0';

    return NextResponse.json({
      success: true,
      stats: {
        totalLeads,
        qualifiedLeads,
        totalAppointments,
        confirmedAppointments,
        conversionRate: `${conversionRate}%`,
        totalPipelineValue: `$${totalPipelineValue.toLocaleString()}`,
        estimatedMonthlyValue: `$${(totalAppointments * 3500).toLocaleString()}`
      },
      recentLeads: leads,
      upcomingAppointments: appointments
    });
  } catch (error: any) {
    console.error('Stats API error:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to fetch dashboard stats' },
      { status: 500 }
    );
  }
}
