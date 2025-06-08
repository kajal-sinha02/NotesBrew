// import { NextResponse } from "next/server";
// import { getUsersCollection } from "../../lib/db";
// import bcrypt from "bcryptjs";

// export async function POST(request: Request) {
//   try {
//     const { name, email, password, role, organization } = await request.json();

//     if (!name || !email || !password || !role) {
//       return NextResponse.json(
//         { error: "Missing required fields" },
//         { status: 400 }
//       );
//     }

//     if (!["admin", "student"].includes(role)) {
//       return NextResponse.json(
//         { error: "Role must be either 'admin' or 'student'" },
//         { status: 400 }
//       );
//     }

//     if (role === "student" && !organization) {
//       return NextResponse.json(
//         { error: "Organization is required for students" },
//         { status: 400 }
//       );
//     }

//     const users = await getUsersCollection();

//     // Check if user already exists
//     const existingUser = await users.findOne({ email });
//     if (existingUser) {
//       return NextResponse.json({ error: "User already exists" }, { status: 409 });
//     }

//     // Hash password
//     const hashedPassword = await bcrypt.hash(password, 10);

//     // Prepare new user object
//     const newUser: any = {
//       name,
//       email,
//       password: hashedPassword,
//       role,
//       createdAt: new Date(),
//       updatedAt: new Date(),
//     };

//     if (role === "student") {
//       newUser.organization = organization;
//     }

//     // Insert new user
//     const result = await users.insertOne(newUser);

//     return NextResponse.json(
//       { message: "User created successfully", userId: result.insertedId },
//       { status: 201 }
//     );
//   } catch (error) {
//     console.error(error);
//     return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
//   }
// }
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getUsersCollection, getOrganizationsCollection } from "../../lib/db";
import { ObjectId } from "mongodb";

export async function POST(request: Request) {
  try {
    const { name, email, password, role, organization } = await request.json();

    // Validate required fields
    if (!name || !email || !password || !role) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Validate role
    if (!["admin", "student"].includes(role)) {
      return NextResponse.json({ error: "Role must be either 'admin' or 'student'" }, { status: 400 });
    }

    // Validate organization for students
    if (role === "student" && !organization) {
      return NextResponse.json({ error: "Organization is required for students" }, { status: 400 });
    }

    const users = await getUsersCollection();

    // Check if user already exists
    const existingUser = await users.findOne({ email });
    if (existingUser) {
      return NextResponse.json({ error: "User already exists" }, { status: 409 });
    }

    let organizationData = null;

    // If user is a student, validate and fetch organization
    if (role === "student") {
      const orgs = await getOrganizationsCollection();
      
      // Validate organization exists
      try {
        organizationData = await orgs.findOne({ _id: new ObjectId(organization) });
        if (!organizationData) {
          return NextResponse.json({ error: "Selected organization does not exist" }, { status: 400 });
        }
      } catch (error) {
        return NextResponse.json({ error: "Invalid organization ID" }, { status: 400 });
      }
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Prepare new user object
    const newUser: any = {
      name,
      email,
      password: hashedPassword,
      role,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    if (role === "student" && organizationData) {
      newUser.organization = organizationData._id;
      newUser.organizationName = organizationData.name;
    }

    // Insert new user
    const result = await users.insertOne(newUser);

    return NextResponse.json(
      { message: "User created successfully", userId: result.insertedId },
      { status: 201 }
    );

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}