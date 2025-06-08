// import { NextResponse } from "next/server";
// import { getOrganizationsCollection } from "../../lib/db";

// export async function POST(request: Request) {
//   try {
//     const { name } = await request.json();

//     if (!name) {
//       return NextResponse.json({ error: "Organization name is required" }, { status: 400 });
//     }

//     const orgs = await getOrganizationsCollection();
//     const existing = await orgs.findOne({ name });

//     if (existing) {
//       return NextResponse.json({ error: "Organization already exists" }, { status: 409 });
//     }

//     await orgs.insertOne({ name, createdAt: new Date() });

//     return NextResponse.json({ message: "Organization added successfully" }, { status: 201 });
//   } catch (error) {
//     console.error("[ADD_ORG_ERROR]:", error);
//     return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
//   }
// }
import { NextResponse } from "next/server";
import { getOrganizationsCollection } from "../../lib/db";

export async function POST(request: Request) {
  try {
    const { name, description, location, contactEmail } = await request.json();

    // Validate required fields
    if (!name) {
      return NextResponse.json({ error: "Organization name is required" }, { status: 400 });
    }

    if (!description) {
      return NextResponse.json({ error: "Organization description is required" }, { status: 400 });
    }

    if (!location) {
      return NextResponse.json({ error: "Organization location is required" }, { status: 400 });
    }

    if (!contactEmail) {
      return NextResponse.json({ error: "Contact email is required" }, { status: 400 });
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(contactEmail)) {
      return NextResponse.json({ error: "Invalid email format" }, { status: 400 });
    }

    const orgs = await getOrganizationsCollection();
    
    // Check if organization with same name already exists
    const existingByName = await orgs.findOne({ name });
    if (existingByName) {
      return NextResponse.json({ error: "Organization with this name already exists" }, { status: 409 });
    }

    // Check if organization with same email already exists
    const existingByEmail = await orgs.findOne({ contactEmail });
    if (existingByEmail) {
      return NextResponse.json({ error: "Organization with this email already exists" }, { status: 409 });
    }

    // Create the organization document
    const organizationDoc = {
      name,
      description,
      location,
      contactEmail,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await orgs.insertOne(organizationDoc);

    return NextResponse.json({ 
      success: true,
      message: "Organization created successfully",
      organizationId: result.insertedId 
    }, { status: 201 });

  } catch (error) {
    console.error("[CREATE_ORG_ERROR]:", error);
    return NextResponse.json({ 
      success: false,
      error: "Internal Server Error" 
    }, { status: 500 });
  }
}

// Optional: Add GET method to retrieve organizations
export async function GET() {
  try {
    const orgs = await getOrganizationsCollection();
    const organizations = await orgs.find({}).toArray();
    
    return NextResponse.json({ 
      success: true,
      organizations 
    }, { status: 200 });

  } catch (error) {
    console.error("[GET_ORGS_ERROR]:", error);
    return NextResponse.json({ 
      success: false,
      error: "Internal Server Error" 
    }, { status: 500 });
  }
}