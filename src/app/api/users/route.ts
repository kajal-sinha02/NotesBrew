import { NextResponse } from "next/server";
import clientPromise from "../../lib/mongodb";
import { ObjectId } from "mongodb";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const organization = searchParams.get("organization");

    if (!organization) {
      return NextResponse.json(
        { error: "Missing organization parameter" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db();

    const organizationId = new ObjectId(organization);

    const users = await db
      .collection("users")
      .find(
        { organization: organizationId },
        { projection: { name: 1, email: 1 } }
      )
      .toArray();

    const usersFormatted = users.map((user) => ({
      _id: user._id.toString(),
      name: user.name,
      email: user.email,
    }));

    return NextResponse.json(usersFormatted);
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 }
    );
  }
}
