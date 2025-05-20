import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "../../auth/[...nextauth]/route";
import Alarm from "../../../models/Alarm";
import { connectToDatabase } from "../../../utils/mongodb";

// Update alarm
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await connectToDatabase();
    const session = await getServerSession(authOptions);
    const body = await request.json();

    if (!session) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const alarm = await Alarm.findOneAndUpdate(
      { _id: params.id, userId: session.user.id },
      body,
      { new: true }
    );

    if (!alarm) {
      return NextResponse.json({ error: "Alarm not found" }, { status: 404 });
    }

    return NextResponse.json({ alarm });
  } catch (error) {
    console.error("Error updating alarm:", error);
    return NextResponse.json(
      { error: "Failed to update alarm" },
      { status: 500 }
    );
  }
}

// Delete alarm
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await connectToDatabase();
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const alarm = await Alarm.findOneAndDelete({
      _id: params.id,
      userId: session.user.id,
    });

    if (!alarm) {
      return NextResponse.json({ error: "Alarm not found" }, { status: 404 });
    }

    return NextResponse.json(
      { message: "Alarm deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting alarm:", error);
    return NextResponse.json(
      { error: "Failed to delete alarm" },
      { status: 500 }
    );
  }
}
