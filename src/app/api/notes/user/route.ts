// File: /api/notes/user/route.ts
import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '../../../lib/mongodb';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');
    const branch = searchParams.get('branch');
    const semester = searchParams.get('semester');
    const subject = searchParams.get('subject');
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    if (!email) {
      return NextResponse.json({ success: false, error: 'Email is required' }, { status: 400 });
    }

    if (page < 1 || limit < 1 || limit > 100) {
      return NextResponse.json(
        { success: false, error: 'Invalid pagination parameters' },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db();
    const notes = db.collection('notes');

    const filter: any = { uploadedBy: email };
    if (branch) filter.branch = branch;
    if (semester) filter.semester = semester;
    if (subject) filter.subject = subject;

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } },
        { subject: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (page - 1) * limit;
    const [notesList, totalCount] = await Promise.all([
      notes.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).toArray(),
      notes.countDocuments(filter)
    ]);

    const transformedNotes = notesList.map(note => ({
      id: note._id.toString(),
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
    }));

    const totalPages = Math.ceil(totalCount / limit);

    return NextResponse.json({
      success: true,
      notes: transformedNotes,
      totalPages,
      total: totalCount
    });

  } catch (error) {
    console.error('GET_USER_NOTES_ERROR', error);
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}
