import { NextResponse } from "next/server";
import clientPromise from "../../../lib/mongodb";
import { NextRequest } from 'next/server';
import { ObjectId } from 'mongodb';
import cloudinary from "../../../lib/cloudinary"; 
// GET - Get single note by ID
export async function GET(request: NextRequest) {
  try {
    const url = request.nextUrl;
    const id = url.pathname.split('/').pop(); // Extracts [id] from /api/notes/[id]

    if (!id || !ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid note ID format' },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db();
    const notes = db.collection('notes');

    const note = await notes.findOne({ _id: new ObjectId(id) });

    if (!note) {
      return NextResponse.json(
        { success: false, error: 'Note not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
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
        createdAt: note.createdAt,
        updatedAt: note.updatedAt
      }
    });

  } catch (error) {
    console.error('GET_NOTE_BY_ID_ERROR', error);
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}
// export async function GET(
//   request: NextRequest,
//   { params }: { params: { id: string } }
// ) {
//   try {
//     const { id } = params;

//     // Validate the ID format
//     if (!id || !ObjectId.isValid(id)) {
//       return NextResponse.json(
//         { success: false, error: "Invalid note ID format" },
//         { status: 400 }
//       );
//     }

//     const client = await clientPromise;
//     const db = client.db();
//     const notes = db.collection("notes");

//     // Find the note by ID
//     const note = await notes.findOne({ _id: new ObjectId(id) });

//     if (!note) {
//       return NextResponse.json(
//         { success: false, error: "Note not found" },
//         { status: 404 }
//       );
//     }

//     // Return the note data
//     return NextResponse.json({
//       success: true,
//       data: {
//         id: note._id.toString(),
//         _id: note._id.toString(),
//         title: note.title,
//         content: note.content,
//         branch: note.branch,
//         semester: note.semester,
//         subject: note.subject,
//         fileUrl: note.fileUrl || null,
//         fileName: note.fileName || null,
//         uploadedBy: note.uploadedBy || 'anonymous',
//         createdAt: note.createdAt,
//         updatedAt: note.updatedAt
//       }
//     });

//   } catch (error) {
//     console.error("GET_NOTE_BY_ID_ERROR", error);
//     return NextResponse.json(
//       { success: false, error: "Server error" },
//       { status: 500 }
//     );
//   }
// }

// PUT - Update note
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    if (!id || !ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: "Invalid note ID format" },
        { status: 400 }
      );
    }

    const contentType = request.headers.get("content-type");
    const updateData: any = {
      updatedAt: new Date(),
    };

    if (contentType && contentType.includes("multipart/form-data")) {
      const formData = await request.formData();

      const title = formData.get("title") as string;
      const content = formData.get("content") as string;
      const branch = formData.get("branch") as string;
      const semester = formData.get("semester") as string;
      const subject = formData.get("subject") as string;
      const file = formData.get("file") as File;

      if (!title || !content || !branch || !semester || !subject) {
        return NextResponse.json(
          {
            success: false,
            error: "All required fields must be filled",
          },
          { status: 400 }
        );
      }

      updateData.title = title;
      updateData.content = content;
      updateData.branch = branch;
      updateData.semester = semester;
      updateData.subject = subject;

      if (file && typeof (file as Blob).arrayBuffer === "function") {
        const buffer = Buffer.from(await (file as Blob).arrayBuffer());
        const originalName = (file as any).name || `upload-${Date.now()}`;
        const ext = originalName.split(".").pop();
        const baseName = originalName.replace(/\.[^/.]+$/, "");

        const uploadResult: any = await new Promise((resolve, reject) => {
          cloudinary.uploader
            .upload_stream(
              {
                resource_type: "raw",
                folder: "college-notes",
                public_id: `note-${Date.now()}-${baseName}`,
                use_filename: true,
                unique_filename: false,
                overwrite: true,
                format: ext || undefined,
              },
              (error, result) => {
                if (error) return reject(error);
                resolve(result);
              }
            )
            .end(buffer);
        });

        updateData.fileUrl = uploadResult.secure_url;
        updateData.fileName =
          uploadResult.original_filename + (ext ? `.${ext}` : "");
      }
    } else {
      const body = await request.json();
      const { title, content, branch, semester, subject } = body;

      if (!title || !content || !branch || !semester || !subject) {
        return NextResponse.json(
          {
            success: false,
            error: "All required fields must be filled",
          },
          { status: 400 }
        );
      }

      updateData.title = title;
      updateData.content = content;
      updateData.branch = branch;
      updateData.semester = semester;
      updateData.subject = subject;
    }

    const client = await clientPromise;
    const db = client.db();
    const notes = db.collection("notes");

    const result = await notes.updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { success: false, error: "Note not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Note updated successfully",
    });
  } catch (err) {
    console.error("UPDATE_NOTE_ERROR", err);
    return NextResponse.json(
      {
        success: false,
        error: "Server error",
      },
      { status: 500 }
    );
  }
}

// export async function PUT(
//   request: Request,
//   { params }: { params: { id: string } }
// ) {
//   try {
//     const { id } = params;

//     if (!id || !ObjectId.isValid(id)) {
//       return NextResponse.json(
//         { success: false, error: "Invalid note ID format" },
//         { status: 400 }
//       );
//     }

//     const contentType = request.headers.get('content-type');
//     let updateData: any = {
//       updatedAt: new Date()
//     };

//     if (contentType && contentType.includes('multipart/form-data')) {
//       // Handle FormData (when file is included)
//       const formData = await request.formData();
      
//       const title = formData.get('title') as string;
//       const content = formData.get('content') as string;
//       const branch = formData.get('branch') as string;
//       const semester = formData.get('semester') as string;
//       const subject = formData.get('subject') as string;
//       const file = formData.get('file') as File;

//       // Validate required fields
//       if (!title || !content || !branch || !semester || !subject) {
//         return NextResponse.json({ 
//           success: false,
//           error: "All required fields must be filled" 
//         }, { status: 400 });
//       }

//       updateData.title = title;
//       updateData.content = content;
//       updateData.branch = branch;
//       updateData.semester = semester;
//       updateData.subject = subject;

//       // Handle file upload if present
//       if (file && file.size > 0) {
//         try {
//           // Here you would handle file upload to your storage service
//           // For now, we'll just store the filename
//           updateData.fileName = file.name;
//           updateData.fileUrl = `/uploads/${file.name}`;
//         } catch (fileError) {
//           console.error('File upload error:', fileError);
//           return NextResponse.json({ 
//             success: false,
//             error: "Failed to upload file" 
//           }, { status: 500 });
//         }
//       }
//     } else {
//       // Handle JSON data (when no file is included)
//       const body = await request.json();
//       const { title, content, branch, semester, subject } = body;

//       // Validate required fields
//       if (!title || !content || !branch || !semester || !subject) {
//         return NextResponse.json({ 
//           success: false,
//           error: "All required fields must be filled" 
//         }, { status: 400 });
//       }

//       updateData.title = title;
//       updateData.content = content;
//       updateData.branch = branch;
//       updateData.semester = semester;
//       updateData.subject = subject;
//     }

//     const client = await clientPromise;
//     const db = client.db();
//     const notes = db.collection("notes");

//     const result = await notes.updateOne(
//       { _id: new ObjectId(id) },
//       { $set: updateData }
//     );

//     if (result.matchedCount === 0) {
//       return NextResponse.json({ 
//         success: false,
//         error: "Note not found" 
//       }, { status: 404 });
//     }

//     return NextResponse.json({
//       success: true,
//       message: "Note updated successfully"
//     });

//   } catch (err) {
//     console.error("UPDATE_NOTE_ERROR", err);
//     return NextResponse.json({ 
//       success: false,
//       error: "Server error" 
//     }, { status: 500 });
//   }
// }

// DELETE - Delete note(s) - supports both single and bulk deletion
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    
    // Get additional IDs from request body for bulk deletion
    let noteIds: string[] = [id];
    
    try {
      const body = await request.json();
      if (body.ids && Array.isArray(body.ids)) {
        noteIds = body.ids;
      }
    } catch {
      // Single deletion - use ID from params
      noteIds = [id];
    }

    if (!noteIds.length) {
      return NextResponse.json({ 
        success: false,
        error: "No note IDs provided" 
      }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db();
    const notes = db.collection("notes");
    
    // Convert string IDs to ObjectIds and validate them
    const objectIds = [];
    for (const noteId of noteIds) {
      if (!ObjectId.isValid(noteId)) {
        return NextResponse.json({ 
          success: false,
          error: `Invalid note ID format: ${noteId}` 
        }, { status: 400 });
      }
      objectIds.push(new ObjectId(noteId));
    }
    
    // Delete multiple notes
    const result = await notes.deleteMany({ 
      _id: { $in: objectIds } 
    });

    if (result.deletedCount === 0) {
      return NextResponse.json({ 
        success: false,
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
      success: false,
      error: "Server error" 
    }, { status: 500 });
  }
}