import Alarm from "@/app/models/Alarm";
import dbConnect from "@/app/utils/dbConnect";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "../../auth/[...nextauth]/route";

export async function GET(req, { params }) {
  try {
    await dbConnect();

    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const alarm = await Alarm.findOne({
      _id: params.id,
      userId: session.user.id,
    });

    if (!alarm) {
      return NextResponse.json({ error: "Alarm not found" }, { status: 404 });
    }
    return NextResponse.json({ alarm });
  } catch (error) {
    console.error("Error fetching alarm:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function PUT(req, { params }) {
  try {
    await dbConnect();
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const data = await req.json();

    const alarm = await Alarm.findOneAndUpdate(
      { _id: params.id, userId: session.user.id },
      data,
      { new: true }
    );
    if (!alarm) {
      return NextResponse.json({ error: "Alarm not found" }, { status: 404 });
    }
    return NextResponse.json({ alarm });
  } catch (error) {
    console.error("Error updating alarm:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    await dbConnect();
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const alarm = await Alarm.findOneAndDelete({
      _id: params.id,
      userId: session.user.id,
    });
    if (!alarm) {
      return NextResponse.json({ error: "Alarm not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting alarm:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
