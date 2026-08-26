import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const appointments = await prisma.appointment.findMany({
      orderBy: { date: 'asc' },
      include: {
        lead: true
      }
    });
    return NextResponse.json({ success: true, appointments });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error?.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const appointment = await prisma.appointment.create({
      data: {
        leadId: body.leadId,
        clientName: body.clientName || body.customerName,
        customerName: body.customerName || body.clientName,
        clientEmail: body.clientEmail || body.email,
        email: body.email || body.clientEmail,
        clientPhone: body.clientPhone || body.phone,
        phone: body.phone || body.clientPhone,
        date: body.date,
        timeSlot: body.timeSlot,
        serviceType: body.serviceType || 'Growth Strategy Session',
        status: body.status || 'Confirmed',
        notes: body.notes,
        meetingLink: body.meetingLink || `https://meet.google.com/apx-${Math.random().toString(36).substring(2, 7)}`
      }
    });
    return NextResponse.json({ success: true, appointment });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error?.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, status, date, timeSlot, notes } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: 'Appointment ID is required' }, { status: 400 });
    }

    const updated = await prisma.appointment.update({
      where: { id },
      data: {
        ...(status ? { status } : {}),
        ...(date ? { date } : {}),
        ...(timeSlot ? { timeSlot } : {}),
        ...(notes ? { notes } : {})
      }
    });

    return NextResponse.json({ success: true, appointment: updated });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error?.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'Appointment ID is required' }, { status: 400 });
    }

    await prisma.appointment.delete({
      where: { id }
    });

    return NextResponse.json({ success: true, message: 'Appointment removed successfully' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error?.message }, { status: 500 });
  }
}
