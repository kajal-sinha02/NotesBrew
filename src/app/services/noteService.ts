// // services/noteService.ts

// interface Filters {
//   branch?: string;
//   semester?: string;
//   subject?: string;
//   search?: string;
// }

// interface Note {
//   id: string;
//   title: string;
//   content: string;
//   branch: string;
//   semester: string;
//   subject: string;
//   uploadedBy: string;
//   organization: string;
//   createdAt: string;
// }

// interface FormData {
//   title: string;
//   content: string;
//   branch: string;
//   semester: string;
//   subject: string;
//   file: File | null;
// }

// interface Filters {
//   branch: string;
//   semester: string;
//   subject: string;
//   search: string;
// }

// interface ApiResponse<T = any> {
//   success: boolean;
//   data?: T;
//   error?: string;
//   notes?: any[];
//   totalPages?: number;
//   total?: number;
// }

interface Filters {
  branch?: string;
  semester?: string;
  subject?: string;
  search?: string;
}

interface Note {
  id: string;
  title: string;
  content: string;
  branch: string;
  semester: string;
  subject: string;
  uploadedBy: string;
  organization: string;
  createdAt: string;
}

interface FormData {
  title: string;
  content: string;
  branch: string;
  semester: string;
  subject: string;
  file: File | null;
  uploadedBy?: string;    // NEW
  organization?: string; 
}

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  notes?: any[];
  totalPages?: number;
  total?: number;
}

// Create a new note
export const createNote = async (formData: FormData): Promise<ApiResponse> => {
  try {
    const userJson = localStorage.getItem('user');
    const user = userJson ? JSON.parse(userJson) : null;
    // Validate required fields
    if (!formData.title || !formData.content || !formData.branch || !formData.semester || !formData.subject) {
      return { success: false, error: 'Please fill all required fields' };
    }

    // Create FormData object for file upload
    const submitData = new FormData();
    submitData.append('title', formData.title);
    submitData.append('content', formData.content);
    submitData.append('branch', formData.branch);
    submitData.append('semester', formData.semester);
    submitData.append('subject', formData.subject);
    
    if (formData.file) {
      submitData.append('file', formData.file);
    }
    
     if (user?.email) {
      submitData.append('uploadedBy', user.email);
    }
    if (user?.organization) {
      submitData.append('organization', user.organization);
    }

    // Make API call
    const response = await fetch('/api/notes', {
      method: 'POST',
      body: submitData,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || `HTTP error! status: ${response.status}`);
    }

    return data;
  } catch (error) {
    console.error('Create note error:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to create note' 
    };
  }
};

// Fetch notes with filters and pagination
export const fetchNotes = async (
  filters: Filters, 
  page: number = 1, 
  limit: number = 10
): Promise<ApiResponse> => {
  try {
    const params = new URLSearchParams();
    
    if (filters.branch) params.append('branch', filters.branch);
    if (filters.semester) params.append('semester', filters.semester);
    if (filters.subject) params.append('subject', filters.subject);
    if (filters.search) params.append('search', filters.search);
    
    params.append('page', page.toString());
    params.append('limit', limit.toString());

    const response = await fetch(`/api/notes?${params}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Fetch notes error:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to fetch notes',
      notes: [],
      totalPages: 1,
      total: 0
    };
  }
};

// Delete a note
export const deleteNote = async (noteId: string): Promise<ApiResponse> => {
  try {
    if (!noteId) {
      return { success: false, error: 'Note ID is required' };
    }

    const response = await fetch(`/api/notes?id=${noteId}`, {
      method: 'DELETE'
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || `HTTP error! status: ${response.status}`);
    }

    return data;
  } catch (error) {
    console.error('Delete note error:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to delete note' 
    };
  }
};

// Update a note
// export const updateNote = async (noteId: string, formData: FormData): Promise<ApiResponse> => {
//   try {
//     if (!noteId) {
//       return { success: false, error: 'Note ID is required' };
//     }

//     // Validate required fields
//     if (!formData.title || !formData.content || !formData.branch || !formData.semester || !formData.subject) {
//       return { success: false, error: 'Please fill all required fields' };
//     }

//     // Create FormData object for file upload
//     const submitData = new FormData();
//     submitData.append('title', formData.title);
//     submitData.append('content', formData.content);
//     submitData.append('branch', formData.branch);
//     submitData.append('semester', formData.semester);
//     submitData.append('subject', formData.subject);
    
//     if (formData.file) {
//       submitData.append('file', formData.file);
//     }

//     const response = await fetch(`/api/notes?id=${noteId}`, {
//       method: 'PUT',
//       body: submitData,
//     });

//     const data = await response.json();

//     if (!response.ok) {
//       throw new Error(data.error || `HTTP error! status: ${response.status}`);
//     }

//     return data;
//   } catch (error) {
//     console.error('Update note error:', error);
//     return { 
//       success: false, 
//       error: error instanceof Error ? error.message : 'Failed to update note' 
//     };
//   }
// };

interface NoteFormData {
  title: string;
  content: string;
  branch: string;
  semester: string;
  subject: string;
  file: File | null;
}

export const updateNote = async (noteId: string, formData: NoteFormData): Promise<ApiResponse> => {
  try {
    if (!noteId) {
      return { success: false, error: 'Note ID is required' };
    }

    // Validate required fields
    if (!formData.title || !formData.content || !formData.branch || !formData.semester || !formData.subject) {
      return { success: false, error: 'Please fill all required fields' };
    }

    // Check if we have a file to upload
    if (formData.file) {
      // Create FormData object for file upload
      const submitData = new FormData();
      submitData.append('title', formData.title);
      submitData.append('content', formData.content);
      submitData.append('branch', formData.branch);
      submitData.append('semester', formData.semester);
      submitData.append('subject', formData.subject);
      submitData.append('file', formData.file);

      const response = await fetch(`/api/notes/${noteId}`, {  // Fixed: Changed from query param to path param
        method: 'PUT',
        body: submitData,
      });

      // Check if response is ok before trying to parse JSON
      if (!response.ok) {
        // Try to get error message from response
        let errorMessage = `HTTP error! status: ${response.status}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        } catch {
          // Response wasn't JSON, use status text
          errorMessage = `${response.status}: ${response.statusText}`;
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      return data;
    } else {
      // Send as JSON when no file
      const response = await fetch(`/api/notes/${noteId}`, {  // Fixed: Changed from query param to path param
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: formData.title,
          content: formData.content,
          branch: formData.branch,
          semester: formData.semester,
          subject: formData.subject,
        }),
      });

      // Check if response is ok before trying to parse JSON
      if (!response.ok) {
        // Try to get error message from response
        let errorMessage = `HTTP error! status: ${response.status}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        } catch {
          // Response wasn't JSON, use status text
          errorMessage = `${response.status}: ${response.statusText}`;
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      return data;
    }
  } catch (error) {
    console.error('Update note error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update note'
    };
  }
};

// Get a single note by ID
export const getNoteById = async (noteId: string): Promise<ApiResponse> => {
  try {
    if (!noteId) {
      return { success: false, error: 'Note ID is required' };
    }

    const response = await fetch(`/api/notes/${noteId}`);
    
    if (!response.ok) {
      // Try to get error message from response
      let errorMessage = `HTTP error! status: ${response.status}`;
      try {
        const errorData = await response.json();
        errorMessage = errorData.error || errorMessage;
      } catch {
        // Response wasn't JSON, use status text
        errorMessage = `${response.status}: ${response.statusText}`;
      }
      throw new Error(errorMessage);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Get note error:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to fetch note' 
    };
  }
};
export async function fetchMyNotes(filters: Filters, page: number, limit: number) {
  const userString = localStorage.getItem("user");
  if (!userString) {
    return { success: false, error: "User not found in localStorage" };
  }

  let user;
  try {
    user = JSON.parse(userString);
  } catch {
    return { success: false, error: "Failed to parse user data" };
  }

  if (!user.email) {
    return { success: false, error: "User email not found" };
  }

  const params = new URLSearchParams({
    email: user.email,
    page: page.toString(),
    limit: limit.toString(),
  });

  if (filters.branch) params.append("branch", filters.branch);
  if (filters.semester) params.append("semester", filters.semester);
  if (filters.subject) params.append("subject", filters.subject);
  if (filters.search) params.append("search", filters.search);

  try {
    const res = await fetch(`/api/notes/user?${params.toString()}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
      },
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      return { success: false, error: errData.error || "Failed to fetch user notes" };
    }

    const data = await res.json();
    return {
      success: true,
      notes: data.notes,
      totalPages: data.totalPages,
      total: data.total,
    };
  } catch (error: any) {
    return { success: false, error: error.message || "Network error" };
  }
}
export async function fetchOrgNotes(page: number = 1, limit: number = 10) {
  const userString = localStorage.getItem("user");
  if (!userString) {
    return { success: false, error: "User not found in localStorage", notes: [], totalPages: 0, total: 0 };
  }

  let user;
  try {
    user = JSON.parse(userString);
  } catch {
    return { success: false, error: "Failed to parse user data", notes: [], totalPages: 0, total: 0 };
  }

  const orgId = user.organization;
  if (!orgId) {
    return { success: false, error: "Organization ID not found in user object", notes: [], totalPages: 0, total: 0 };
  }

  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
    organization: orgId
  });

  try {
    const res = await fetch(`/api/notes?${params.toString()}`);

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      return {
        success: false,
        error: errData.error || "Failed to fetch notes",
        notes: [],
        totalPages: 0,
        total: 0
      };
    }

    const data = await res.json();

    return {
      success: true,
      notes: data.notes,
      totalPages: data.pagination.totalPages,
      total: data.pagination.totalCount,
    };
  } catch (error: any) {
    return { success: false, error: error.message || "Network error", notes: [], totalPages: 0, total: 0 };
  }
}


// export async function fetchOrgNotes(page: number = 1, limit: number = 10) {
//   const userString = localStorage.getItem("user");
//   if (!userString) {
//     return { success: false, error: "User not found in localStorage", notes: [], totalPages: 0, total: 0 };
//   }

//   let user;
//   try {
//     user = JSON.parse(userString);
//   } catch {
//     return { success: false, error: "Failed to parse user data", notes: [], totalPages: 0, total: 0 };
//   }

//   const orgId = user.organization;
//   console.log(orgId);
//   if (!orgId) {
//     return { success: false, error: "Organization ID not found in user object", notes: [], totalPages: 0, total: 0 };
//   }

//   const params = new URLSearchParams({
//     page: page.toString(),
//     limit: limit.toString(),
//   });

//   try {
//     const res = await fetch(`/api/notes?${params.toString()}`);

//     if (!res.ok) {
//       const errData = await res.json().catch(() => ({}));
//       return { 
//         success: false, 
//         error: errData.error || "Failed to fetch notes", 
//         notes: [], 
//         totalPages: 0, 
//         total: 0 
//       };
//     }

//     const data = await res.json();

//     // Filter notes client-side by organization
//     const filteredNotes = data.notes.filter((note: any) => note.organization === orgId);

//     // Optionally, you can recalculate totalPages based on filtered count and limit
//     const total = filteredNotes.length;
//     const totalPages = Math.ceil(total / limit);

//     // Paginate filtered notes manually (because backend pagination is on unfiltered data)
//     const start = (page - 1) * limit;
//     const paginatedNotes = filteredNotes.slice(start, start + limit);

//     return {
//       success: true,
//       notes: paginatedNotes,
//       totalPages,
//       total,
//     };
//   } catch (error: any) {
//     return { success: false, error: error.message || "Network error", notes: [], totalPages: 0, total: 0 };
//   }
// }


// export async function fetchOrgNotes(page: number, limit: number) {
//   const userString = localStorage.getItem("user");
//   if (!userString) {
//     return { success: false, error: "User not found in localStorage" };
//   }

//   let user;
//   try {
//     user = JSON.parse(userString);
//   } catch {
//     return { success: false, error: "Failed to parse user data" };
//   }

//   const orgId = user.organization;
//   if (!orgId) {
//     return { success: false, error: "Organization ID not found in user object" };
//   }

//   const params = new URLSearchParams({
//     organization: orgId.toString(),
//     page: page.toString(),
//     limit: limit.toString(),
//   });

//   try {
//     const res = await fetch(`/api/notes/org?${params.toString()}`, {
//       headers: {
//         Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
//       },
//     });

//     if (!res.ok) {
//       const errData = await res.json().catch(() => ({}));
//       return { success: false, error: errData.error || "Failed to fetch notes" };
//     }

//     const data = await res.json();
//     return {
//       success: true,
//       notes: data.notes,
//       totalPages: data.totalPages,
//       total: data.total,
//     };
//   } catch (error: any) {
//     return { success: false, error: error.message || "Network error" };
//   }
// }


// export async function fetchOrgNotes(filters: Filters, page: number, limit: number) {
//   console.log("uhkjhkjhkh");
//   const userString = localStorage.getItem("user");
//   if (!userString) {
//     return { success: false, error: "User not found in localStorage" };
//   }

//   let user;
//   try {
//     user = JSON.parse(userString);
//   } catch {
//     return { success: false, error: "Failed to parse user data" };
//   }

//   // Handle case when organization is an object or a string
//   const orgId = typeof user.organization === "object" && user.organization !== null
//     ? user.organization._id || user.organization.toString()
//     : user.organization;

//   if (!orgId) {
//     return { success: false, error: "Organization ID not found in user object" };
//   }

//   const params = new URLSearchParams({
//     organization: orgId.toString(),
//     page: page.toString(),
//     limit: limit.toString(),
//   });

//   if (filters.branch) params.append("branch", filters.branch);
//   if (filters.semester) params.append("semester", filters.semester);
//   if (filters.subject) params.append("subject", filters.subject);
//   if (filters.search) params.append("search", filters.search);

//   try {
//     const res = await fetch(`/api/notes/org?${params.toString()}`, {
//       headers: {
//         Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
//       },
//     });

//     console.log("heyyyyyyyyyy");

//     if (!res.ok) {
//       const errData = await res.json().catch(() => ({}));
//       return { success: false, error: errData.error || "Failed to fetch organization notes" };
//     }

//     const data = await res.json();
//     return {
//       success: true,
//       notes: data.notes,
//       totalPages: data.totalPages,
//       total: data.total,
//     };
//   } catch (error: any) {
//     return { success: false, error: error.message || "Network error" };
//   }
// }



// export async function fetchMyNotes(
//   filters: Filters,
//   page: number,
//   limit: number
// ) {
//   // Get user object from localStorage and parse it
//   const userString = localStorage.getItem("user");
//   if (!userString) {
//     return { success: false, error: "User not found in localStorage" };
//   }

//   let user: { email: string; organization?: string };
//   try {
//     user = JSON.parse(userString);
//   } catch {
//     return { success: false, error: "Failed to parse user data" };
//   }

//   if (!user.email) {
//     return { success: false, error: "User email not found" };
//   }

//   const params = new URLSearchParams({
//     email: user.email,
//     branch: filters.branch || "",
//     semester: filters.semester || "",
//     subject: filters.subject || "",
//     search: filters.search || "",
//     page: page.toString(),
//     limit: limit.toString(),
//   });

//   try {
//     const res = await fetch(`/api/notes/user?${params.toString()}`, {
//       headers: {
//         Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
//       },
//     });

//     if (!res.ok) {
//       const errData = await res.json().catch(() => ({}));
//       return { success: false, error: errData.error || "Failed to fetch user notes" };
//     }

//     const data = await res.json();
//     return {
//       success: true,
//       notes: data.notes,
//       totalPages: data.totalPages,
//       total: data.total,
//     };
//   } catch (error: any) {
//     return { success: false, error: error.message || "Network error" };
//   }
// }

// export async function fetchOrgNotes(
//   filters: Filters,
//   page: number,
//   limit: number
// ) {
//   // Get user from localStorage to access organization
//   const userString = localStorage.getItem("user");
//   if (!userString) {
//     return { success: false, error: "User not found in localStorage" };
//   }

//   let user: { email?: string; organization?: string };
//   try {
//     user = JSON.parse(userString);
//   } catch {
//     return { success: false, error: "Failed to parse user data" };
//   }

//   if (!user.organization) {
//     return { success: false, error: "Organization not found in user data" };
//   }

//   const params = new URLSearchParams({
//     organization: user.organization,
//     branch: filters.branch || "",
//     semester: filters.semester || "",
//     subject: filters.subject || "",
//     search: filters.search || "",
//     page: page.toString(),
//     limit: limit.toString(),
//   });

//   try {
//     const res = await fetch(`/api/notes/org?${params.toString()}`, {
//       headers: {
//         Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
//       },
//     });

//     if (!res.ok) {
//       const errData = await res.json().catch(() => ({}));
//       return { success: false, error: errData.error || "Failed to fetch organization notes" };
//     }

//     const data = await res.json();
//     return {
//       success: true,
//       notes: data.notes,
//       totalPages: data.totalPages,
//       total: data.total,
//     };
//   } catch (error: any) {
//     return { success: false, error: error.message || "Network error" };
//   }
// }

// export async function fetchMyNotes(
//   filters: Filters,
//   page: number,
//   limit: number
// ) {
//   const userEmail = localStorage.getItem("userEmail"); // or get it from your auth context/state
//   if (!userEmail) {
//     return { success: false, error: "User email not found" };
//   }

//   const params = new URLSearchParams({
//     email: userEmail,
//     branch: filters.branch || "",
//     semester: filters.semester || "",
//     subject: filters.subject || "",
//     search: filters.search || "",
//     page: page.toString(),
//     limit: limit.toString(),
//   });

//   try {
//     const res = await fetch(`/api/notes/user?${params.toString()}`, {
//       headers: {
//         Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
//       },
//     });

//     if (!res.ok) {
//       const errData = await res.json().catch(() => ({}));
//       return { success: false, error: errData.error || "Failed to fetch user notes" };
//     }

//     const data = await res.json();
//     return {
//       success: true,
//       notes: data.notes,
//       totalPages: data.totalPages,
//       total: data.total,
//     };
//   } catch (error: any) {
//     return { success: false, error: error.message || "Network error" };
//   }
// }

// export async function fetchOrgNotes(
//   filters: Filters,
//   page: number,
//   limit: number
// ) {
//   const organization = localStorage.getItem("organization"); // or from your auth context/state
//   if (!organization) {
//     return { success: false, error: "Organization not found" };
//   }

//   const params = new URLSearchParams({
//     organization,
//     branch: filters.branch || "",
//     semester: filters.semester || "",
//     subject: filters.subject || "",
//     search: filters.search || "",
//     page: page.toString(),
//     limit: limit.toString(),
//   });

//   try {
//     const res = await fetch(`/api/notes/org?${params.toString()}`, {
//       headers: {
//         Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
//       },
//     });

//     if (!res.ok) {
//       const errData = await res.json().catch(() => ({}));
//       return { success: false, error: errData.error || "Failed to fetch organization notes" };
//     }

//     const data = await res.json();
//     return {
//       success: true,
//       notes: data.notes,
//       totalPages: data.totalPages,
//       total: data.total,
//     };
//   } catch (error: any) {
//     return { success: false, error: error.message || "Network error" };
//   }
// }


// services/noteService.ts

// export async function fetchNotesByUser(
//   email: string,
//   page: number,
//   limit: number
// ): Promise<{ success: boolean; notes?: Note[]; totalPages?: number; total?: number; error?: string }> {
//   try {
//     const res = await fetch(`/api/notes/user?email=${encodeURIComponent(email)}&page=${page}&limit=${limit}`);
//     return await res.json();
//   } catch (error) {
//     return { success: false, error: "Network error" };
//   }
// }

// export async function fetchNotesByOrganization(
//   organization: string,
//   page: number,
//   limit: number
// ): Promise<{ success: boolean; notes?: Note[]; totalPages?: number; total?: number; error?: string }> {
//   try {
//     const res = await fetch(`/api/notes/org?organization=${encodeURIComponent(organization)}&page=${page}&limit=${limit}`);
//     return await res.json();
//   } catch (error) {
//     return { success: false, error: "Network error" };
//   }
// }

// export async function fetchNotesByOrg(organization: string, page = 1, limit = 10) {
//   if (!organization) throw new Error("Organization is required");
//   const res = await fetch(`/api/notes/org?organization=${organization}&page=${page}&limit=${limit}`);
//   return res.json();
// }


// export async function fetchNotesByUser(email: string, page = 1, limit = 10) {
//   if (!email) throw new Error("Email is required");
//   const res = await fetch(`/api/notes/user?email=${email}&page=${page}&limit=${limit}`);
//   return res.json();
// }

// noteService.ts
// export async function fetchNotesByUser(email: string, page = 1, limit = 10) {
//   const res = await fetch(`/api/notes/user?email=${email}&page=${page}&limit=${limit}`);
//   return res.json();
// }

// export async function fetchNotesByOrg(organization: string, page = 1, limit = 10) {
//   const res = await fetch(`/api/notes/org?organization=${organization}&page=${page}&limit=${limit}`);
//   return res.json();
// }

// export const updateNote = async (noteId: string, formData: NoteFormData): Promise<ApiResponse> => {
//   try {
//     if (!noteId) {
//       return { success: false, error: 'Note ID is required' };
//     }

//     // Validate required fields
//     if (!formData.title || !formData.content || !formData.branch || !formData.semester || !formData.subject) {
//       return { success: false, error: 'Please fill all required fields' };
//     }

//     // Check if we have a file to upload
//     if (formData.file) {
//       // Create FormData object for file upload
//       const submitData = new FormData();
//       submitData.append('title', formData.title);
//       submitData.append('content', formData.content);
//       submitData.append('branch', formData.branch);
//       submitData.append('semester', formData.semester);
//       submitData.append('subject', formData.subject);
//       submitData.append('file', formData.file);

//       const response = await fetch(`/api/notes?id=${noteId}`, {
//         method: 'PUT',
//         body: submitData,
//       });

//       const data = await response.json();

//       if (!response.ok) {
//         throw new Error(data.error || `HTTP error! status: ${response.status}`);
//       }

//       return data;
//     } else {
//       // Send as JSON when no file
//       const response = await fetch(`/api/notes?id=${noteId}`, {
//         method: 'PUT',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({
//           title: formData.title,
//           content: formData.content,
//           branch: formData.branch,
//           semester: formData.semester,
//           subject: formData.subject,
//         }),
//       });

//       const data = await response.json();

//       if (!response.ok) {
//         throw new Error(data.error || `HTTP error! status: ${response.status}`);
//       }

//       return data;
//     }
//   } catch (error) {
//     console.error('Update note error:', error);
//     return {
//       success: false,
//       error: error instanceof Error ? error.message : 'Failed to update note'
//     };
//   }
// };

// // Get a single note by ID
// export const getNoteById = async (noteId: string): Promise<ApiResponse> => {
//   try {
//     if (!noteId) {
//       return { success: false, error: 'Note ID is required' };
//     }

//     const response = await fetch(`/api/notes/${noteId}`);
    
//     if (!response.ok) {
//       throw new Error(`HTTP error! status: ${response.status}`);
//     }
    
//     const data = await response.json();
//     return data;
//   } catch (error) {
//     console.error('Get note error:', error);
//     return { 
//       success: false, 
//       error: error instanceof Error ? error.message : 'Failed to fetch note' 
//     };
//   }
// };

// Bulk delete notes
export const bulkDeleteNotes = async (noteIds: string[]): Promise<ApiResponse> => {
  try {
    if (!noteIds || noteIds.length === 0) {
      return { success: false, error: 'Note IDs are required' };
    }

    // Use DELETE on /api/notes for bulk deletion
    const response = await fetch('/api/notes', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids: noteIds }),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || `HTTP error! status: ${response.status}`);
    }

    return data;
  } catch (error) {
    console.error('Bulk delete error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete notes',
    };
  }
};
