import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(req) {
  try {
    const { email, lectures } = await req.json();

    console.log({ email, lectures });

    const Nlectures = lectures.map(({ lecturesDeliveredId, ...rest }) => rest);

    // Check if the user already has book details

    const user = await db.user.findUnique({
      where: {
        email: email,
      },
      include: {
        lecturesDelivered: true,
      },
    });

    if (user && user.lecturesDelivered) {
      // Professional details exist, update them

      console.log("updating..");
      await db.lecture.deleteMany({
        where: {
          lecturesDeliveredId: user.lecturesDelivered.id,
        },
      });

      await db.lecturesDelivered.delete({
        where: {
          email: email,
        },
      });

      const createdlecturesDelivered = await db.lecturesDelivered.create({
        data: {
          lectures: {
            create: Nlectures,
          },
          user: {
            connect: {
              email: email,
            },
          },
        },
      });
    } else {
      const createdlecturesDelivered = await db.lecturesDelivered.create({
        data: {
          lectures: {
            create: Nlectures,
          },
          user: {
            connect: {
              email: email,
            },
          },
        },
      });
    }
    return NextResponse.json(
      { message: "lecturesDelivered Created/Updated." },
      { status: 201 },
    );
  } catch (error) {
    console.error("Error creating/updating lecturesDelivered:", error);
    return NextResponse.json(
      {
        message: "An error occurred while creating/updating lecturesDelivered.",
      },
      { status: 500 },
    );
  }
}
