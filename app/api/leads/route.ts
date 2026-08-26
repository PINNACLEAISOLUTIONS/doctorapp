import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const leads = await prisma.lead.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        appointments: true,
        messageLogs: {
          orderBy: { createdAt: 'asc' }
        }
      }
    });
    return NextResponse.json({ success: true, leads });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error?.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const lead = await prisma.lead.create({
      data: {
        name: body.name,
        email: body.email,
        phone: body.phone,
        companyName: body.companyName,
        serviceRequested: body.serviceRequested || 'Growth Consultation',
        projectDetails: body.projectDetails,
        budget: body.budget,
        urgencyStatus: body.urgencyStatus || 'Qualified',
        status: body.status || body.urgencyStatus || 'Qualified',
        source: body.source || 'Manual Dashboard Entry'
      }
    });
    return NextResponse.json({ success: true, lead });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error?.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, status, urgencyStatus, notes, budget } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: 'Lead ID is required' }, { status: 400 });
    }

    const updated = await prisma.lead.update({
      where: { id },
      data: {
        ...(status ? { status } : {}),
        ...(urgencyStatus ? { urgencyStatus } : {}),
        ...(notes ? { notes } : {}),
        ...(budget ? { budget } : {})
      }
    });

    return NextResponse.json({ success: true, lead: updated });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error?.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'Lead ID is required' }, { status: 400 });
    }

    await prisma.lead.delete({
      where: { id }
    });

    return NextResponse.json({ success: true, message: 'Lead deleted successfully' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error?.message }, { status: 500 });
  }
}
