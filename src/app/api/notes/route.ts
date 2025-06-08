import { NextResponse } from "next/server";
import clientPromise from "../../lib/mongodb";
import { NextRequest } from 'next/server';
import cloudinary from "../../lib/cloudinary"; 

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const noteId = searchParams.get('id');
    
    // Check if this is a bulk deletion request
    let noteIds: string[] = [];
    
    if (noteId) {
      // Single note deletion (existing functionality)
      noteIds = [noteId];
    } else {
      // Bulk deletion - read from request body
      try {
        const body = await request.json();
        if (body.ids && Array.isArray(body.ids)) {
          noteIds = body.ids;
        } else {
          return NextResponse.json({ 
            error: "Either 'id' parameter or 'ids' array in request body is required" 
          }, { status: 400 });
        }
      } catch (jsonError) {
        return NextResponse.json({ 
          error: "Invalid request format. Either provide 'id' parameter or 'ids' array in request body" 
        }, { status: 400 });
      }
    }

    if (noteIds.length === 0) {
      return NextResponse.json({ 
        error: "No note IDs provided" 
      }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db();
    const notes = db.collection("notes");

    // Import ObjectId for MongoDB operations
    const { ObjectId } = require('mongodb');
    
    // Convert string IDs to ObjectIds and validate them
    const objectIds = [];
    for (const id of noteIds) {
      try {
        objectIds.push(new ObjectId(id));
      } catch (error) {
        return NextResponse.json({ 
          error: `Invalid note ID format: ${id}` 
        }, { status: 400 });
      }
    }
    
    // Delete multiple notes
    const result = await notes.deleteMany({ 
      _id: { $in: objectIds } 
    });

    if (result.deletedCount === 0) {
      return NextResponse.json({ 
        error: "No notes found with the provided IDs" 
      }, { status: 404 });
    }

    return NextResponse.json({ 
      success: true, 
      message: `${result.deletedCount} note(s) deleted successfully`,
      deletedCount: result.deletedCount
    });

  } catch (err) {
    console.error("DELETE_NOTE_ERROR", err);
    return NextResponse.json({ 
      error: "Server error" 
    }, { status: 500 });
  }
}


// GET - Fetch notes with filters and pagination
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Extract query parameters
    const branch = searchParams.get('branch');
    const semester = searchParams.get('semester');
    const subject = searchParams.get('subject');
    const search = searchParams.get('search');
    const uploadedBy = searchParams.get('uploadedBy');  // NEW
    const organization = searchParams.get('organization'); // NEW
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    // Validate pagination parameters
    if (page < 1 || limit < 1 || limit > 100) {
      return NextResponse.json(
        { success: false, error: "Invalid pagination parameters" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db();
    const notes = db.collection("notes");

    // Build filter query
    const filter: any = {};
    
    if (branch) filter.branch = branch;
    if (semester) filter.semester = semester;
    if (subject) filter.subject = subject;
    if (uploadedBy) filter.uploadedBy = uploadedBy;       // NEW
    if (organization) filter.organization = organization; // NEW
    
    // Add search functionality
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } },
        { subject: { $regex: search, $options: 'i' } }
      ];
    }

    // Calculate skip value for pagination
    const skip = (page - 1) * limit;

    // Execute queries in parallel for better performance
    const [notesList, totalCount] = await Promise.all([
      notes
        .find(filter)
        .sort({ createdAt: -1 }) // Sort by newest first
        .skip(skip)
        .limit(limit)
        .toArray(),
      notes.countDocuments(filter)
    ]);

    // Transform the data to match your frontend expectations
    const transformedNotes = notesList.map(note => ({
      id: note._id.toString(),
      _id: note._id.toString(),
      title: note.title,
      content: note.content,
      branch: note.branch,
      semester: note.semester,
      subject: note.subject,
      fileUrl: note.fileUrl || null,
      fileName: note.fileName || null,
      uploadedBy: note.uploadedBy || 'anonymous',
      organization: note.organization || null, // NEW
      createdAt: note.createdAt,
      updatedAt: note.updatedAt
    }));

    // Calculate total pages
    const totalPages = Math.ceil(totalCount / limit);

    return NextResponse.json({
      success: true,
      notes: transformedNotes,
      pagination: {
        currentPage: page,
        totalPages,
        totalCount,
        limit,
        hasNext: page < totalPages,
        hasPrev: page > 1
      },
      // Legacy fields for backward compatibility
      total: totalCount,
      totalPages
    });

  } catch (error) {
    console.error("GET_NOTES_LIST_ERROR", error);
    return NextResponse.json(
      { success: false, error: "Server error" },
      { status: 500 }
    );
  }
}

// POST - Create new note (you can move this here from the [id] route if needed)


export async function POST(request: Request) {
  try {
    const contentType = request.headers.get("content-type");
    if (!contentType?.includes("multipart/form-data")) {
      return NextResponse.json({ success: false, error: "Unsupported content type" }, { status: 400 });
    }

    const formData = await request.formData();
    const title = formData.get("title") as string;
    const content = formData.get("content") as string;
    const branch = formData.get("branch") as string;
    const semester = formData.get("semester") as string;
    const subject = formData.get("subject") as string;
    const file = formData.get("file");
    const uploadedBy = (formData.get("uploadedBy") as string) || "anonymous";
    const organization = (formData.get("organization") as string) || "unknown";

    if (!title || !content || !branch || !semester || !subject) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db();
    const notesCollection = db.collection("notes");

    let fileUrl: string | null = null;
    let fileName: string | null = null;

    if (file && typeof (file as Blob).arrayBuffer === "function") {
      const buffer = Buffer.from(await (file as Blob).arrayBuffer());
      const originalName = (file as any).name || `upload-${Date.now()}`;
      const ext = originalName.split('.').pop();
      const baseName = originalName.replace(/\.[^/.]+$/, "");

      // Upload using auto to detect file type
      const uploadResult: any = await new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream(
          {
            resource_type: "raw",       // auto for PDFs and images
            folder: "college-notes",
            public_id: `note-${Date.now()}-${baseName}`,
            use_filename: true,
            unique_filename: false,
            overwrite: true,
            format: ext || undefined        // ensure extension is applied
          },
          (error, result) => {
            if (error) return reject(error);
            resolve(result);
          }
        ).end(buffer);
      });

      fileUrl = uploadResult.secure_url;
      fileName = uploadResult.original_filename + (ext ? `.${ext}` : "");
    }

    const noteDoc = {
      title,
      content,
      branch,
      semester,
      subject,
      fileUrl,
      fileName,
      uploadedBy,
      organization,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const insertResult = await notesCollection.insertOne(noteDoc);

    return NextResponse.json(
      { success: true, noteId: insertResult.insertedId.toString() },
      { status: 201 }
    );
  } catch (error) {
    console.error("CREATE_NOTE_ERROR", error);
    return NextResponse.json(
      { success: false, error: "Server error" },
      { status: 500 }
    );
  }
}

// export async function POST(request: Request) {
//   try {
//     const contentType = request.headers.get('content-type');
//     let body: any = {};

//     if (contentType?.includes('multipart/form-data')) {
//       const formData = await request.formData();
//       body = {
//         title: formData.get('title'),
//         content: formData.get('content'),
//         branch: formData.get('branch'),
//         semester: formData.get('semester'),
//         subject: formData.get('subject'),
//         file: formData.get('file'),
//         uploadedBy: formData.get('uploadedBy'),
//         organization: formData.get('organization'),
//       };
//     } else {
//       return NextResponse.json({ success: false, error: "Unsupported content type" }, { status: 400 });
//     }

//     const { title, content, branch, semester, subject, file, uploadedBy, organization } = body;

//     if (!title || !content || !branch || !semester || !subject) {
//       return NextResponse.json({ 
//         success: false,
//         error: "Missing required fields: title, content, branch, semester, subject" 
//       }, { status: 400 });
//     }

//     const client = await clientPromise;
//     const db = client.db();
//     const notes = db.collection("notes");

//     let fileUrl: string | null = null;
//     let fileName: string | null = null;

//     if (file && file instanceof File) {
//   // 1) Convert to Buffer
//   const arrayBuffer = await file.arrayBuffer();
//   const buffer = Buffer.from(arrayBuffer);

//   // 2) Compute a base name without extension
//   const baseName = (file.name as string).replace(/\.[^/.]+$/, '');
//   //    e.g. "the-art-of-seduction-robert-greene"

//   // 3) Upload to Cloudinary under the RAW endpoint, using that baseName
  
//   // const uploadResult: any = await new Promise((resolve, reject) => {
    
//   //   // cloudinary.uploader.upload_stream(
//   //   //   {
//   //   //     resource_type: 'raw',           // ← force raw handling
//   //   //     folder: 'college-notes',
//   //   //     public_id: `note-${Date.now()}-${baseName}` // ← no “.pdf” here
//   //   //   },
//   //   //   (error, result) => {
//   //   //     if (error) return reject(error);
//   //   //     resolve(result);
//   //   //   }
//   //   // ).end(buffer);
//   // });

//   // 4) Grab the correct URL and filename
//   fileUrl  = uploadResult.secure_url;        // → https://…/raw/upload/v…/college-notes/note-…-the-art-of-seduction-robert-greene.pdf
//   fileName = uploadResult.original_filename; // → "the-art-of-seduction-robert-greene"
// }

//     // if (file && file instanceof File) {
//     //   // Convert File to buffer
//     //   const arrayBuffer = await file.arrayBuffer();
//     //   const buffer = Buffer.from(arrayBuffer);

//     //   // Upload to Cloudinary
//     //   const uploadResult: any = await new Promise((resolve, reject) => {
//     //     cloudinary.uploader.upload_stream(
//     //       {
//     //         resource_type: 'raw', // handles images, PDFs, etc.
//     //         folder: 'college-notes',
//     //         public_id: `note-${Date.now()}` // no extension here
//     //       },
//     //       (error, result) => {
//     //         if (error) return reject(error);
//     //         resolve(result);
//     //       }
//     //     ).end(buffer);
//     //   });

//     //   fileUrl = uploadResult.secure_url;
//     //   fileName = uploadResult.original_filename;
//     // }

//     const note = {
//       title,
//       content,
//       branch,
//       semester,
//       subject,
//       fileUrl,
//       fileName,
//       uploadedBy: (uploadedBy as string) || 'anonymous',
//       organization: (organization as string) || 'unknown',
//       createdAt: new Date(),
//       updatedAt: new Date()
//     };

//     const result = await notes.insertOne(note);

//     return NextResponse.json({ 
//       success: true, 
//       message: "Note created successfully",
//       noteId: result.insertedId.toString()
//     });

//   } catch (err) {
//     console.error("CREATE_NOTE_ERROR", err);
//     return NextResponse.json({ 
//       success: false,
//       error: "Server error" 
//     }, { status: 500 });
//   }
// }

// export async function POST(request: Request) {
//   try {
//     // Handle both JSON and FormData
//     const contentType = request.headers.get('content-type');
//     let body: any = {};

//     if (contentType?.includes('application/json')) {
//       body = await request.json();
//     } else if (contentType?.includes('multipart/form-data')) {
//       const formData = await request.formData();
//       body = {
//         title: formData.get('title'),
//         content: formData.get('content'),
//         branch: formData.get('branch'),
//         semester: formData.get('semester'),
//         subject: formData.get('subject'),
//         file: formData.get('file'),
//         uploadedBy: formData.get('uploadedBy'),       // NEW
//         organization: formData.get('organization'),   // NEW
//       };
//     } else {
//       // Try to parse as FormData anyway
//       try {
//         const formData = await request.formData();
//         body = {
//           title: formData.get('title'),
//           content: formData.get('content'),
//           branch: formData.get('branch'),
//           semester: formData.get('semester'),
//           subject: formData.get('subject'),
//           file: formData.get('file'),
//           uploadedBy: formData.get('uploadedBy'),       // NEW
//           organization: formData.get('organization'),   // NEW
//         };
//       } catch {
//         body = await request.json();
//       }
//     }

//     const { title, content, branch, semester, subject, file, uploadedBy, organization } = body;

//     // Validate required fields
//     if (!title || !content || !branch || !semester || !subject) {
//       return NextResponse.json({ 
//         success: false,
//         error: "Missing required fields: title, content, branch, semester, subject" 
//       }, { status: 400 });
//     }

//     // Optionally validate uploadedBy and organization
//     // For example, default to 'anonymous' or reject if missing
//     const safeUploadedBy = uploadedBy || 'anonymous';
//     const safeOrganization = organization || 'unknown';

//     const client = await clientPromise;
//     const db = client.db();
//     const notes = db.collection("notes");

//     // Handle file upload if present
//     let fileUrl = null;
//     let fileName = null;
    
//     if (file && file instanceof File) {
//       // TODO: Implement file upload to your storage service
//       // For now, we'll just store the filename
//       fileName = file.name;
//       // fileUrl = await uploadFileToStorage(file); // Implement this
//       fileUrl = `/uploads/${file.name}`; // Placeholder URL
//     }

//     const note = {
//       title,
//       content,
//       branch,
//       semester,
//       subject,
//       fileUrl,
//       fileName,
//       uploadedBy: safeUploadedBy,      // SAVE HERE
//       organization: safeOrganization,  // SAVE HERE
//       createdAt: new Date(),
//       updatedAt: new Date()
//     };

//     const result = await notes.insertOne(note);

//     return NextResponse.json({ 
//       success: true, 
//       message: "Note created successfully",
//       noteId: result.insertedId.toString()
//     });

//   } catch (err) {
//     console.error("CREATE_NOTE_ERROR", err);
//     return NextResponse.json({ 
//       success: false,
//       error: "Server error" 
//     }, { status: 500 });
//   }
// }
