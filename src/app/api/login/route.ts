import { NextResponse } from "next/server";
import { getUsersCollection } from "../../lib/db";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { ObjectId } from "mongodb";
import { use } from "react";

const JWT_SECRET = process.env.JWT_SECRET || "supersecretjwtkey";

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ success: false, error: "Email and password required" }, { status: 400 });
    }

    const users = await getUsersCollection();
    const user = await users.findOne({ email });
    console.log("Fetched user:", user); // <-- Add this
    if (!user) {
      return NextResponse.json({ success: false, error: "Invalid credentials" }, { status: 401 });
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return NextResponse.json({ success: false, error: "Invalid credentials" }, { status: 401 });
    }

    // Create payload for JWT
    const payload: any = {
      userId: (user._id as ObjectId).toString(),
      email: user.email,
      role: user.role,
    };

    if (user.role === "student") {
      payload.organization = user.organization;
    }

    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });

    return NextResponse.json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: (user._id as ObjectId).toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        ...(user.role === "student" && {
          organization: user.organization?.toString(), // Convert ObjectId to string
          organizationName: user.organizationName || "", // Fallback to empty string
        }),
      },
    });

  } catch (error) {
    console.error("[LOGIN_ERROR]:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
