// app/api/notes/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';

let inMemoryNotes: Note[] = [];

// Define types
interface Note {
  id: number;
  title: string;
  content: string;
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
  cloudinaryId?: string;
  createdAt: string;
}

interface ApiResponse {
  success: boolean;
  note?: Note;
  notes?: Note[];
  message?: string;
  error?: string;
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    
    // Get the uploaded file
    const file = formData.get('file') as File | null;
    const noteTitle = formData.get('title') as string;
    const noteContent = formData.get('content') as string;
    
    if (!file) {
      return NextResponse.json(
        { error: 'No file uploaded' },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Create uploads directory if it doesn't exist
    const uploadsDir = join(process.cwd(), 'public', 'uploads');
    try {
      await mkdir(uploadsDir, { recursive: true });
    } catch (error: any) {
      // Directory might already exist
    }

    // Generate unique filename
    const timestamp = Date.now();
    const filename = `${timestamp}-${file.name}`;
    const filepath = join(uploadsDir, filename);

    // Save the file
    await writeFile(filepath, buffer);

    // Create note object with file URL
    const note: Note = {
      id: timestamp,
      title: noteTitle,
      content: noteContent,
      fileUrl: `/uploads/${filename}`,
      fileName: file.name,
      fileSize: file.size,
      createdAt: new Date().toISOString()
    };

    // Here you would typically save to your database
    // For now, we'll just return the note object

    return NextResponse.json<ApiResponse>({
      success: true,
      note: note,
      message: 'Note created with file upload successfully'
    });

  } catch (error: any) {
    console.error('Upload error:', error);
    return NextResponse.json<ApiResponse>(
      { 
        success: false,
        error: 'Failed to upload file' 
      },
      { status: 500 }
    );
  }
}

// Handle GET requests for retrieving notes
export async function GET(request: NextRequest) {
  try {
    // Your existing GET logic here
    // This is just an example - replace with your actual data source
    const notes: Note[] = [
      // Your notes array or database query results
      // Example:
      // {
      //   id: 1,
      //   title: "Sample Note",
      //   content: "This is a sample note",
      //   createdAt: new Date().toISOString()
      // }
    ];

    return NextResponse.json<ApiResponse>({
      success: true,
      notes: notes
    });

  } catch (error: any) {
    return NextResponse.json<ApiResponse>(
      { 
        success: false,
        error: 'Failed to fetch notes' 
      },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const id = parseInt(url.searchParams.get('id') || '', 10);
    const formData = await request.formData();

    const note = inMemoryNotes.find(n => n.id === id);
    if (!note) {
      return NextResponse.json<ApiResponse>({ success: false, error: 'Note not found' }, { status: 404 });
    }

    // Update fields
    ['title', 'content', 'branch', 'semester', 'subject'].forEach(key => {
      const val = formData.get(key);
      if (typeof val === 'string') (note as any)[key] = val;
    });

    const file = formData.get('file') as File | null;
    if (file) {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const timestamp = Date.now();
      const name = `${timestamp}-${file.name}`;
      const filepath = join(process.cwd(), 'public', 'uploads', name);
      await writeFile(filepath, buffer);
      note.fileUrl = `/uploads/${name}`;
      note.fileName = file.name;
      note.fileSize = file.size;
    }

    return NextResponse.json<ApiResponse>({ success: true, note });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json<ApiResponse>({ success: false, error: err.message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const url = new URL(request.url);
  const id = url.searchParams.get('id');
  const body = await request.json().catch(() => null);

  // Bulk delete
  if (body && Array.isArray(body.ids)) {
    inMemoryNotes = inMemoryNotes.filter(n => !body.ids.includes(n.id));
    return NextResponse.json<ApiResponse>({ success: true, message: 'Bulk delete successful' });
  }

  // Single delete by query param
  if (id) {
    const numId = parseInt(id, 10);
    inMemoryNotes = inMemoryNotes.filter(n => n.id !== numId);
    return NextResponse.json<ApiResponse>({ success: true, message: 'Delete successful' });
  }

  return NextResponse.json<ApiResponse>({ success: false, error: 'ID(s) required' }, { status: 400 });
}