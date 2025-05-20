import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import Alarm from "../../models/Alarm";
import { authOptions } from "../auth/[...nextauth]/route";
import { connectToDatabase } from "../../utils/mongodb";

// GET all alarms for current user
export async function GET() {
  try {
    await connectToDatabase();
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const alarms = await Alarm.find({ userId: session.user.id })
      .sort({ createdAt: -1 })
      .lean(); // Add .lean() for better performance

    return NextResponse.json({ alarms });
  } catch (error) {
    console.error("Error fetching alarms:", error);
    return NextResponse.json(
      { error: "Failed to fetch alarms" },
      { status: 500 }
    );
  }
}

// Create new alarm
export async function POST(request: Request) {
  try {
    await connectToDatabase();
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const body = await request.json();
    const newAlarm = await Alarm.create({
      ...body,
      userId: session.user.id,
    });

    return NextResponse.json({ alarm: newAlarm }, { status: 201 });
  } catch (error) {
    console.error("Error creating alarm:", error);
    return NextResponse.json(
      { error: "Failed to create alarm" },
      { status: 500 }
    );
  }
}
