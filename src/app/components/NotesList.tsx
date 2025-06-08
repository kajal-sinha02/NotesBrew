import React, { useState } from "react";

interface Note {
  id?: string;
  _id?: string;
  title: string;
  content: string;
  branch: string;
  semester: string;
  subject: string;
  fileUrl?: string;
  fileName?: string;
  uploadedBy?: string; // User ID who uploaded the note
}

interface NotesListProps {
  notes: Note[];
  loading: boolean;
  selectedNotes: string[];
  onDeleteNote: (noteId: string) => Promise<void>;
  onEditNote: (noteId: string) => Promise<void>;
  onSelectNote: (noteId: string) => void;
  onSelectAll: () => void;
}

interface Notification {
  id: number;
  message: string;
  type: 'success' | 'error';
}

export default function NotesList({
  notes,
  loading,
  selectedNotes,
  onDeleteNote,
  onEditNote,
  onSelectNote,
  onSelectAll,
}: NotesListProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');

  // Get current user from localStorage
  const getCurrentUser = () => {
    try {
      const userString = localStorage.getItem('user');
      if (userString) {
        const user = JSON.parse(userString);
        // Return email since uploadedBy field contains email
        return user.email || user.id || user._id;
      }
    } catch (error) {
      console.error('Error parsing user from localStorage:', error);
    }
    return null;
  };

  const showNotification = (message: string, type: 'success' | 'error' = 'success') => {
    const id = Date.now();
    const notification = { id, message, type };
    
    setNotifications(prev => [...prev, notification]);
    
    // Auto remove notification after 3 seconds
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 3000);
  };

  const copyToClipboard = async (text: string, fileName?: string) => {
    try {
      await navigator.clipboard.writeText(text);
      showNotification(
        `${fileName ? `"${fileName}"` : 'File URL'} copied to clipboard!`,
        'success'
      );
    } catch (err) {
      showNotification('Failed to copy to clipboard', 'error');
    }
  };

  const handleFileClick = (e: React.MouseEvent, fileUrl: string, fileName?: string) => {
    e.preventDefault();
    // Copy to clipboard
    copyToClipboard(fileUrl, fileName);
    // Open link in new tab
    window.open(fileUrl, '_blank', 'noopener,noreferrer');
  };

  const removeNotification = (id: number) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  // Check if the current user can edit/delete a note
  const canEditDelete = (note: Note): boolean => {
    const currentUserIdentifier = getCurrentUser();
    // console.log('Current User Identifier:', currentUserIdentifier);
    // console.log('Note uploaded by:', note.uploadedBy);
    
    // If no current user or no uploadedBy field, don't allow edit/delete
    if (!currentUserIdentifier || !note.uploadedBy) {
      return false;
    }
    
    // Compare current user identifier with the note's uploadedBy field
    // Since uploadedBy contains email, we compare with email
    return note.uploadedBy === currentUserIdentifier;
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="text-white font-mono">Loading notes...</div>
    </div>
  );

  if (notes.length === 0) return (
    <div className="flex items-center justify-center h-64">
      <div className="text-gray-400 font-mono">No notes found.</div>
    </div>
  );

  const allSelected = selectedNotes.length === notes.length && notes.length > 0;

  // Mobile Card Component
  const NoteCard = ({ note }: { note: Note }) => {
    const noteId = note.id || note._id || "";
    const isSelected = selectedNotes.includes(noteId);
    const userCanEditDelete = canEditDelete(note);

    return (
      <div className={`
        bg-gray-800 border border-gray-700 rounded-lg p-4 space-y-3
        transition-all duration-200 hover:bg-gray-750 hover:border-gray-600
        ${isSelected ? 'ring-2 ring-green-500 border-green-500' : ''}
      `}>
        {/* Header with checkbox and actions */}
        <div className="flex items-center justify-between">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={() => onSelectNote(noteId)}
            aria-label={`Select note ${note.title}`}
            className="cursor-pointer w-4 h-4"
          />
          <div className="flex space-x-2">
            {userCanEditDelete ? (
              <>
                <button
                  onClick={() => onEditNote(noteId)}
                  className="text-blue-400 hover:text-blue-300 text-sm font-mono transition-colors"
                >
                  [EDIT]
                </button>
                <button
                  onClick={() => onDeleteNote(noteId)}
                  className="text-red-500 hover:text-red-400 text-sm font-mono transition-colors"
                >
                  [DEL]
                </button>
              </>
            ) : (
              <span className="text-gray-500 italic text-xs font-mono">
                VIEW_ONLY
              </span>
            )}
          </div>
        </div>

        {/* Title */}
        <div className="space-y-1">
          <div className="text-xs text-green-400 font-mono">TITLE:</div>
          <div className="text-white font-mono font-bold break-words">{note.title}</div>
        </div>

        {/* Content */}
        <div className="space-y-1">
          <div className="text-xs text-green-400 font-mono">CONTENT:</div>
          <div className="text-gray-300 font-mono text-sm break-words line-clamp-3">{note.content}</div>
        </div>

        {/* Academic Info */}
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div>
            <div className="text-cyan-400 font-mono">BRANCH:</div>
            <div className="text-white font-mono">{note.branch}</div>
          </div>
          <div>
            <div className="text-cyan-400 font-mono">SEM:</div>
            <div className="text-white font-mono">{note.semester}</div>
          </div>
          <div>
            <div className="text-cyan-400 font-mono">SUBJECT:</div>
            <div className="text-white font-mono">{note.subject}</div>
          </div>
          <div>
            <div className="text-cyan-400 font-mono">BY:</div>
            <div className="text-white font-mono text-xs truncate" title={note.uploadedBy}>
              {note.uploadedBy || 'Unknown'}
            </div>
          </div>
        </div>

        {/* File */}
        {note.fileUrl && (
          <div className="space-y-1">
            <div className="text-xs text-green-400 font-mono">FILE:</div>
            <button
              onClick={(e) => handleFileClick(e, note.fileUrl!, note.fileName)}
              className="text-blue-400 hover:text-blue-300 hover:underline transition-colors duration-200 flex items-center space-x-2 text-sm font-mono"
              title={`Click to copy and open: ${note.fileName || note.fileUrl}`}
            >
              <span className="truncate">{note.fileName || "View File"}</span>
              <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z"/>
                <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z"/>
              </svg>
            </button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="relative">
      {/* Notification Container */}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {notifications.map((notification) => (
          <div
            key={notification.id}
            className={`
              px-4 py-3 rounded-lg shadow-lg border border-opacity-20 
              backdrop-blur-sm transition-all duration-300 ease-in-out
              max-w-sm min-w-[250px] cursor-pointer
              ${notification.type === 'success' 
                ? 'bg-green-900/90 border-green-500 text-green-100' 
                : 'bg-red-900/90 border-red-500 text-red-100'
              }
            `}
            onClick={() => removeNotification(notification.id)}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                {notification.type === 'success' ? (
                  <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                )}
                <span className="text-sm font-medium">{notification.message}</span>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  removeNotification(notification.id);
                }}
                className="ml-2 text-gray-300 hover:text-white"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* View Toggle Controls */}
      <div className="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        {/* Select All */}
        <div className="flex items-center space-x-3">
          <input
            type="checkbox"
            checked={allSelected}
            onChange={onSelectAll}
            aria-label="Select all notes"
            className="cursor-pointer w-4 h-4"
          />
          <span className="text-green-400 font-mono text-sm">
            SELECT_ALL ({selectedNotes.length}/{notes.length})
          </span>
        </div>

        {/* View Mode Toggle */}
        <div className="flex bg-gray-800 rounded-lg p-1 border border-gray-700">
          <button
            onClick={() => setViewMode('table')}
            className={`px-3 py-1 rounded font-mono text-sm transition-all ${
              viewMode === 'table'
                ? 'bg-green-600 text-black'
                : 'text-gray-300 hover:text-white'
            }`}
          >
            [TABLE]
          </button>
          <button
            onClick={() => setViewMode('cards')}
            className={`px-3 py-1 rounded font-mono text-sm transition-all ${
              viewMode === 'cards'
                ? 'bg-green-600 text-black'
                : 'text-gray-300 hover:text-white'
            }`}
          >
            [CARDS]
          </button>
        </div>
      </div>

      {/* Content based on view mode */}
      {viewMode === 'cards' ? (
        /* Mobile Card View */
        <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {notes.map((note) => (
            <NoteCard key={note.id || note._id} note={note} />
          ))}
        </div>
      ) : (
        /* Desktop Table View */
        <div className="overflow-x-auto">
          <table className="w-full border-collapse min-w-[1000px]">
            <thead>
              <tr className="bg-black border-b border-gray-700">
                <th className="p-3 text-left text-white font-mono text-sm">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={onSelectAll}
                    aria-label="Select all notes"
                    className="cursor-pointer"
                  />
                </th>
                <th className="p-3 text-left text-white font-mono text-sm">TITLE</th>
                <th className="p-3 text-left text-white font-mono text-sm">CONTENT</th>
                <th className="p-3 text-left text-white font-mono text-sm">BRANCH</th>
                <th className="p-3 text-left text-white font-mono text-sm">SEM</th>
                <th className="p-3 text-left text-white font-mono text-sm">SUBJECT</th>
                <th className="p-3 text-left text-white font-mono text-sm">UPLOADED_BY</th>
                <th className="p-3 text-left text-white font-mono text-sm">FILE</th>
                <th className="p-3 text-left text-white font-mono text-sm">ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {notes.map((note) => {
                const noteId = note.id || note._id || "";
                const isSelected = selectedNotes.includes(noteId);
                const userCanEditDelete = canEditDelete(note);

                return (
                  <tr key={noteId} className="bg-gray-800 border-b border-gray-800 hover:bg-gray-700">
                    <td className="p-3">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => onSelectNote(noteId)}
                        aria-label={`Select note ${note.title}`}
                        className="cursor-pointer"
                      />
                    </td>

                    <td className="p-3 max-w-xs truncate text-white font-mono" title={note.title}>
                      {note.title}
                    </td>

                    <td className="p-3 max-w-xs truncate text-gray-300 font-mono">
                      {note.content}
                    </td>

                    <td className="p-3 text-gray-300 font-mono">{note.branch}</td>
                    <td className="p-3 text-gray-300 font-mono">{note.semester}</td>
                    <td className="p-3 text-gray-300 font-mono">{note.subject}</td>
                    <td className="p-3 max-w-xs truncate text-cyan-400 font-mono" title={note.uploadedBy}>
                      {note.uploadedBy || 'Unknown'}
                    </td>

                    <td className="p-3 max-w-xs truncate">
                      {note.fileUrl ? (
                        <button
                          onClick={(e) => handleFileClick(e, note.fileUrl!, note.fileName)}
                          className="text-blue-400 hover:text-blue-300 hover:underline transition-colors duration-200 flex items-center space-x-1 font-mono"
                          title={`Click to copy and open: ${note.fileName || note.fileUrl}`}
                        >
                          <span>{note.fileName || "View File"}</span>
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z"/>
                            <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z"/>
                          </svg>
                        </button>
                      ) : (
                        <span className="text-gray-500 italic font-mono">No file</span>
                      )}
                    </td>

                    <td className="p-3 whitespace-nowrap">
                      {userCanEditDelete ? (
                        <>
                          <button
                            onClick={() => onEditNote(noteId)}
                            className="mr-2 text-blue-400 hover:text-blue-300 hover:underline transition-colors duration-200 font-mono"
                          >
                            [EDIT]
                          </button>
                          <button
                            onClick={() => onDeleteNote(noteId)}
                            className="text-red-500 hover:text-red-400 hover:underline transition-colors duration-200 font-mono"
                          >
                            [DEL]
                          </button>
                        </>
                      ) : (
                        <span className="text-gray-500 italic text-sm font-mono">
                          VIEW_ONLY
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
// import React, { useState } from "react";

// interface Note {
//   id?: string;
//   _id?: string;
//   title: string;
//   content: string;
//   branch: string;
//   semester: string;
//   subject: string;
//   fileUrl?: string;
//   fileName?: string;
//   uploadedBy?: string; // User ID who uploaded the note
// }

// interface NotesListProps {
//   notes: Note[];
//   loading: boolean;
//   selectedNotes: string[];
//   onDeleteNote: (noteId: string) => Promise<void>;
//   onEditNote: (noteId: string) => Promise<void>;
//   onSelectNote: (noteId: string) => void;
//   onSelectAll: () => void;
// }

// interface Notification {
//   id: number;
//   message: string;
//   type: 'success' | 'error';
// }

// export default function NotesList({
//   notes,
//   loading,
//   selectedNotes,
//   onDeleteNote,
//   onEditNote,
//   onSelectNote,
//   onSelectAll,
// }: NotesListProps) {
//   const [notifications, setNotifications] = useState<Notification[]>([]);

//   // Get current user from localStorage
//     const getCurrentUser = () => {
//     try {
//       const userString = localStorage.getItem('user');
//       if (userString) {
//         const user = JSON.parse(userString);
//         // Return email since uploadedBy field contains email
//         return user.email || user.id || user._id;
//       }
//     } catch (error) {
//       console.error('Error parsing user from localStorage:', error);
//     }
//     return null;
//   };
//   // const getCurrentUser = () => {
//   //   try {
//   //     const userString = localStorage.getItem('user');
//   //     if (userString) {
//   //       const user = JSON.parse(userString);
//   //       return user.id || user._id; // Handle both id and _id fields
//   //     }
//   //   } catch (error) {
//   //     console.error('Error parsing user from localStorage:', error);
//   //   }
//   //   return null;
//   // };

//   const showNotification = (message: string, type: 'success' | 'error' = 'success') => {
//     const id = Date.now();
//     const notification = { id, message, type };
    
//     setNotifications(prev => [...prev, notification]);
    
//     // Auto remove notification after 3 seconds
//     setTimeout(() => {
//       setNotifications(prev => prev.filter(n => n.id !== id));
//     }, 3000);
//   };

//   const copyToClipboard = async (text: string, fileName?: string) => {
//     try {
//       await navigator.clipboard.writeText(text);
//       showNotification(
//         `${fileName ? `"${fileName}"` : 'File URL'} copied to clipboard!`,
//         'success'
//       );
//     } catch (err) {
//       showNotification('Failed to copy to clipboard', 'error');
//     }
//   };

//   const handleFileClick = (e: React.MouseEvent, fileUrl: string, fileName?: string) => {
//     e.preventDefault();
//     // Copy to clipboard
//     copyToClipboard(fileUrl, fileName);
//     // Open link in new tab
//     window.open(fileUrl, '_blank', 'noopener,noreferrer');
//   };

//   const removeNotification = (id: number) => {
//     setNotifications(prev => prev.filter(n => n.id !== id));
//   };

//   // Check if the current user can edit/delete a note
//   const canEditDelete = (note: Note): boolean => {
//     const currentUserId = getCurrentUser();
//     console.log('Current User ID:', currentUserId);
//     console.log('Note uploaded by:', note.uploadedBy);
    
//     // If no current user or no uploadedBy field, don't allow edit/delete
//     if (!currentUserId || !note.uploadedBy) {
//       return false;
//     }
    
//     // Compare current user ID with the note's uploadedBy field
//     return note.uploadedBy === currentUserId;
//   };

//   if (loading) return <div>Loading notes...</div>;

//   if (notes.length === 0) return <div>No notes found.</div>;

//   const allSelected = selectedNotes.length === notes.length && notes.length > 0;

//   return (
//     <div className="relative">
//       {/* Notification Container */}
//       <div className="fixed top-4 right-4 z-50 space-y-2">
//         {notifications.map((notification) => (
//           <div
//             key={notification.id}
//             className={`
//               px-4 py-3 rounded-lg shadow-lg border border-opacity-20 
//               backdrop-blur-sm transition-all duration-300 ease-in-out
//               max-w-sm min-w-[250px] cursor-pointer
//               ${notification.type === 'success' 
//                 ? 'bg-green-900/90 border-green-500 text-green-100' 
//                 : 'bg-red-900/90 border-red-500 text-red-100'
//               }
//             `}
//             onClick={() => removeNotification(notification.id)}
//           >
//             <div className="flex items-center justify-between">
//               <div className="flex items-center space-x-2">
//                 {notification.type === 'success' ? (
//                   <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
//                     <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
//                   </svg>
//                 ) : (
//                   <svg className="w-5 h-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
//                     <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
//                   </svg>
//                 )}
//                 <span className="text-sm font-medium">{notification.message}</span>
//               </div>
//               <button
//                 onClick={(e) => {
//                   e.stopPropagation();
//                   removeNotification(notification.id);
//                 }}
//                 className="ml-2 text-gray-300 hover:text-white"
//               >
//                 <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
//                   <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
//                 </svg>
//               </button>
//             </div>
//           </div>
//         ))}
//       </div>

//       {/* Notes Table */}
//       <div className="overflow-x-auto">
//         <table className="w-full border-collapse min-w-[900px]">
//           <thead>
//             <tr className="bg-black border-b border-gray-700">
//               <th className="p-3 text-left text-white">
//                 <input
//                   type="checkbox"
//                   checked={allSelected}
//                   onChange={onSelectAll}
//                   aria-label="Select all notes"
//                   className="cursor-pointer"
//                 />
//               </th>
//               <th className="p-3 text-left text-white">Title</th>
//               <th className="p-3 text-left text-white">Content</th>
//               <th className="p-3 text-left text-white">Branch</th>
//               <th className="p-3 text-left text-white">Semester</th>
//               <th className="p-3 text-left text-white">Subject</th>
//               <th className="p-3 text-left text-white">File</th>
//               <th className="p-3 text-left text-white">Actions</th>
//             </tr>
//           </thead>
//           <tbody>
//             {notes.map((note) => {
//               const noteId = note.id || note._id || "";
//               const isSelected = selectedNotes.includes(noteId);
//               const userCanEditDelete = canEditDelete(note);

//               return (
//                 <tr key={noteId} className="bg-gray-800 border-b border-gray-800 hover:bg-gray-700">
//                   <td className="p-3">
//                     <input
//                       type="checkbox"
//                       checked={isSelected}
//                       onChange={() => onSelectNote(noteId)}
//                       aria-label={`Select note ${note.title}`}
//                       className="cursor-pointer"
//                     />
//                   </td>

//                   <td className="p-3 max-w-xs truncate text-white" title={note.title}>
//                     {note.title}
//                   </td>

//                   <td className="p-3 max-w-xs truncate text-gray-300">
//                     {note.content}
//                   </td>

//                   <td className="p-3 text-gray-300">{note.branch}</td>
//                   <td className="p-3 text-gray-300">{note.semester}</td>
//                   <td className="p-3 text-gray-300">{note.subject}</td>

//                   <td className="p-3 max-w-xs truncate">
//                     {note.fileUrl ? (
//                       <button
//                         onClick={(e) => handleFileClick(e, note.fileUrl!, note.fileName)}
//                         className="text-blue-400 hover:text-blue-300 hover:underline transition-colors duration-200 flex items-center space-x-1"
//                         title={`Click to copy and open: ${note.fileName || note.fileUrl}`}
//                       >
//                         <span>{note.fileName || "View File"}</span>
//                         <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
//                           <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z"/>
//                           <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z"/>
//                         </svg>
//                       </button>
//                     ) : (
//                       <span className="text-gray-500 italic">No file</span>
//                     )}
//                   </td>

//                   <td className="p-3 whitespace-nowrap">
//                     {userCanEditDelete ? (
//                       <>
//                         <button
//                           onClick={() => onEditNote(noteId)}
//                           className="mr-2 text-blue-400 hover:text-blue-300 hover:underline transition-colors duration-200"
//                         >
//                           Edit
//                         </button>
//                         <button
//                           onClick={() => onDeleteNote(noteId)}
//                           className="text-red-500 hover:text-red-400 hover:underline transition-colors duration-200"
//                         >
//                           Delete
//                         </button>
//                       </>
//                     ) : (
//                       <span className="text-gray-500 italic text-sm">
//                         View Only
//                       </span>
//                     )}
//                   </td>
//                 </tr>
//               );
//             })}
//           </tbody>
//         </table>
//       </div>
//     </div>
//   );
// }

// import React, { useState } from "react";

// interface Note {
//   id?: string;
//   _id?: string;
//   title: string;
//   content: string;
//   branch: string;
//   semester: string;
//   subject: string;
//   fileUrl?: string;
//   fileName?: string;
// }

// interface NotesListProps {
//   notes: Note[];
//   loading: boolean;
//   selectedNotes: string[];
//   onDeleteNote: (noteId: string) => Promise<void>;
//   onEditNote: (noteId: string) => Promise<void>;
//   onSelectNote: (noteId: string) => void;
//   onSelectAll: () => void;
// }

// interface Notification {
//   id: number;
//   message: string;
//   type: 'success' | 'error';
// }

// export default function NotesList({
//   notes,
//   loading,
//   selectedNotes,
//   onDeleteNote,
//   onEditNote,
//   onSelectNote,
//   onSelectAll,
// }: NotesListProps) {
//   const [notifications, setNotifications] = useState<Notification[]>([]);

//   const showNotification = (message: string, type: 'success' | 'error' = 'success') => {
//     const id = Date.now();
//     const notification = { id, message, type };
    
//     setNotifications(prev => [...prev, notification]);
    
//     // Auto remove notification after 3 seconds
//     setTimeout(() => {
//       setNotifications(prev => prev.filter(n => n.id !== id));
//     }, 3000);
//   };

//   const copyToClipboard = async (text: string, fileName?: string) => {
//     try {
//       await navigator.clipboard.writeText(text);
//       showNotification(
//         `${fileName ? `"${fileName}"` : 'File URL'} copied to clipboard!`,
//         'success'
//       );
//     } catch (err) {
//       showNotification('Failed to copy to clipboard', 'error');
//     }
//   };

//   const handleFileClick = (e: React.MouseEvent, fileUrl: string, fileName?: string) => {
//     e.preventDefault();
//     // Copy to clipboard
//     copyToClipboard(fileUrl, fileName);
//     // Open link in new tab
//     window.open(fileUrl, '_blank', 'noopener,noreferrer');
//   };

//   const removeNotification = (id: number) => {
//     setNotifications(prev => prev.filter(n => n.id !== id));
//   };

//   if (loading) return <div>Loading notes...</div>;

//   if (notes.length === 0) return <div>No notes found.</div>;

//   const allSelected = selectedNotes.length === notes.length && notes.length > 0;

//   return (
//     <div className="relative">
//       {/* Notification Container */}
//       <div className="fixed top-4 right-4 z-50 space-y-2">
//         {notifications.map((notification) => (
//           <div
//             key={notification.id}
//             className={`
//               px-4 py-3 rounded-lg shadow-lg border border-opacity-20 
//               backdrop-blur-sm transition-all duration-300 ease-in-out
//               max-w-sm min-w-[250px] cursor-pointer
//               ${notification.type === 'success' 
//                 ? 'bg-green-900/90 border-green-500 text-green-100' 
//                 : 'bg-red-900/90 border-red-500 text-red-100'
//               }
//             `}
//             onClick={() => removeNotification(notification.id)}
//           >
//             <div className="flex items-center justify-between">
//               <div className="flex items-center space-x-2">
//                 {notification.type === 'success' ? (
//                   <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
//                     <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
//                   </svg>
//                 ) : (
//                   <svg className="w-5 h-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
//                     <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
//                   </svg>
//                 )}
//                 <span className="text-sm font-medium">{notification.message}</span>
//               </div>
//               <button
//                 onClick={(e) => {
//                   e.stopPropagation();
//                   removeNotification(notification.id);
//                 }}
//                 className="ml-2 text-gray-300 hover:text-white"
//               >
//                 <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
//                   <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
//                 </svg>
//               </button>
//             </div>
//           </div>
//         ))}
//       </div>

//       {/* Notes Table */}
//       <div className="overflow-x-auto">
//         <table className="w-full border-collapse min-w-[900px]">
//           <thead>
//             <tr className="bg-black border-b border-gray-700">
//               <th className="p-3 text-left text-white">
//                 <input
//                   type="checkbox"
//                   checked={allSelected}
//                   onChange={onSelectAll}
//                   aria-label="Select all notes"
//                   className="cursor-pointer"
//                 />
//               </th>
//               <th className="p-3 text-left text-white">Title</th>
//               <th className="p-3 text-left text-white">Content</th>
//               <th className="p-3 text-left text-white">Branch</th>
//               <th className="p-3 text-left text-white">Semester</th>
//               <th className="p-3 text-left text-white">Subject</th>
//               <th className="p-3 text-left text-white">File</th>
//               <th className="p-3 text-left text-white">Actions</th>
//             </tr>
//           </thead>
//           <tbody>
//             {notes.map((note) => {
//               const noteId = note.id || note._id || "";
//               const isSelected = selectedNotes.includes(noteId);

//               return (
//                 <tr key={noteId} className="bg-gray-800 border-b border-gray-800 hover:bg-gray-700">
//                   <td className="p-3">
//                     <input
//                       type="checkbox"
//                       checked={isSelected}
//                       onChange={() => onSelectNote(noteId)}
//                       aria-label={`Select note ${note.title}`}
//                       className="cursor-pointer"
//                     />
//                   </td>

//                   <td className="p-3 max-w-xs truncate text-white" title={note.title}>
//                     {note.title}
//                   </td>

//                   <td className="p-3 max-w-xs truncate text-gray-300">
//                     {note.content}
//                   </td>

//                   <td className="p-3 text-gray-300">{note.branch}</td>
//                   <td className="p-3 text-gray-300">{note.semester}</td>
//                   <td className="p-3 text-gray-300">{note.subject}</td>

//                   <td className="p-3 max-w-xs truncate">
//                     {note.fileUrl ? (
//                       <button
//                         onClick={(e) => handleFileClick(e, note.fileUrl!, note.fileName)}
//                         className="text-blue-400 hover:text-blue-300 hover:underline transition-colors duration-200 flex items-center space-x-1"
//                         title={`Click to copy and open: ${note.fileName || note.fileUrl}`}
//                       >
//                         <span>{note.fileName || "View File"}</span>
//                         <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
//                           <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z"/>
//                           <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z"/>
//                         </svg>
//                       </button>
//                     ) : (
//                       <span className="text-gray-500 italic">No file</span>
//                     )}
//                   </td>

//                   <td className="p-3 whitespace-nowrap">
//                     <button
//                       onClick={() => onEditNote(noteId)}
//                       className="mr-2 text-blue-400 hover:text-blue-300 hover:underline transition-colors duration-200"
//                     >
//                       Edit
//                     </button>
//                     <button
//                       onClick={() => onDeleteNote(noteId)}
//                       className="text-red-500 hover:text-red-400 hover:underline transition-colors duration-200"
//                     >
//                       Delete
//                     </button>
//                   </td>
//                 </tr>
//               );
//             })}
//           </tbody>
//         </table>
//       </div>
//     </div>
//   );
// }

// import React, { useState } from "react";

// interface Note {
//   id?: string;
//   _id?: string;
//   title: string;
//   content: string;
//   branch: string;
//   semester: string;
//   subject: string;
//   fileUrl?: string;
//   fileName?: string;
// }

// interface NotesListProps {
//   notes: Note[];
//   loading: boolean;
//   selectedNotes: string[];
//   onDeleteNote: (noteId: string) => Promise<void>;
//   onEditNote: (noteId: string) => Promise<void>;
//   onSelectNote: (noteId: string) => void;
//   onSelectAll: () => void;
// }

// interface Notification {
//   id: number;
//   message: string;
//   type: 'success' | 'error';
// }

// export default function NotesList({
//   notes,
//   loading,
//   selectedNotes,
//   onDeleteNote,
//   onEditNote,
//   onSelectNote,
//   onSelectAll,
// }: NotesListProps) {
//   const [notifications, setNotifications] = useState<Notification[]>([]);

//   const showNotification = (message: string, type: 'success' | 'error' = 'success') => {
//     const id = Date.now();
//     const notification = { id, message, type };
    
//     setNotifications(prev => [...prev, notification]);
    
//     // Auto remove notification after 3 seconds
//     setTimeout(() => {
//       setNotifications(prev => prev.filter(n => n.id !== id));
//     }, 3000);
//   };

//   const copyToClipboard = async (text: string, fileName?: string) => {
//     try {
//       await navigator.clipboard.writeText(text);
//       showNotification(
//         `${fileName ? `"${fileName}"` : 'File URL'} copied to clipboard!`,
//         'success'
//       );
//     } catch (err) {
//       showNotification('Failed to copy to clipboard', 'error');
//     }
//   };

//   const handleFileClick = (e: React.MouseEvent, fileUrl: string, fileName?: string) => {
//     e.preventDefault();
//     copyToClipboard(fileUrl, fileName);
//   };

//   const removeNotification = (id: number) => {
//     setNotifications(prev => prev.filter(n => n.id !== id));
//   };

//   if (loading) return <div>Loading notes...</div>;

//   if (notes.length === 0) return <div>No notes found.</div>;

//   const allSelected = selectedNotes.length === notes.length && notes.length > 0;

//   return (
//     <div className="relative">
//       {/* Notification Container */}
//       <div className="fixed top-4 right-4 z-50 space-y-2">
//         {notifications.map((notification) => (
//           <div
//             key={notification.id}
//             className={`
//               px-4 py-3 rounded-lg shadow-lg border border-opacity-20 
//               backdrop-blur-sm transition-all duration-300 ease-in-out
//               max-w-sm min-w-[250px] cursor-pointer
//               ${notification.type === 'success' 
//                 ? 'bg-green-900/90 border-green-500 text-green-100' 
//                 : 'bg-red-900/90 border-red-500 text-red-100'
//               }
//             `}
//             onClick={() => removeNotification(notification.id)}
//           >
//             <div className="flex items-center justify-between">
//               <div className="flex items-center space-x-2">
//                 {notification.type === 'success' ? (
//                   <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
//                     <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
//                   </svg>
//                 ) : (
//                   <svg className="w-5 h-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
//                     <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
//                   </svg>
//                 )}
//                 <span className="text-sm font-medium">{notification.message}</span>
//               </div>
//               <button
//                 onClick={(e) => {
//                   e.stopPropagation();
//                   removeNotification(notification.id);
//                 }}
//                 className="ml-2 text-gray-300 hover:text-white"
//               >
//                 <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
//                   <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
//                 </svg>
//               </button>
//             </div>
//           </div>
//         ))}
//       </div>

//       {/* Notes Table */}
//       <div className="overflow-x-auto">
//         <table className="w-full border-collapse min-w-[900px]">
//           <thead>
//             <tr className="bg-black border-b border-gray-700">
//               <th className="p-3 text-left text-white">
//                 <input
//                   type="checkbox"
//                   checked={allSelected}
//                   onChange={onSelectAll}
//                   aria-label="Select all notes"
//                   className="cursor-pointer"
//                 />
//               </th>
//               <th className="p-3 text-left text-white">Title</th>
//               <th className="p-3 text-left text-white">Content</th>
//               <th className="p-3 text-left text-white">Branch</th>
//               <th className="p-3 text-left text-white">Semester</th>
//               <th className="p-3 text-left text-white">Subject</th>
//               <th className="p-3 text-left text-white">File</th>
//               <th className="p-3 text-left text-white">Actions</th>
//             </tr>
//           </thead>
//           <tbody>
//             {notes.map((note) => {
//               const noteId = note.id || note._id || "";
//               const isSelected = selectedNotes.includes(noteId);

//               return (
//                 <tr key={noteId} className="bg-gray-800 border-b border-gray-800 hover:bg-gray-700">
//                   <td className="p-3">
//                     <input
//                       type="checkbox"
//                       checked={isSelected}
//                       onChange={() => onSelectNote(noteId)}
//                       aria-label={`Select note ${note.title}`}
//                       className="cursor-pointer"
//                     />
//                   </td>

//                   <td className="p-3 max-w-xs truncate text-white" title={note.title}>
//                     {note.title}
//                   </td>

//                   <td className="p-3 max-w-xs truncate text-gray-300">
//                     {note.content}
//                   </td>

//                   <td className="p-3 text-gray-300">{note.branch}</td>
//                   <td className="p-3 text-gray-300">{note.semester}</td>
//                   <td className="p-3 text-gray-300">{note.subject}</td>

//                   <td className="p-3 max-w-xs truncate">
//                     {note.fileUrl ? (
//                       <button
//                         onClick={(e) => handleFileClick(e, note.fileUrl!, note.fileName)}
//                         className="text-blue-400 hover:text-blue-300 hover:underline transition-colors duration-200 flex items-center space-x-1"
//                         title={`Click to copy: ${note.fileName || note.fileUrl}`}
//                       >
//                         <span>{note.fileName || "View File"}</span>
//                         <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
//                           <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z"/>
//                           <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z"/>
//                         </svg>
//                       </button>
//                     ) : (
//                       <span className="text-gray-500 italic">No file</span>
//                     )}
//                   </td>

//                   <td className="p-3 whitespace-nowrap">
//                     <button
//                       onClick={() => onEditNote(noteId)}
//                       className="mr-2 text-blue-400 hover:text-blue-300 hover:underline transition-colors duration-200"
//                     >
//                       Edit
//                     </button>
//                     <button
//                       onClick={() => onDeleteNote(noteId)}
//                       className="text-red-500 hover:text-red-400 hover:underline transition-colors duration-200"
//                     >
//                       Delete
//                     </button>
//                   </td>
//                 </tr>
//               );
//             })}
//           </tbody>
//         </table>
//       </div>
//     </div>
//   );
// }
// import React from "react";

// interface Note {
//   id?: string;
//   _id?: string;
//   title: string;
//   content: string;
//   branch: string;
//   semester: string;
//   subject: string;
//   fileUrl?: string;
//   fileName?: string;
// }

// interface NotesListProps {
//   notes: Note[];
//   loading: boolean;
//   selectedNotes: string[];
//   onDeleteNote: (noteId: string) => Promise<void>;
//   onEditNote: (noteId: string) => Promise<void>;
//   onSelectNote: (noteId: string) => void;
//   onSelectAll: () => void;
// }

// export default function NotesList({
//   notes,
//   loading,
//   selectedNotes,
//   onDeleteNote,
//   onEditNote,
//   onSelectNote,
//   onSelectAll,
// }: NotesListProps) {
//   if (loading) return <div>Loading notes...</div>;

//   if (notes.length === 0) return <div>No notes found.</div>;

//   const allSelected = selectedNotes.length === notes.length && notes.length > 0;

//   return (
//     <div className="overflow-x-auto">
//       <table className="w-full border-collapse min-w-[900px]">
//         <thead>
//           <tr className="bg-black border-b border-gray-700">
//             <th className="p-3 text-left text-white">
//               <input
//                 type="checkbox"
//                 checked={allSelected}
//                 onChange={onSelectAll}
//                 aria-label="Select all notes"
//                 className="cursor-pointer"
//               />
//             </th>
//             <th className="p-3 text-left text-white ">Title</th>
//             <th className="p-3 text-left text-white">Content</th>
//             <th className="p-3 text-left text-white">Branch</th>
//             <th className="p-3 text-left text-white">Semester</th>
//             <th className="p-3 text-left text-white">Subject</th>
//             <th className="p-3 text-left text-white">File</th>
//             <th className="p-3 text-left text-white">Actions</th>
//           </tr>
//         </thead>
//         <tbody>
//           {notes.map((note) => {
//             const noteId = note.id || note._id || "";
//             const isSelected = selectedNotes.includes(noteId);

//             return (
//               <tr key={noteId} className="bg-gray-800 border-b border-gray-800 hover:bg-gray-800">
//                 <td className="p-3">
//                   <input
//                     type="checkbox"
//                     checked={isSelected}
//                     onChange={() => onSelectNote(noteId)}
//                     aria-label={`Select note ${note.title}`}
//                     className="cursor-pointer"
//                   />
//                 </td>

//                 <td className="p-3 max-w-xs truncate" title={note.title}>
//                   {note.title}
//                 </td>

//                 <td className="p-3 max-w-xs truncate">
//                   {note.content}
//                 </td>

//                 <td className="p-3">{note.branch}</td>
//                 <td className="p-3">{note.semester}</td>
//                 <td className="p-3">{note.subject}</td>

//                 <td className="p-3 max-w-xs truncate">
//                   {note.fileUrl ? (
//                     <a
//                       href={note.fileUrl}
//                       target="_blank"
//                       rel="noopener noreferrer"
//                       className="text-blue-400 hover:underline"
//                       title={note.fileName || note.fileUrl}
//                     >
//                       {note.fileName || "View File"}
//                     </a>
//                   ) : (
//                     <span className="text-gray-500 italic">No file</span>
//                   )}
//                 </td>

//                 <td className="p-3 whitespace-nowrap">
//                   <button
//                     onClick={() => onEditNote(noteId)}
//                     className="mr-2 text-blue-400 hover:underline"
//                   >
//                     Edit
//                   </button>
//                   <button
//                     onClick={() => onDeleteNote(noteId)}
//                     className="text-red-500 hover:underline"
//                   >
//                     Delete
//                   </button>
//                 </td>
//               </tr>
//             );
//           })}
//         </tbody>
//       </table>
//     </div>
//   );
// }
