import Alarm from "@/app/models/Alarm";
import dbConnect from "@/app/utils/dbConnect";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "../auth/[...nextauth]/route";

export async function GET() {
  try {
    await dbConnect();
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const alarm = await Alarm.find({ userId: session.user.id }).sort({
      createdAt: -1,
    });

    return NextResponse.json({ alarm });
  } catch (error) {
    console.error("Error creating alarm:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function POST(req) {
  try {
    await dbConnect();
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const data = await req.json();
    const alarm = new Alarm({
      ...data,
      userId: session.user.id,
    });
    await alarm.save();
    return NextResponse.json({ alarm }, { status: 201 });
  } catch (error) {
    console.error("Error creating alarm:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
