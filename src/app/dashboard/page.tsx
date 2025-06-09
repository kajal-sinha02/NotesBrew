"use client";
import Header from "../components/Header";
import SearchAndFilters from "../components/SearchAndFilters";
import ResultsSummary from "../components/ResultsSummary";
import NotesList from "../components/NotesList";
import Pagination from "../components/Pagination";
import CreateNoteModal from "../components/CreateNoteModal";
import GroupChat from "../components/GroupChat";
import DMChat from "../components/DMchat";

import {
  createNote,
  fetchNotes,
  deleteNote,
  updateNote,
  getNoteById,
  bulkDeleteNotes,
  fetchMyNotes,
  fetchOrgNotes,
} from "../services/noteService";
import { useState, useEffect } from "react";

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
  author?: string;
  authorName?: string;
  organization?: string;
  createdAt?: string;
}

interface Filters {
  branch: string;
  semester: string;
  subject: string;
  search: string;
}

interface NoteFormData {
  title: string;
  content: string;
  branch: string;
  semester: string;
  subject: string;
  file: File | null;
}

interface PaginationData {
  page: number;
  totalPages: number;
  total: number;
}

interface DecodedToken {
  userId: string;
  email: string;
  role: string;
  name?: string;
  organization?: string;
  exp: number;
}

interface OrganizationFormData {
  name: string;
  description: string;
  location: string;
  contactEmail: string;
}

const defaultUser = {
  id: "",
  name: "",
  email: "",
  role: "",
  organization: "",
  organizationName : "",
};

interface GroupChatProps {
  user: {
    name: string;
    email: string;
    role: string;
    organization: string;
    organizationName : string;

  };
}

interface Props {
  currentUser: { uid: string; name: string };
}

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  organization: string;
  organizationName: string;
}

type Tab = "all" | "search" | "create" | "summary" | "profile" | "add-organization" | "my-notes" | "org-notes"|"group-chat" | "dm-chat";
const tabs: Tab[] = [/*...*/];

export default function NotesDashboard() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [myNotes, setMyNotes] = useState<Note[]>([]);
  const [orgNotes, setOrgNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedNotes, setSelectedNotes] = useState<string[]>([]);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [user, setUser] = useState(defaultUser);

  const [filters, setFilters] = useState<Filters>({ branch: "", semester: "", subject: "", search: "" });
  const [myNotesFilters, setMyNotesFilters] = useState<Filters>({ branch: "", semester: "", subject: "", search: "" });
  const [orgNotesFilters, setOrgNotesFilters] = useState<Filters>({ branch: "", semester: "", subject: "", search: "" });
  
  const [pagination, setPagination] = useState<PaginationData>({ page: 1, totalPages: 1, total: 0 });
  const [myNotesPagination, setMyNotesPagination] = useState<PaginationData>({ page: 1, totalPages: 1, total: 0 });
  const [orgNotesPagination, setOrgNotesPagination] = useState<PaginationData>({ page: 1, totalPages: 1, total: 0 });

  const [formData, setFormData] = useState<NoteFormData>({ title: "", content: "", branch: "", semester: "", subject: "", file: null });
  const [orgFormData, setOrgFormData] = useState<OrganizationFormData>({ name: "", description: "", location: "", contactEmail: "" });

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>("all");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  // Get user info from localStorage on component mount
  useEffect(() => {
    const userInfo = localStorage.getItem("user");
    if (userInfo) {
      const parsedUser = JSON.parse(userInfo);
      setUser(parsedUser);   
      // Set initial tab based on user role
      if (parsedUser.role === "admin") {
        setActiveTab("profile");
      } else {
        setActiveTab("all");
      }
    }
  }, []);

  useEffect(() => {
    if (activeTab === "all" && user.role === "student") fetchNotesList();
  }, [filters, pagination.page, activeTab, user.role]);

  useEffect(() => {
    if (activeTab === "my-notes" && user.role === "student") fetchMyNotesList();
  }, [myNotesFilters, myNotesPagination.page, activeTab, user.role]);

  useEffect(() => {
    if (activeTab === "org-notes" && user.role === "student") fetchOrgNotesList();
  }, [orgNotesFilters, orgNotesPagination.page, activeTab, user.role]);

  async function fetchNotesList() {
    setLoading(true);
    setError("");
    try {
      const res = await fetchNotes(filters, pagination.page, 10);
      if (res.success) {
        setNotes(res.notes || []);
        setPagination(p => ({ ...p, totalPages: res.totalPages || 1, total: res.total || 0 }));
      } else throw new Error(res.error || "Failed to fetch notes");
    } catch (e: any) {
      setError(e.message);
      setNotes([]);
    } finally {
      setLoading(false);
    }
  }

  async function fetchMyNotesList() {
    setLoading(true);
    setError("");
    try {
      const res = await fetchMyNotes(myNotesFilters, myNotesPagination.page, 10);
      if (res.success) {
        setMyNotes(res.notes || []);
        setMyNotesPagination(p => ({ ...p, totalPages: res.totalPages || 1, total: res.total || 0 }));
      } else throw new Error(res.error || "Failed to fetch my notes");
    } catch (e: any) {
      setError(e.message);
      setMyNotes([]);
    } finally {
      setLoading(false);
    }
  }

  async function fetchOrgNotesList() {
    setLoading(true);
    setError("");
    try {
      const res = await fetchOrgNotes(orgNotesPagination.page, 10);
      if (res.success) {
        setOrgNotes(res.notes || []);
        setOrgNotesPagination(p => ({ ...p, totalPages: res.totalPages || 1, total: res.total || 0 }));
      } else throw new Error(res.error || "Failed to fetch organization notes");
    } catch (e: any) {
      setError(e.message);
      setOrgNotes([]);
    } finally {
      setLoading(false);
    }
  }

  const handleBulkDelete = async () => {
    if (!selectedNotes.length) return;
    if (!confirm(`Delete ${selectedNotes.length} notes?`)) return;
    setLoading(true);
    try {
      const res = await bulkDeleteNotes(selectedNotes);
      if (res.success) {
        setSelectedNotes([]);
        // Refresh the appropriate notes list based on active tab
        if (activeTab === "all") fetchNotesList();
        else if (activeTab === "my-notes") fetchMyNotesList();
        else if (activeTab === "org-notes") fetchOrgNotesList();
      } else throw new Error(res.error || "Failed to delete notes");
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateOrganization = async () => {
    setLoading(true);
    setError("");
    try {
      // API call to create organization
      const response = await fetch("/api/organizations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify(orgFormData)
      });
      
      const result = await response.json();
      
      if (result.success) {
        setOrgFormData({ name: "", description: "", location: "", contactEmail: "" });
        alert("Organization created successfully!");
      } else {
        throw new Error(result.error || "Failed to create organization");
      }
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  // Handle edit note function
  const handleEditNote = async (id: string) => {
    setLoading(true);
    setError("");
    try {
      const res = await getNoteById(id);
      if (res.success && res.data) {
        const noteData = res.data;
        setEditingNote(noteData);
        setFormData({
          title: noteData.title,
          content: noteData.content,
          branch: noteData.branch,
          semester: noteData.semester,
          subject: noteData.subject,
          file: null
        });
        setShowCreateForm(true);
        setActiveTab("create");
      } else {
        throw new Error(res.error || "Failed to fetch note data");
      }
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  // Handle form submission (create or update)
  const handleFormSubmit = async () => {
    setLoading(true);
    setError("");
    try {
      let res;
      if (editingNote) {
        // Update existing note
        const noteId = editingNote.id || editingNote._id;
        if (!noteId) {
          throw new Error("Note ID is missing");
        }
        res = await updateNote(noteId, formData);
      } else {
        // Create new note
        res = await createNote(formData);
      }

      if (res.success) {
        // Reset form and close modal
        setShowCreateForm(false);
        setEditingNote(null);
        setFormData({
          title: "",
          content: "",
          branch: "",
          semester: "",
          subject: "",
          file: null
        });
        setActiveTab("all");
        fetchNotesList();
        fetchMyNotesList(); // Refresh my notes as well
      } else {
        throw new Error(res.error || "Failed to save note");
      }
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  // Handle closing the modal
  const handleCloseModal = () => {
    setShowCreateForm(false);
    setEditingNote(null);
    setFormData({
      title: "",
      content: "",
      branch: "",
      semester: "",
      subject: "",
      file: null
    });
    setError("");
    setActiveTab("all");
  };

  const onFormDataChange = (key: keyof NoteFormData, value: string | File | null) => {
    setFormData(f => ({ ...f, [key]: value }));
  };

  const onOrgFormDataChange = (key: keyof OrganizationFormData, value: string) => {
    setOrgFormData(f => ({ ...f, [key]: value }));
  };

  const getAvailableTabs = () => {
    if (user.role === "admin") {
      return ["profile", "add-organization"];
    } else {
      return ["all", "my-notes", "org-notes", "create", "group-chat", "dm-chat"];
    }
  };

  const getCurrentNotes = () => {
    switch (activeTab) {
      case "all": return notes;
      case "my-notes": return myNotes;
      case "org-notes": return orgNotes;
      default: return [];
    }
  };

  const getCurrentFilters = () => {
    switch (activeTab) {
      case "my-notes": return myNotesFilters;
      case "org-notes": return orgNotesFilters;
      default: return filters;
    }
  };

  const getCurrentPagination = () => {
    switch (activeTab) {
      case "my-notes": return myNotesPagination;
      case "org-notes": return orgNotesPagination;
      default: return pagination;
    }
  };

  const handleFilterChange = (key: string, value: string) => {
    switch (activeTab) {
      case "my-notes":
        setMyNotesFilters(f => ({ ...f, [key]: value }));
        setMyNotesPagination(p => ({ ...p, page: 1 }));
        break;
      case "org-notes":
        setOrgNotesFilters(f => ({ ...f, [key]: value }));
        setOrgNotesPagination(p => ({ ...p, page: 1 }));
        break;
      default:
        setFilters(f => ({ ...f, [key]: value }));
        setPagination(p => ({ ...p, page: 1 }));
        break;
    }
  };

  const handleClearFilters = () => {
    const emptyFilters = { branch: "", semester: "", subject: "", search: "" };
    switch (activeTab) {
      case "my-notes":
        setMyNotesFilters(emptyFilters);
        break;
      case "org-notes":
        setOrgNotesFilters(emptyFilters);
        break;
      default:
        setFilters(emptyFilters);
        break;
    }
  };

  const handlePageChange = (page: number) => {
    switch (activeTab) {
      case "my-notes":
        setMyNotesPagination(p => ({ ...p, page }));
        break;
      case "org-notes":
        setOrgNotesPagination(p => ({ ...p, page }));
        break;
      default:
        setPagination(p => ({ ...p, page }));
        break;
    }
  };

  const handleDeleteNote = async (id: string) => {
    if(!confirm("Delete this note?")) return;
    
    setLoading(true);
    try {
      const res = await deleteNote(id);
      if(res.success) {
        // Refresh the appropriate notes list based on active tab
        if (activeTab === "all") fetchNotesList();
        else if (activeTab === "my-notes") fetchMyNotesList();
        else if (activeTab === "org-notes") fetchOrgNotesList();
      } else {
        setError(res.error || "Failed to delete note");
      }
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const renderNotesTab = (tabType: "all" | "my-notes" | "org-notes") => {
    if (user.role !== "student") return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          {/* <div className="text-red-400 text-lg font-mono">ACCESS DENIED</div>
          <div className="text-gray-500 text-sm mt-2 font-mono">Insufficient privileges</div> */}
        </div>
      </div>
    );
    
    const currentNotes = getCurrentNotes();
    const currentFilters = getCurrentFilters();
    const currentPagination = getCurrentPagination();
    
    const getTabTitle = () => {
      switch (tabType) {
        case "my-notes": return "MY_NOTES";
        case "org-notes": return "ORG_NOTES";
        default: return "ALL_NOTES";
      }
    };

    const getTabDescription = () => {
      switch (tabType) {
        case "my-notes": return "User-created documentation";
        case "org-notes": return "Organization-wide resources";
        default: return "Complete notes database";
      }
    };

    return (
      <>
        <div className="mb-8 border-b border-gray-800 pb-6">
          <h1 className="text-4xl font-bold text-white font-mono tracking-wider">{getTabTitle()}</h1>
          <p className="text-green-400 mt-2 font-mono text-sm">&gt; {getTabDescription()}</p>
        </div>
        
        <Header 
          onCreateNote={() => {
            setEditingNote(null);
            setFormData({
              title: "",
              content: "",
              branch: "",
              semester: "",
              subject: "",
              file: null
            });
            setActiveTab("create");
            setShowCreateForm(true);
          }} 
          selectedCount={selectedNotes.length} 
          onBulkDelete={handleBulkDelete} 
        />
        <SearchAndFilters
          filters={currentFilters}
          onFilterChange={handleFilterChange}
          onClearFilters={handleClearFilters}
        />
        {error && (
          <div className="my-4 p-4 bg-red-900/20 border border-red-500/30 rounded-lg">
            <div className="text-red-400 font-mono text-sm">ERROR: {error}</div>
          </div>
        )}
        <ResultsSummary loading={loading} notesCount={currentNotes.length} totalCount={currentPagination.total} />
        <NotesList
          notes={currentNotes}
          loading={loading}
          selectedNotes={selectedNotes}
          onSelectAll={() => setSelectedNotes(s => s.length === currentNotes.length ? [] : currentNotes.map(n => n.id||n._id||""))}
          onSelectNote={id => setSelectedNotes(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id])}
          onEditNote={handleEditNote}
          onDeleteNote={handleDeleteNote}
        />
        <Pagination pagination={currentPagination} onPageChange={handlePageChange} />
      </>
    );
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "all":
        return renderNotesTab("all");

      case "my-notes":
        return renderNotesTab("my-notes");

      case "org-notes":
        return renderNotesTab("org-notes");

      case "create":
        if (user.role !== "student") return (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="text-red-400 text-lg font-mono">ACCESS DENIED</div>
              <div className="text-gray-500 text-sm mt-2 font-mono">Insufficient privileges</div>
            </div>
          </div>
        );
        
        return (
          <CreateNoteModal
            show={showCreateForm}
            formData={formData}
            isEditing={!!editingNote}
            onClose={handleCloseModal}
            onFormDataChange={onFormDataChange}
            onSubmit={handleFormSubmit}
            error={error}
          />
        );

      case "summary":
        if (user.role !== "student") return (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="text-red-400 text-lg font-mono">ACCESS DENIED</div>
              <div className="text-gray-500 text-sm mt-2 font-mono">Insufficient privileges</div>
            </div>
          </div>
        );
        
        return <ResultsSummary loading={loading} notesCount={notes.length} totalCount={pagination.total} />;

      case "group-chat":
        return <GroupChat user={user} />;
        
      case "dm-chat":
        return <DMChat currentUser={{ uid: user.id, name: user.name }} />;

      case "profile":
        return (
          <div className="space-y-8">
            <div className="border-b border-gray-800 pb-6">
              <h2 className="text-3xl font-bold text-white font-mono tracking-wider">ADMIN_PROFILE</h2>
              <p className="text-green-400 mt-2 font-mono text-sm">&gt; System administrator dashboard</p>
            </div>
            
            <div className="bg-black border border-gray-800 rounded-lg p-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <span className="font-mono text-green-400 text-sm">NAME:</span>
                    <span className="text-white font-mono">{user.name}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="font-mono text-green-400 text-sm">EMAIL:</span>
                    <span className="text-white font-mono">{user.email}</span>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <span className="font-mono text-green-400 text-sm">ROLE:</span>
                    <span className="text-cyan-400 font-mono font-bold">{user.role.toUpperCase()}</span>
                  </div>
                  {user.organization && (
                    <div className="flex items-center space-x-3">
                      <span className="font-mono text-green-400 text-sm">ORG:</span>
                      <span className="text-white font-mono">{user.organization}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <div className="bg-black border border-gray-800 rounded-lg p-8">
              <h3 className="text-xl font-bold text-white mb-6 font-mono">ADMIN_ACTIONS</h3>
              <div className="space-y-4">
                <button 
                  onClick={() => setActiveTab("add-organization")}
                  className="bg-green-600 hover:bg-green-500 border border-green-500 px-6 py-3 rounded-lg text-black font-mono font-bold transition-all duration-200 hover:shadow-lg hover:shadow-green-500/20"
                >
                  [+] ADD_ORGANIZATION
                </button>
              </div>
            </div>
          </div>
        );

      case "add-organization":
        if (user.role !== "admin") return (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="text-red-400 text-lg font-mono">ACCESS DENIED</div>
              <div className="text-gray-500 text-sm mt-2 font-mono">Insufficient privileges</div>
            </div>
          </div>
        );
        
        return (
          <div className="space-y-8">
            <div className="border-b border-gray-800 pb-6">
              <h2 className="text-3xl font-bold text-white font-mono tracking-wider">CREATE_ORGANIZATION</h2>
              <p className="text-green-400 mt-2 font-mono text-sm">&gt; Initialize new organization entity</p>
            </div>
            
            {error && (
              <div className="p-4 bg-red-900/20 border border-red-500/30 rounded-lg">
                <div className="text-red-400 font-mono text-sm">ERROR: {error}</div>
              </div>
            )}
            
            <div className="bg-black border border-gray-800 rounded-lg p-8">
              <form onSubmit={(e) => { e.preventDefault(); handleCreateOrganization(); }} className="space-y-6">
                <div>
                  <label className="block text-green-400 font-mono text-sm mb-3">ORGANIZATION_NAME</label>
                  <input
                    type="text"
                    value={orgFormData.name}
                    onChange={(e) => onOrgFormDataChange("name", e.target.value)}
                    className="w-full p-4 bg-gray-900 text-white rounded-lg border border-gray-700 focus:border-green-500 focus:outline-none font-mono transition-colors"
                    placeholder="Enter organization identifier"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-green-400 font-mono text-sm mb-3">DESCRIPTION</label>
                  <textarea
                    value={orgFormData.description}
                    onChange={(e) => onOrgFormDataChange("description", e.target.value)}
                    className="w-full p-4 bg-gray-900 text-white rounded-lg border border-gray-700 focus:border-green-500 focus:outline-none font-mono transition-colors"
                    rows={4}
                    placeholder="Enter organization description"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-green-400 font-mono text-sm mb-3">LOCATION</label>
                  <input
                    type="text"
                    value={orgFormData.location}
                    onChange={(e) => onOrgFormDataChange("location", e.target.value)}
                    className="w-full p-4 bg-gray-900 text-white rounded-lg border border-gray-700 focus:border-green-500 focus:outline-none font-mono transition-colors"
                    placeholder="Enter physical location"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-green-400 font-mono text-sm mb-3">CONTACT_EMAIL</label>
                  <input
                    type="email"
                    value={orgFormData.contactEmail}
                    onChange={(e) => onOrgFormDataChange("contactEmail", e.target.value)}
                    className="w-full p-4 bg-gray-900 text-white rounded-lg border border-gray-700 focus:border-green-500 focus:outline-none font-mono transition-colors"
                    placeholder="Enter contact email address"
                    required
                  />
                </div>
                
                <div className="flex gap-4 pt-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className="bg-green-600 hover:bg-green-500 disabled:bg-gray-600 border border-green-500 px-6 py-3 rounded-lg text-black font-mono font-bold transition-all duration-200 hover:shadow-lg hover:shadow-green-500/20"
                  >
                    {loading ? "[PROCESSING...]" : "[CREATE_ORG]"}
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => {
                      setOrgFormData({ name: "", description: "", location: "", contactEmail: "" });
                      setActiveTab("profile");
                    }}
                    className="bg-gray-600 hover:bg-gray-500 border border-gray-500 px-6 py-3 rounded-lg text-white font-mono font-bold transition-all duration-200"
                  >
                    [CANCEL]
                  </button>
                </div>
              </form>
            </div>
          </div>
        );

      default: 
        return (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="text-gray-400 font-mono text-lg">SELECT_TAB</div>
              <div className="text-gray-600 text-sm mt-2 font-mono">Choose a section to begin</div>
            </div>
          </div>
        );
    }
  };

  const getTabLabel = (tab: string) => {
    switch (tab) {
      case "add-organization": return "ADD_ORG";
      case "my-notes": return "MY_NOTES";
      case "org-notes": return "ORG_NOTES";
      case "group-chat": return "GROUP_CHAT";
      case "dm-chat": return "DM_CHAT";
      default: return tab.toUpperCase();
    }
  };

  const getTabIcon = (tab: string) => {
    switch (tab) {
      case "all": return "📄";
      case "my-notes": return "📝";
      case "org-notes": return "🏢";
      case "create": return "➕";
      case "summary": return "📊";
      case "profile": return "👤";
      case "add-organization": return "🏗️";
      case "group-chat": return "💬";
      case "dm-chat": return "📨";
      default: return "•";
    }
  };

  return (
    <div className="flex min-h-screen bg-black text-gray-100 font-mono">
      {/* Sidebar */}
      {/* <aside className="w-80 bg-gray-900 border-r border-gray-800 p-6 space-y-4">
       
        <div className="mb-8 p-6 bg-black border border-gray-800 rounded-lg">
          <div className="text-xs text-green-400 mb-2 font-mono">LOGGED_IN_AS:</div>
          <div className="font-bold text-white text-lg font-mono">{user.name}</div>
          <div className="text-xs text-cyan-400 font-mono mt-1">[{user.role.toUpperCase()}]</div>
          {user.organization && (
            <div className="text-xs text-gray-400 font-mono mt-2">ORG: {user.organization}</div>
          )}
        </div>
        
       
        <div className="space-y-2">
          <div className="text-xs text-green-400 mb-4 font-mono tracking-wider">NAVIGATION</div>
          {getAvailableTabs().map(tab => (
            <button 
              key={tab}
              className={`block w-full text-left px-4 py-3 rounded-lg font-mono transition-all duration-200 ${
                activeTab === tab 
                  ? "bg-green-600 text-black font-bold border border-green-500 shadow-lg shadow-green-500/20" 
                  : "hover:bg-gray-800 text-gray-300 hover:text-white border border-transparent hover:border-gray-700"
              }`}
              onClick={() => {
                setActiveTab(tab as Tab);
                setSelectedNotes([]); 
                if (tab === "create") {
                  setEditingNote(null);
                  setFormData({
                    title: "",
                    content: "",
                    branch: "",
                    semester: "",
                    subject: "",
                    file: null
                  });
                  setShowCreateForm(true);
                }
              }}
            >
              <div className="flex items-center space-x-3">
                <span className="text-lg">{getTabIcon(tab)}</span>
                <span>{getTabLabel(tab)}</span>
              </div>
            </button>
          ))}
        </div>
        
        
        {(activeTab === "all" || activeTab === "my-notes" || activeTab === "org-notes") && selectedNotes.length > 0 && (
          <div className="mt-6 p-4 bg-red-900/20 border border-red-500/30 rounded-lg">
            <div className="text-xs text-red-400 mb-2 font-mono">BULK_ACTIONS</div>
            <button 
              className="w-full bg-red-600 hover:bg-red-500 border border-red-500 px-4 py-3 rounded-lg text-white font-mono font-bold transition-all duration-200 hover:shadow-lg hover:shadow-red-500/20" 
              onClick={handleBulkDelete}
            >
              [DELETE {selectedNotes.length}]
            </button>
          </div>
        )}
        
       
        <div className="mt-8 pt-6 border-t border-gray-800">
          <div className="text-xs text-green-400 mb-4 font-mono tracking-wider">SYSTEM</div>
          <button 
            onClick={() => {
              localStorage.removeItem("token");
              localStorage.removeItem("user");
              window.location.href = "/login";
            }}
            className="w-full bg-red-600 hover:bg-red-500 border border-red-500 px-4 py-3 rounded-lg text-white font-mono font-bold transition-all duration-200 hover:shadow-lg hover:shadow-red-500/20"
          >
            [LOGOUT]
          </button>
        </div>
      </aside> */}
      <button 
        className="lg:hidden fixed top-4 right-4 z-50 bg-gray-900 border border-gray-700 p-3 rounded-lg text-white hover:bg-gray-800 transition-colors"
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        aria-label="Toggle navigation menu"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isMobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
        </svg>
      </button>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-40
        w-80 sm:w-72 lg:w-80
        bg-gray-900 border-r border-gray-800 
        p-4 sm:p-6 space-y-4
        transform transition-transform duration-300 ease-in-out
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        overflow-y-auto
      `}>
        {/* Close button for mobile */}
        <button 
          className="lg:hidden absolute top-4 right-4 text-gray-400 hover:text-white"
          onClick={() => setIsMobileMenuOpen(false)}
          aria-label="Close menu"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* User Info Card */}
        <div className="mb-6 lg:mb-8 p-4 sm:p-6 bg-black border border-gray-800 rounded-lg">
          <div className="text-xs text-green-400 mb-2 font-mono">LOGGED_IN_AS:</div>
          <div className="font-bold text-white text-base sm:text-lg font-mono break-words">{user.name}</div>
          <div className="text-xs text-cyan-400 font-mono mt-1">[{user.role.toUpperCase()}]</div>
          {user.organization && (
            <div className="text-xs text-gray-400 font-mono mt-2 break-words">ORG: {user.organizationName}</div>
          )}
        </div>

        {/* Navigation Tabs */}
        <div className="space-y-2">
          <div className="text-xs text-green-400 mb-4 font-mono tracking-wider">NAVIGATION</div>
          {getAvailableTabs().map(tab => (
            <button 
              key={tab}
              className={`block w-full text-left px-3 sm:px-4 py-2 sm:py-3 rounded-lg font-mono transition-all duration-200 ${
                activeTab === tab
                  ? "bg-green-600 text-black font-bold border border-green-500 shadow-lg shadow-green-500/20"
                  : "hover:bg-gray-800 text-gray-300 hover:text-white border border-transparent hover:border-gray-700"
              }`}
              onClick={() => {
                setActiveTab(tab as Tab);
                setSelectedNotes([]); // Clear selected notes when switching tabs
                if (tab === "create") {
                  setEditingNote(null);
                  setFormData({
                    title: "",
                    content: "",
                    branch: "",
                    semester: "",
                    subject: "",
                    file: null
                  });
                  setShowCreateForm(true);
                }
                // Close mobile menu after selection
                setIsMobileMenuOpen(false);
              }}
            >
              <div className="flex items-center space-x-2 sm:space-x-3">
                <span className="text-base sm:text-lg flex-shrink-0">{getTabIcon(tab)}</span>
                <span className="text-sm sm:text-base truncate">{getTabLabel(tab)}</span>
              </div>
            </button>
          ))}
        </div>

        {/* Bulk Actions */}
        {(activeTab === "all" || activeTab === "my-notes" || activeTab === "org-notes") && selectedNotes.length > 0 && (
          <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-red-900/20 border border-red-500/30 rounded-lg">
            <div className="text-xs text-red-400 mb-2 font-mono">BULK_ACTIONS</div>
            <button 
              className="w-full bg-red-600 hover:bg-red-500 border border-red-500 px-3 sm:px-4 py-2 sm:py-3 rounded-lg text-white font-mono font-bold transition-all duration-200 hover:shadow-lg hover:shadow-red-500/20 text-sm sm:text-base"
              onClick={() => {
                handleBulkDelete();
                setIsMobileMenuOpen(false);
              }}
            >
              [DELETE {selectedNotes.length}]
            </button>
          </div>
        )}

        {/* System Actions */}
        <div className="mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-gray-800">
          <div className="text-xs text-green-400 mb-4 font-mono tracking-wider">SYSTEM</div>
          <button 
            onClick={() => {
              localStorage.removeItem("token");
              localStorage.removeItem("user");
              window.location.href = "/login";
            }}
            className="w-full bg-red-600 hover:bg-red-500 border border-red-500 px-3 sm:px-4 py-2 sm:py-3 rounded-lg text-white font-mono font-bold transition-all duration-200 hover:shadow-lg hover:shadow-red-500/20 text-sm sm:text-base"
          >
            [LOGOUT]
          </button>
        </div>
      </aside>
      
      {/* Main Content */}
      <main className="flex-1 p-8 overflow-y-auto bg-black">
        <div className="max-w-7xl mx-auto">
          {renderTabContent()}
        </div>
      </main>
    </div>
  );
}
// "use client";
// import Header from "../components/Header";
// import SearchAndFilters from "../components/SearchAndFilters";
// import ResultsSummary from "../components/ResultsSummary";
// import NotesList from "../components/NotesList";
// import Pagination from "../components/Pagination";
// import CreateNoteModal from "../components/CreateNoteModal";
// import GroupChat from "../components/GroupChat";
// import DMChat from "../components/DMchat";

// import {
//   createNote,
//   fetchNotes,
//   deleteNote,
//   updateNote,
//   getNoteById,
//   bulkDeleteNotes,
//   fetchMyNotes,
//   fetchOrgNotes,
// } from "../services/noteService";
// import { useState, useEffect } from "react";

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
//   author?: string;
//   authorName?: string;
//   organization?: string;
//   createdAt?: string;
// }

// interface Filters {
//   branch: string;
//   semester: string;
//   subject: string;
//   search: string;
// }

// interface NoteFormData {
//   title: string;
//   content: string;
//   branch: string;
//   semester: string;
//   subject: string;
//   file: File | null;
// }

// interface PaginationData {
//   page: number;
//   totalPages: number;
//   total: number;
// }

// interface DecodedToken {
//   userId: string;
//   email: string;
//   role: string;
//   name?: string;
//   organization?: string;
//   exp: number;
// }

// interface OrganizationFormData {
//   name: string;
//   description: string;
//   location: string;
//   contactEmail: string;
// }

// const defaultUser = {
//   id: "",
//   name: "",
//   email: "",
//   role: "",
//   organization: ""
// };

// interface GroupChatProps {
//   user: {
//     name: string;
//     email: string;
//     role: string;
//     organization: string;
//   };
// }

// interface Props {
//   currentUser: { uid: string; name: string };
// }

// interface User {
//   id: string;
//   name: string;
//   email: string;
//   role: string;
//   organization: string;
// }


// type Tab = "all" | "search" | "create" | "summary" | "profile" | "add-organization" | "my-notes" | "org-notes"|"group-chat" | "dm-chat";

// export default function NotesDashboard() {
//   const [notes, setNotes] = useState<Note[]>([]);
//   const [myNotes, setMyNotes] = useState<Note[]>([]);
//   const [orgNotes, setOrgNotes] = useState<Note[]>([]);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState("");
//   const [selectedNotes, setSelectedNotes] = useState<string[]>([]);
//   const [editingNote, setEditingNote] = useState<Note | null>(null);
//   const [user, setUser] = useState(defaultUser);

//   const [filters, setFilters] = useState<Filters>({ branch: "", semester: "", subject: "", search: "" });
//   const [myNotesFilters, setMyNotesFilters] = useState<Filters>({ branch: "", semester: "", subject: "", search: "" });
//   const [orgNotesFilters, setOrgNotesFilters] = useState<Filters>({ branch: "", semester: "", subject: "", search: "" });
  
//   const [pagination, setPagination] = useState<PaginationData>({ page: 1, totalPages: 1, total: 0 });
//   const [myNotesPagination, setMyNotesPagination] = useState<PaginationData>({ page: 1, totalPages: 1, total: 0 });
//   const [orgNotesPagination, setOrgNotesPagination] = useState<PaginationData>({ page: 1, totalPages: 1, total: 0 });

//   const [formData, setFormData] = useState<NoteFormData>({ title: "", content: "", branch: "", semester: "", subject: "", file: null });
//   const [orgFormData, setOrgFormData] = useState<OrganizationFormData>({ name: "", description: "", location: "", contactEmail: "" });

//   const [showCreateForm, setShowCreateForm] = useState(false);
//   const [activeTab, setActiveTab] = useState<Tab>("all");

//   // Get user info from localStorage on component mount



//   useEffect(() => {
//     const userInfo = localStorage.getItem("user");
//     if (userInfo) {
//       const parsedUser = JSON.parse(userInfo);
//       setUser(parsedUser);
//       console.log(parsedUser.id);
      
//       // Set initial tab based on user role
//       if (parsedUser.role === "admin") {
//         setActiveTab("profile");
//       } else {
//         setActiveTab("all");
//       }
//     }
//   }, []);

//   useEffect(() => {
//     if (activeTab === "all" && user.role === "student") fetchNotesList();
//   }, [filters, pagination.page, activeTab, user.role]);

//   useEffect(() => {
//     if (activeTab === "my-notes" && user.role === "student") fetchMyNotesList();
//   }, [myNotesFilters, myNotesPagination.page, activeTab, user.role]);

//   useEffect(() => {
//     if (activeTab === "org-notes" && user.role === "student") fetchOrgNotesList();
//   }, [orgNotesFilters, orgNotesPagination.page, activeTab, user.role]);

//   async function fetchNotesList() {
//     setLoading(true);
//     setError("");
//     try {
//       const res = await fetchNotes(filters, pagination.page, 10);
//       if (res.success) {
//         setNotes(res.notes || []);
//         setPagination(p => ({ ...p, totalPages: res.totalPages || 1, total: res.total || 0 }));
//       } else throw new Error(res.error || "Failed to fetch notes");
//     } catch (e: any) {
//       setError(e.message);
//       setNotes([]);
//     } finally {
//       setLoading(false);
//     }
//   }

//   async function fetchMyNotesList() {
//     setLoading(true);
//     setError("");
//     try {
//       const res = await fetchMyNotes(myNotesFilters, myNotesPagination.page, 10);
//       if (res.success) {
//         setMyNotes(res.notes || []);
//         setMyNotesPagination(p => ({ ...p, totalPages: res.totalPages || 1, total: res.total || 0 }));
//       } else throw new Error(res.error || "Failed to fetch my notes");
//     } catch (e: any) {
//       setError(e.message);
//       setMyNotes([]);
//     } finally {
//       setLoading(false);
//     }
//   }

//   async function fetchOrgNotesList() {
//     setLoading(true);
//     setError("");
//     try {
//       const res = await fetchOrgNotes(orgNotesFilters, orgNotesPagination.page, 10);
//       if (res.success) {
//         setOrgNotes(res.notes || []);
//         setOrgNotesPagination(p => ({ ...p, totalPages: res.totalPages || 1, total: res.total || 0 }));
//       } else throw new Error(res.error || "Failed to fetch organization notes");
//     } catch (e: any) {
//       setError(e.message);
//       setOrgNotes([]);
//     } finally {
//       setLoading(false);
//     }
//   }

//   const handleBulkDelete = async () => {
//     if (!selectedNotes.length) return;
//     if (!confirm(`Delete ${selectedNotes.length} notes?`)) return;
//     setLoading(true);
//     try {
//       const res = await bulkDeleteNotes(selectedNotes);
//       if (res.success) {
//         setSelectedNotes([]);
//         // Refresh the appropriate notes list based on active tab
//         if (activeTab === "all") fetchNotesList();
//         else if (activeTab === "my-notes") fetchMyNotesList();
//         else if (activeTab === "org-notes") fetchOrgNotesList();
//       } else throw new Error(res.error || "Failed to delete notes");
//     } catch (e: any) {
//       setError(e.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleCreateOrganization = async () => {
//     setLoading(true);
//     setError("");
//     try {
//       // API call to create organization
//       const response = await fetch("/api/organizations", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//           "Authorization": `Bearer ${localStorage.getItem("token")}`
//         },
//         body: JSON.stringify(orgFormData)
//       });
      
//       const result = await response.json();
      
//       if (result.success) {
//         setOrgFormData({ name: "", description: "", location: "", contactEmail: "" });
//         alert("Organization created successfully!");
//       } else {
//         throw new Error(result.error || "Failed to create organization");
//       }
//     } catch (e: any) {
//       setError(e.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Handle edit note function
//   const handleEditNote = async (id: string) => {
//     setLoading(true);
//     setError("");
//     try {
//       const res = await getNoteById(id);
//       if (res.success && res.data) {
//         const noteData = res.data;
//         setEditingNote(noteData);
//         setFormData({
//           title: noteData.title,
//           content: noteData.content,
//           branch: noteData.branch,
//           semester: noteData.semester,
//           subject: noteData.subject,
//           file: null
//         });
//         setShowCreateForm(true);
//         setActiveTab("create");
//       } else {
//         throw new Error(res.error || "Failed to fetch note data");
//       }
//     } catch (e: any) {
//       setError(e.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Handle form submission (create or update)
//   const handleFormSubmit = async () => {
//     setLoading(true);
//     setError("");
//     try {
//       let res;
//       if (editingNote) {
//         // Update existing note
//         const noteId = editingNote.id || editingNote._id;
//         if (!noteId) {
//           throw new Error("Note ID is missing");
//         }
//         res = await updateNote(noteId, formData);
//       } else {
//         // Create new note
//         res = await createNote(formData);
//       }

//       if (res.success) {
//         // Reset form and close modal
//         setShowCreateForm(false);
//         setEditingNote(null);
//         setFormData({
//           title: "",
//           content: "",
//           branch: "",
//           semester: "",
//           subject: "",
//           file: null
//         });
//         setActiveTab("all");
//         fetchNotesList();
//         fetchMyNotesList(); // Refresh my notes as well
//       } else {
//         throw new Error(res.error || "Failed to save note");
//       }
//     } catch (e: any) {
//       setError(e.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Handle closing the modal
//   const handleCloseModal = () => {
//     setShowCreateForm(false);
//     setEditingNote(null);
//     setFormData({
//       title: "",
//       content: "",
//       branch: "",
//       semester: "",
//       subject: "",
//       file: null
//     });
//     setError("");
//     setActiveTab("all");
//   };

//   const onFormDataChange = (key: keyof NoteFormData, value: string | File | null) => {
//     setFormData(f => ({ ...f, [key]: value }));
//   };

//   const onOrgFormDataChange = (key: keyof OrganizationFormData, value: string) => {
//     setOrgFormData(f => ({ ...f, [key]: value }));
//   };

//   const getAvailableTabs = () => {
//     if (user.role === "admin") {
//       return ["profile", "add-organization"];
//     } else {
//       return ["all", "my-notes", "org-notes", "create", "group-chat", "dm-chat",  "summary"];
//     }
//   };

//   const getCurrentNotes = () => {
//     switch (activeTab) {
//       case "all": return notes;
//       case "my-notes": return myNotes;
//       case "org-notes": return orgNotes;
//       default: return [];
//     }
//   };

//   const getCurrentFilters = () => {
//     switch (activeTab) {
//       case "my-notes": return myNotesFilters;
//       case "org-notes": return orgNotesFilters;
//       default: return filters;
//     }
//   };

//   const getCurrentPagination = () => {
//     switch (activeTab) {
//       case "my-notes": return myNotesPagination;
//       case "org-notes": return orgNotesPagination;
//       default: return pagination;
//     }
//   };

//   const handleFilterChange = (key: string, value: string) => {
//     switch (activeTab) {
//       case "my-notes":
//         setMyNotesFilters(f => ({ ...f, [key]: value }));
//         setMyNotesPagination(p => ({ ...p, page: 1 }));
//         break;
//       case "org-notes":
//         setOrgNotesFilters(f => ({ ...f, [key]: value }));
//         setOrgNotesPagination(p => ({ ...p, page: 1 }));
//         break;
//       default:
//         setFilters(f => ({ ...f, [key]: value }));
//         setPagination(p => ({ ...p, page: 1 }));
//         break;
//     }
//   };

//   const handleClearFilters = () => {
//     const emptyFilters = { branch: "", semester: "", subject: "", search: "" };
//     switch (activeTab) {
//       case "my-notes":
//         setMyNotesFilters(emptyFilters);
//         break;
//       case "org-notes":
//         setOrgNotesFilters(emptyFilters);
//         break;
//       default:
//         setFilters(emptyFilters);
//         break;
//     }
//   };

//   const handlePageChange = (page: number) => {
//     switch (activeTab) {
//       case "my-notes":
//         setMyNotesPagination(p => ({ ...p, page }));
//         break;
//       case "org-notes":
//         setOrgNotesPagination(p => ({ ...p, page }));
//         break;
//       default:
//         setPagination(p => ({ ...p, page }));
//         break;
//     }
//   };

//   const handleDeleteNote = async (id: string) => {
//     if(!confirm("Delete this note?")) return;
    
//     setLoading(true);
//     try {
//       const res = await deleteNote(id);
//       if(res.success) {
//         // Refresh the appropriate notes list based on active tab
//         if (activeTab === "all") fetchNotesList();
//         else if (activeTab === "my-notes") fetchMyNotesList();
//         else if (activeTab === "org-notes") fetchOrgNotesList();
//       } else {
//         setError(res.error || "Failed to delete note");
//       }
//     } catch (e: any) {
//       setError(e.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const renderNotesTab = (tabType: "all" | "my-notes" | "org-notes") => {
//     if (user.role !== "student") return <div className="text-red-400">Access denied</div>;
    
//     const currentNotes = getCurrentNotes();
//     const currentFilters = getCurrentFilters();
//     const currentPagination = getCurrentPagination();
    
//     const getTabTitle = () => {
//       switch (tabType) {
//         case "my-notes": return "My Notes";
//         case "org-notes": return "Organization Notes";
//         default: return "All Notes";
//       }
//     };

//     return (
//       <>
//         <div className="mb-6">
//           <h1 className="text-3xl font-bold text-white">{getTabTitle()}</h1>
//           {tabType === "my-notes" && (
//             <p className="text-gray-400 mt-2">Notes created by you</p>
//           )}
//           {tabType === "org-notes" && (
//             <p className="text-gray-400 mt-2">Notes from your organization</p>
//           )}
//         </div>
        
//         <Header 
//           onCreateNote={() => {
//             setEditingNote(null);
//             setFormData({
//               title: "",
//               content: "",
//               branch: "",
//               semester: "",
//               subject: "",
//               file: null
//             });
//             setActiveTab("create");
//             setShowCreateForm(true);
//           }} 
//           selectedCount={selectedNotes.length} 
//           onBulkDelete={handleBulkDelete} 
//         />
//         <SearchAndFilters
//           filters={currentFilters}
//           onFilterChange={handleFilterChange}
//           onClearFilters={handleClearFilters}
//         />
//         {error && <div className="my-4 p-3 bg-red-700 text-red-100 rounded">{error}</div>}
//         <ResultsSummary loading={loading} notesCount={currentNotes.length} totalCount={currentPagination.total} />
//         <NotesList
//           notes={currentNotes}
//           loading={loading}
//           selectedNotes={selectedNotes}
//           onSelectAll={() => setSelectedNotes(s => s.length === currentNotes.length ? [] : currentNotes.map(n => n.id||n._id||""))}
//           onSelectNote={id => setSelectedNotes(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id])}
//           onEditNote={handleEditNote}
//           onDeleteNote={handleDeleteNote}
//         />
//         <Pagination pagination={currentPagination} onPageChange={handlePageChange} />
//       </>
//     );
//   };

//   const renderTabContent = () => {
//     switch (activeTab) {
//       case "all":
//         return renderNotesTab("all");

//       case "my-notes":
//         return renderNotesTab("my-notes");

//       case "org-notes":
//         return renderNotesTab("org-notes");

//       case "create":
//         if (user.role !== "student") return <div className="text-red-400">Access denied</div>;
      
      
//         return (
//           <CreateNoteModal
//             show={showCreateForm}
//             formData={formData}
//             isEditing={!!editingNote}
//             onClose={handleCloseModal}
//             onFormDataChange={onFormDataChange}
//             onSubmit={handleFormSubmit}
//             error={error}
//           />
//         );

//       case "summary":
//         if (user.role !== "student") return <div className="text-red-400">Access denied</div>;
        
//         return <ResultsSummary loading={loading} notesCount={notes.length} totalCount={pagination.total} />;

//       case "group-chat":
//       return <GroupChat user={user} />;
//        case "dm-chat":
//       return <DMChat currentUser={{ uid: user.id, name: user.name }} />

//       case "profile":
//         return (
//           <div className="space-y-6">
//             <h2 className="text-2xl font-semibold text-white">Admin Profile</h2>
//             <div className="bg-gray-800 p-6 rounded-lg space-y-4">
//               <div><span className="font-medium text-gray-300">Name: </span><span className="text-gray-100">{user.name}</span></div>
//               <div><span className="font-medium text-gray-300">Email: </span><span className="text-gray-100">{user.email}</span></div>
//               <div><span className="font-medium text-gray-300">Role: </span><span className="text-blue-400 font-semibold">{user.role}</span></div>
//               {user.organization && (
//                 <div><span className="font-medium text-gray-300">Organization: </span><span className="text-gray-100">{user.organization}</span></div>
//               )}
//             </div>
            
//             <div className="bg-gray-800 p-6 rounded-lg">
//               <h3 className="text-xl font-semibold text-white mb-4">Admin Actions</h3>
//               <div className="space-y-2">
//                 <button 
//                   onClick={() => setActiveTab("add-organization")}
//                   className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded text-white"
//                 >
//                   Add New Organization
//                 </button>
//               </div>
//             </div>
//           </div>
//         );

//       case "add-organization":
//         if (user.role !== "admin") return <div className="text-red-400">Access denied</div>;
        
//         return (
//           <div className="space-y-6">
//             <h2 className="text-2xl font-semibold text-white">Add New Organization</h2>
            
//             {error && <div className="p-3 bg-red-700 text-red-100 rounded">{error}</div>}
            
//             <div className="bg-gray-800 p-6 rounded-lg">
//               <form onSubmit={(e) => { e.preventDefault(); handleCreateOrganization(); }} className="space-y-4">
//                 <div>
//                   <label className="block text-gray-300 font-medium mb-2">Organization Name</label>
//                   <input
//                     type="text"
//                     value={orgFormData.name}
//                     onChange={(e) => onOrgFormDataChange("name", e.target.value)}
//                     className="w-full p-3 bg-gray-700 text-white rounded border border-gray-600 focus:border-blue-500"
//                     placeholder="Enter organization name"
//                     required
//                   />
//                 </div>
                
//                 <div>
//                   <label className="block text-gray-300 font-medium mb-2">Description</label>
//                   <textarea
//                     value={orgFormData.description}
//                     onChange={(e) => onOrgFormDataChange("description", e.target.value)}
//                     className="w-full p-3 bg-gray-700 text-white rounded border border-gray-600 focus:border-blue-500"
//                     rows={4}
//                     placeholder="Enter organization description"
//                     required
//                   />
//                 </div>
                
//                 <div>
//                   <label className="block text-gray-300 font-medium mb-2">Location</label>
//                   <input
//                     type="text"
//                     value={orgFormData.location}
//                     onChange={(e) => onOrgFormDataChange("location", e.target.value)}
//                     className="w-full p-3 bg-gray-700 text-white rounded border border-gray-600 focus:border-blue-500"
//                     placeholder="Enter organization location"
//                     required
//                   />
//                 </div>
                
//                 <div>
//                   <label className="block text-gray-300 font-medium mb-2">Contact Email</label>
//                   <input
//                     type="email"
//                     value={orgFormData.contactEmail}
//                     onChange={(e) => onOrgFormDataChange("contactEmail", e.target.value)}
//                     className="w-full p-3 bg-gray-700 text-white rounded border border-gray-600 focus:border-blue-500"
//                     placeholder="Enter contact email"
//                     required
//                   />
//                 </div>
                
//                 <div className="flex gap-4">
//                   <button
//                     type="submit"
//                     disabled={loading}
//                     className="bg-green-600 hover:bg-green-700 disabled:bg-gray-600 px-6 py-2 rounded text-white"
//                   >
//                     {loading ? "Creating..." : "Create Organization"}
//                   </button>
                  
//                   <button
//                     type="button"
//                     onClick={() => {
//                       setOrgFormData({ name: "", description: "", location: "", contactEmail: "" });
//                       setActiveTab("profile");
//                     }}
//                     className="bg-gray-600 hover:bg-gray-700 px-6 py-2 rounded text-white"
//                   >
//                     Cancel
//                   </button>
//                 </div>
//               </form>
//             </div>
//           </div>
//         );

//       default: 
//         return <div className="text-gray-400">Select a tab to get started</div>;
//     }
//   };

//   const getTabLabel = (tab: string) => {
//     switch (tab) {
//       case "add-organization": return "Add Organization";
//       case "my-notes": return "My Notes";
//       case "org-notes": return "Org Notes";
//       default: return tab.charAt(0).toUpperCase() + tab.slice(1);
//     }
//   };

//   return (
//     <div className="flex min-h-screen bg-gray-900 text-gray-100">
//       <aside className="w-64 bg-gray-800 p-4 space-y-2">
//         <div className="mb-6 p-3 bg-gray-700 rounded">
//           <div className="text-sm text-gray-300">Logged in as:</div>
//           <div className="font-semibold text-white">{user.name}</div>
//           <div className="text-xs text-blue-400">{user.role}</div>
//         </div>
        
//         {getAvailableTabs().map(tab => (
//           <button 
//             key={tab}
//             className={`block w-full text-left px-3 py-2 rounded ${activeTab === tab ? "bg-gray-700" : "hover:bg-gray-700"}`}
//             onClick={() => {
//               setActiveTab(tab as Tab);
//               setSelectedNotes([]); // Clear selected notes when switching tabs
//               if (tab === "create") {
//                 setEditingNote(null);
//                 setFormData({
//                   title: "",
//                   content: "",
//                   branch: "",
//                   semester: "",
//                   subject: "",
//                   file: null
//                 });
//                 setShowCreateForm(true);
//               }
//             }}
//           >
//             {getTabLabel(tab)}
//           </button>
//         ))}
        
//         {(activeTab === "all" || activeTab === "my-notes" || activeTab === "org-notes") && selectedNotes.length > 0 && (
//           <button 
//             className="mt-4 w-full bg-red-600 px-3 py-2 rounded hover:bg-red-500" 
//             onClick={handleBulkDelete}
//           >
//             Delete {selectedNotes.length}
//           </button>
//         )}
        
//         <button 
//           onClick={() => {
//             localStorage.removeItem("token");
//             localStorage.removeItem("user");
//             window.location.href = "/login";
//           }}
//           className="mt-8 w-full bg-red-600 hover:bg-red-700 px-3 py-2 rounded text-white"
//         >
//           Logout
//         </button>
//       </aside>
      
//       <main className="flex-1 p-6 overflow-y-auto">
//         <div className="mt-6">{renderTabContent()}</div>
//       </main>
//     </div>
//   );
// }

// "use client";
// import Header from "../components/Header";
// import SearchAndFilters from "../components/SearchAndFilters";
// import ResultsSummary from "../components/ResultsSummary";
// import NotesList from "../components/NotesList";
// import Pagination from "../components/Pagination";
// import CreateNoteModal from "../components/CreateNoteModal";
// import {
//   createNote,
//   fetchNotes,
//   deleteNote,
//   updateNote,
//   getNoteById,
//   bulkDeleteNotes,
// } from "../services/noteService";
// import { useState, useEffect } from "react";

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

// interface Filters {
//   branch: string;
//   semester: string;
//   subject: string;
//   search: string;
// }

// interface NoteFormData {
//   title: string;
//   content: string;
//   branch: string;
//   semester: string;
//   subject: string;
//   file: File | null;
// }

// interface PaginationData {
//   page: number;
//   totalPages: number;
//   total: number;
// }

// interface DecodedToken {
//   userId: string;
//   email: string;
//   role: string;
//   name?: string;
//   organization?: string;
//   exp: number;
// }

// interface OrganizationFormData {
//   name: string;
//   description: string;
//   location: string;
//   contactEmail: string;
// }

// const defaultUser = {
//   name: "",
//   email: "",
//   role: "",
//   organization: ""
// };

// type Tab = "all" | "search" | "create" | "summary" | "profile" | "add-organization";

// export default function NotesDashboard() {
//   const [notes, setNotes] = useState<Note[]>([]);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState("");
//   const [selectedNotes, setSelectedNotes] = useState<string[]>([]);
//   const [editingNote, setEditingNote] = useState<Note | null>(null);
//   const [user, setUser] = useState(defaultUser);

//   const [filters, setFilters] = useState<Filters>({ branch: "", semester: "", subject: "", search: "" });
//   const [pagination, setPagination] = useState<PaginationData>({ page: 1, totalPages: 1, total: 0 });

//   const [formData, setFormData] = useState<NoteFormData>({ title: "", content: "", branch: "", semester: "", subject: "", file: null });
//   const [orgFormData, setOrgFormData] = useState<OrganizationFormData>({ name: "", description: "", location: "", contactEmail: "" });

//   const [showCreateForm, setShowCreateForm] = useState(false);
//   const [activeTab, setActiveTab] = useState<Tab>("all");

//   // Get user info from localStorage on component mount
//   useEffect(() => {
//     const userInfo = localStorage.getItem("user");
//     if (userInfo) {
//       const parsedUser = JSON.parse(userInfo);
//       setUser(parsedUser);
      
//       // Set initial tab based on user role
//       if (parsedUser.role === "admin") {
//         setActiveTab("profile");
//       } else {
//         setActiveTab("all");
//       }
//     }
//   }, []);

//   useEffect(() => {
//     if (activeTab === "all" && user.role === "student") fetchNotesList();
//   }, [filters, pagination.page, activeTab, user.role]);

//   async function fetchNotesList() {
//     setLoading(true);
//     setError("");
//     try {
//       const res = await fetchNotes(filters, pagination.page, 10);
//       if (res.success) {
//         setNotes(res.notes || []);
//         setPagination(p => ({ ...p, totalPages: res.totalPages || 1, total: res.total || 0 }));
//       } else throw new Error(res.error || "Failed to fetch notes");
//     } catch (e: any) {
//       setError(e.message);
//       setNotes([]);
//     } finally {
//       setLoading(false);
//     }
//   }

//   const handleBulkDelete = async () => {
//     if (!selectedNotes.length) return;
//     if (!confirm(`Delete ${selectedNotes.length} notes?`)) return;
//     setLoading(true);
//     try {
//       const res = await bulkDeleteNotes(selectedNotes);
//       if (res.success) {
//         setSelectedNotes([]);
//         fetchNotesList();
//       } else throw new Error(res.error || "Failed to delete notes");
//     } catch (e: any) {
//       setError(e.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleCreateOrganization = async () => {
//     setLoading(true);
//     setError("");
//     try {
//       // API call to create organization
//       const response = await fetch("/api/organizations", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//           "Authorization": `Bearer ${localStorage.getItem("token")}`
//         },
//         body: JSON.stringify(orgFormData)
//       });
      
//       const result = await response.json();
      
//       if (result.success) {
//         setOrgFormData({ name: "", description: "", location: "", contactEmail: "" });
//         alert("Organization created successfully!");
//       } else {
//         throw new Error(result.error || "Failed to create organization");
//       }
//     } catch (e: any) {
//       setError(e.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Handle edit note function
//   const handleEditNote = async (id: string) => {
//     setLoading(true);
//     setError("");
//     try {
//       const res = await getNoteById(id);
//       if (res.success && res.data) {
//         const noteData = res.data;
//         setEditingNote(noteData);
//         setFormData({
//           title: noteData.title,
//           content: noteData.content,
//           branch: noteData.branch,
//           semester: noteData.semester,
//           subject: noteData.subject,
//           file: null
//         });
//         setShowCreateForm(true);
//         setActiveTab("create");
//       } else {
//         throw new Error(res.error || "Failed to fetch note data");
//       }
//     } catch (e: any) {
//       setError(e.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Handle form submission (create or update)
//   const handleFormSubmit = async () => {
//     setLoading(true);
//     setError("");
//     try {
//       let res;
//       if (editingNote) {
//         // Update existing note
//         const noteId = editingNote.id || editingNote._id;
//         if (!noteId) {
//           throw new Error("Note ID is missing");
//         }
//         res = await updateNote(noteId, formData);
//       } else {
//         // Create new note
//         res = await createNote(formData);
//       }

//       if (res.success) {
//         // Reset form and close modal
//         setShowCreateForm(false);
//         setEditingNote(null);
//         setFormData({
//           title: "",
//           content: "",
//           branch: "",
//           semester: "",
//           subject: "",
//           file: null
//         });
//         setActiveTab("all");
//         fetchNotesList();
//       } else {
//         throw new Error(res.error || "Failed to save note");
//       }
//     } catch (e: any) {
//       setError(e.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Handle closing the modal
//   const handleCloseModal = () => {
//     setShowCreateForm(false);
//     setEditingNote(null);
//     setFormData({
//       title: "",
//       content: "",
//       branch: "",
//       semester: "",
//       subject: "",
//       file: null
//     });
//     setError("");
//     setActiveTab("all");
//   };

//   const onFormDataChange = (key: keyof NoteFormData, value: string | File | null) => {
//     setFormData(f => ({ ...f, [key]: value }));
//   };

//   const onOrgFormDataChange = (key: keyof OrganizationFormData, value: string) => {
//     setOrgFormData(f => ({ ...f, [key]: value }));
//   };

//   const getAvailableTabs = () => {
//     if (user.role === "admin") {
//       return ["profile", "add-organization"];
//     } else {
//       return ["all", "create", "summary"];
//     }
//   };

//   const renderTabContent = () => {
//     switch (activeTab) {
//       case "all":
//         if (user.role !== "student") return <div className="text-red-400">Access denied</div>;
        
//         return (
//           <>
//             <Header 
//               onCreateNote={() => {
//                 setEditingNote(null);
//                 setFormData({
//                   title: "",
//                   content: "",
//                   branch: "",
//                   semester: "",
//                   subject: "",
//                   file: null
//                 });
//                 setActiveTab("create");
//                 setShowCreateForm(true);
//               }} 
//               selectedCount={selectedNotes.length} 
//               onBulkDelete={handleBulkDelete} 
//             />
//             <SearchAndFilters
//               filters={filters}
//               onFilterChange={(k, v) => { 
//                 setFilters(f => ({ ...f, [k]: v })); 
//                 setPagination(p => ({ ...p, page: 1 })); 
//               }}
//               onClearFilters={() => setFilters({ branch: "", semester: "", subject: "", search: "" })}
//             />
//             {error && <div className="my-4 p-3 bg-red-700 text-red-100 rounded">{error}</div>}
//             <ResultsSummary loading={loading} notesCount={notes.length} totalCount={pagination.total} />
//             <NotesList
//               notes={notes}
//               loading={loading}
//               selectedNotes={selectedNotes}
//               onSelectAll={() => setSelectedNotes(s => s.length === notes.length ? [] : notes.map(n => n.id||n._id||""))}
//               onSelectNote={id => setSelectedNotes(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id])}
//               onEditNote={handleEditNote}
//               onDeleteNote={async id => { 
//                 if(confirm("Delete this note?")){ 
//                   setLoading(true); 
//                   const res = await deleteNote(id); 
//                   setLoading(false); 
//                   if(res.success) fetchNotesList(); 
//                   else setError(res.error || "Failed to delete note");
//                 } 
//               }}
//             />
//             <Pagination pagination={pagination} onPageChange={pg => setPagination(p => ({ ...p, page: pg }))} />
//           </>
//         );

//       case "create":
//         if (user.role !== "student") return <div className="text-red-400">Access denied</div>;
        
//         return (
//           <CreateNoteModal
//             show={showCreateForm}
//             formData={formData}
//             isEditing={!!editingNote}
//             onClose={handleCloseModal}
//             onFormDataChange={onFormDataChange}
//             onSubmit={handleFormSubmit}
//             error={error}
//           />
//         );

//       case "summary":
//         if (user.role !== "student") return <div className="text-red-400">Access denied</div>;
        
//         return <ResultsSummary loading={loading} notesCount={notes.length} totalCount={pagination.total} />;

//       case "profile":
//         return (
//           <div className="space-y-6">
//             <h2 className="text-2xl font-semibold text-white">Admin Profile</h2>
//             <div className="bg-gray-800 p-6 rounded-lg space-y-4">
//               <div><span className="font-medium text-gray-300">Name: </span><span className="text-gray-100">{user.name}</span></div>
//               <div><span className="font-medium text-gray-300">Email: </span><span className="text-gray-100">{user.email}</span></div>
//               <div><span className="font-medium text-gray-300">Role: </span><span className="text-blue-400 font-semibold">{user.role}</span></div>
//               {user.organization && (
//                 <div><span className="font-medium text-gray-300">Organization: </span><span className="text-gray-100">{user.organization}</span></div>
//               )}
//             </div>
            
//             <div className="bg-gray-800 p-6 rounded-lg">
//               <h3 className="text-xl font-semibold text-white mb-4">Admin Actions</h3>
//               <div className="space-y-2">
//                 <button 
//                   onClick={() => setActiveTab("add-organization")}
//                   className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded text-white"
//                 >
//                   Add New Organization
//                 </button>
//               </div>
//             </div>
//           </div>
//         );

//       case "add-organization":
//         if (user.role !== "admin") return <div className="text-red-400">Access denied</div>;
        
//         return (
//           <div className="space-y-6">
//             <h2 className="text-2xl font-semibold text-white">Add New Organization</h2>
            
//             {error && <div className="p-3 bg-red-700 text-red-100 rounded">{error}</div>}
            
//             <div className="bg-gray-800 p-6 rounded-lg">
//               <form onSubmit={(e) => { e.preventDefault(); handleCreateOrganization(); }} className="space-y-4">
//                 <div>
//                   <label className="block text-gray-300 font-medium mb-2">Organization Name</label>
//                   <input
//                     type="text"
//                     value={orgFormData.name}
//                     onChange={(e) => onOrgFormDataChange("name", e.target.value)}
//                     className="w-full p-3 bg-gray-700 text-white rounded border border-gray-600 focus:border-blue-500"
//                     placeholder="Enter organization name"
//                     required
//                   />
//                 </div>
                
//                 <div>
//                   <label className="block text-gray-300 font-medium mb-2">Description</label>
//                   <textarea
//                     value={orgFormData.description}
//                     onChange={(e) => onOrgFormDataChange("description", e.target.value)}
//                     className="w-full p-3 bg-gray-700 text-white rounded border border-gray-600 focus:border-blue-500"
//                     rows={4}
//                     placeholder="Enter organization description"
//                     required
//                   />
//                 </div>
                
//                 <div>
//                   <label className="block text-gray-300 font-medium mb-2">Location</label>
//                   <input
//                     type="text"
//                     value={orgFormData.location}
//                     onChange={(e) => onOrgFormDataChange("location", e.target.value)}
//                     className="w-full p-3 bg-gray-700 text-white rounded border border-gray-600 focus:border-blue-500"
//                     placeholder="Enter organization location"
//                     required
//                   />
//                 </div>
                
//                 <div>
//                   <label className="block text-gray-300 font-medium mb-2">Contact Email</label>
//                   <input
//                     type="email"
//                     value={orgFormData.contactEmail}
//                     onChange={(e) => onOrgFormDataChange("contactEmail", e.target.value)}
//                     className="w-full p-3 bg-gray-700 text-white rounded border border-gray-600 focus:border-blue-500"
//                     placeholder="Enter contact email"
//                     required
//                   />
//                 </div>
                
//                 <div className="flex gap-4">
//                   <button
//                     type="submit"
//                     disabled={loading}
//                     className="bg-green-600 hover:bg-green-700 disabled:bg-gray-600 px-6 py-2 rounded text-white"
//                   >
//                     {loading ? "Creating..." : "Create Organization"}
//                   </button>
                  
//                   <button
//                     type="button"
//                     onClick={() => {
//                       setOrgFormData({ name: "", description: "", location: "", contactEmail: "" });
//                       setActiveTab("profile");
//                     }}
//                     className="bg-gray-600 hover:bg-gray-700 px-6 py-2 rounded text-white"
//                   >
//                     Cancel
//                   </button>
//                 </div>
//               </form>
//             </div>
//           </div>
//         );

//       default: 
//         return <div className="text-gray-400">Select a tab to get started</div>;
//     }
//   };

//   const getTabLabel = (tab: string) => {
//     switch (tab) {
//       case "add-organization": return "Add Organization";
//       default: return tab.charAt(0).toUpperCase() + tab.slice(1);
//     }
//   };

//   return (
//     <div className="flex min-h-screen bg-gray-900 text-gray-100">
//       <aside className="w-64 bg-gray-800 p-4 space-y-2">
//         <div className="mb-6 p-3 bg-gray-700 rounded">
//           <div className="text-sm text-gray-300">Logged in as:</div>
//           <div className="font-semibold text-white">{user.name}</div>
//           <div className="text-xs text-blue-400">{user.role}</div>
//         </div>
        
//         {getAvailableTabs().map(tab => (
//           <button 
//             key={tab}
//             className={`block w-full text-left px-3 py-2 rounded ${activeTab === tab ? "bg-gray-700" : "hover:bg-gray-700"}`}
//             onClick={() => {
//               setActiveTab(tab as Tab);
//               if (tab === "create") {
//                 setEditingNote(null);
//                 setFormData({
//                   title: "",
//                   content: "",
//                   branch: "",
//                   semester: "",
//                   subject: "",
//                   file: null
//                 });
//                 setShowCreateForm(true);
//               }
//             }}
//           >
//             {getTabLabel(tab)}
//           </button>
//         ))}
        
//         {activeTab === "all" && selectedNotes.length > 0 && (
//           <button 
//             className="mt-4 w-full bg-red-600 px-3 py-2 rounded hover:bg-red-500" 
//             onClick={handleBulkDelete}
//           >
//             Delete {selectedNotes.length}
//           </button>
//         )}
        
//         <button 
//           onClick={() => {
//             localStorage.removeItem("token");
//             localStorage.removeItem("user");
//             window.location.href = "/login";
//           }}
//           className="mt-8 w-full bg-red-600 hover:bg-red-700 px-3 py-2 rounded text-white"
//         >
//           Logout
//         </button>
//       </aside>
      
//       <main className="flex-1 p-6 overflow-y-auto">
//         <div className="mt-6">{renderTabContent()}</div>
//       </main>
//     </div>
//   );
// }

// "use client";
// import Header from "../components/Header";
// import SearchAndFilters from "../components/SearchAndFilters";
// import ResultsSummary from "../components/ResultsSummary";
// import NotesList from "../components/NotesList";
// import Pagination from "../components/Pagination";
// import CreateNoteModal from "../components/CreateNoteModal";
// import {
//   createNote,
//   fetchNotes,
//   deleteNote,
//   updateNote,
//   getNoteById,
//   bulkDeleteNotes,
// } from "../services/noteService";
// import { useState, useEffect } from "react";

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

// interface Filters {
//   branch: string;
//   semester: string;
//   subject: string;
//   search: string;
// }

// interface NoteFormData {
//   title: string;
//   content: string;
//   branch: string;
//   semester: string;
//   subject: string;
//   file: File | null;
// }

// interface PaginationData {
//   page: number;
//   totalPages: number;
//   total: number;
// }

// interface DecodedToken {
//   userId: string;
//   email: string;
//   role: string;
//   name?: string;
//   organization?: string;
//   exp: number;
// }

// interface OrganizationFormData {
//   name: string;
//   description: string;
//   location: string;
//   contactEmail: string;
// }

// const defaultUser = {
//   name: "",
//   email: "",
//   role: "",
//   organization: ""
// };

// type Tab = "all" | "search" | "create" | "summary" | "profile" | "add-organization";

// export default function NotesDashboard() {
//   const [notes, setNotes] = useState<Note[]>([]);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState("");
//   const [selectedNotes, setSelectedNotes] = useState<string[]>([]);
//   const [editingNote, setEditingNote] = useState<Note | null>(null);
//   const [user, setUser] = useState(defaultUser);

//   const [filters, setFilters] = useState<Filters>({ branch: "", semester: "", subject: "", search: "" });
//   const [pagination, setPagination] = useState<PaginationData>({ page: 1, totalPages: 1, total: 0 });

//   const [formData, setFormData] = useState<NoteFormData>({ title: "", content: "", branch: "", semester: "", subject: "", file: null });
//   const [orgFormData, setOrgFormData] = useState<OrganizationFormData>({ name: "", description: "", location: "", contactEmail: "" });

//   const [showCreateForm, setShowCreateForm] = useState(false);
//   const [activeTab, setActiveTab] = useState<Tab>("all");

//   // Get user info from localStorage on component mount
//   useEffect(() => {
//     const userInfo = localStorage.getItem("user");
//     if (userInfo) {
//       const parsedUser = JSON.parse(userInfo);
//       setUser(parsedUser);
      
//       // Set initial tab based on user role
//       if (parsedUser.role === "admin") {
//         setActiveTab("profile");
//       } else {
//         setActiveTab("all");
//       }
//     }
//   }, []);

//   useEffect(() => {
//     if (activeTab === "all" && user.role === "student") fetchNotesList();
//   }, [filters, pagination.page, activeTab, user.role]);

//   async function fetchNotesList() {
//     setLoading(true);
//     setError("");
//     try {
//       const res = await fetchNotes(filters, pagination.page, 10);
//       if (res.success) {
//         setNotes(res.notes || []);
//         setPagination(p => ({ ...p, totalPages: res.totalPages || 1, total: res.total || 0 }));
//       } else throw new Error(res.error || "Failed to fetch notes");
//     } catch (e: any) {
//       setError(e.message);
//       setNotes([]);
//     } finally {
//       setLoading(false);
//     }
//   }

//   const handleBulkDelete = async () => {
//     if (!selectedNotes.length) return;
//     if (!confirm(`Delete ${selectedNotes.length} notes?`)) return;
//     setLoading(true);
//     try {
//       const res = await bulkDeleteNotes(selectedNotes);
//       if (res.success) {
//         setSelectedNotes([]);
//         fetchNotesList();
//       } else throw new Error(res.error || "Failed to delete notes");
//     } catch (e: any) {
//       setError(e.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleCreateOrganization = async () => {
//     setLoading(true);
//     setError("");
//     try {
//       // API call to create organization
//       const response = await fetch("/api/organizations", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//           "Authorization": `Bearer ${localStorage.getItem("token")}`
//         },
//         body: JSON.stringify(orgFormData)
//       });
      
//       const result = await response.json();
      
//       if (result.success) {
//         setOrgFormData({ name: "", description: "", location: "", contactEmail: "" });
//         alert("Organization created successfully!");
//       } else {
//         throw new Error(result.error || "Failed to create organization");
//       }
//     } catch (e: any) {
//       setError(e.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const onFormDataChange = (key: keyof NoteFormData, value: string | File | null) => {
//     setFormData(f => ({ ...f, [key]: value }));
//   };

//   const onOrgFormDataChange = (key: keyof OrganizationFormData, value: string) => {
//     setOrgFormData(f => ({ ...f, [key]: value }));
//   };

//   const getAvailableTabs = () => {
//     if (user.role === "admin") {
//       return ["profile", "add-organization"];
//     } else {
//       return ["all", "create", "summary"];
//     }
//   };

//   const renderTabContent = () => {
//     switch (activeTab) {
//       case "all":
//         if (user.role !== "student") return <div className="text-red-400">Access denied</div>;
        
//         return (
//           <>
//             <Header onCreateNote={()=>{setActiveTab("create");setShowCreateForm(true);}} selectedCount={selectedNotes.length} onBulkDelete={handleBulkDelete} />
//             <SearchAndFilters
//               filters={filters}
//               onFilterChange={(k, v) => { setFilters(f => ({ ...f, [k]: v })); setPagination(p => ({ ...p, page: 1 })); }}
//               onClearFilters={() => setFilters({ branch: "", semester: "", subject: "", search: "" })}
//             />
//             {error && <div className="my-4 p-3 bg-red-700 text-red-100 rounded">{error}</div>}
//             <ResultsSummary loading={loading} notesCount={notes.length} totalCount={pagination.total} />
//             <NotesList
//               notes={notes}
//               loading={loading}
//               selectedNotes={selectedNotes}
//               onSelectAll={() => setSelectedNotes(s => s.length === notes.length ? [] : notes.map(n => n.id||n._id||""))}
//               onSelectNote={id => setSelectedNotes(s => s.includes(id)?s.filter(x=>x!==id):[...s,id])}
//               onEditNote={async id => {
//                 setLoading(true);
//                 const res = await getNoteById(id);
//                 setLoading(false);
//                 if (res.success && res.data) {
//                   setEditingNote(res.data);
//                   setFormData({ title: res.data.title, content: res.data.content, branch: res.data.branch, semester: res.data.semester, subject: res.data.subject, file: null });
//                   setShowCreateForm(true);
//                   setActiveTab("create");
//                 }
//               }}
//               onDeleteNote={async id => { if(confirm("Delete this note?")){ setLoading(true); const res=await deleteNote(id); setLoading(false); if(res.success) fetchNotesList(); } }}
//             />
//             <Pagination pagination={pagination} onPageChange={pg => setPagination(p => ({ ...p, page: pg }))} />
//           </>
//         );

//       case "create":
//         if (user.role !== "student") return <div className="text-red-400">Access denied</div>;
        
//         return (
//           <CreateNoteModal
//             show={showCreateForm}
//             formData={formData}
//             isEditing={!!editingNote}
//             onClose={()=>{setShowCreateForm(false);setEditingNote(null);setActiveTab("all");}}
//             onFormDataChange={onFormDataChange}
//             onSubmit={async()=>{
//               setLoading(true);setError("");
//               try{
//                 const res = editingNote
//                   ? await updateNote(editingNote.id||editingNote._id!, formData)
//                   : await createNote(formData);
//                 if(res.success){
//                   setShowCreateForm(false);setEditingNote(null);
//                   setFormData({title:"",content:"",branch:"",semester:"",subject:"",file:null});
//                   setActiveTab("all");fetchNotesList();
//                 } else throw new Error(res.error||"Failed to save note");
//               }catch(e:any){setError(e.message);}finally{setLoading(false);}            }}
//             error={error}
//           />
//         );

//       case "summary":
//         if (user.role !== "student") return <div className="text-red-400">Access denied</div>;
        
//         return <ResultsSummary loading={loading} notesCount={notes.length} totalCount={pagination.total} />;

//       case "profile":
//         return (
//           <div className="space-y-6">
//             <h2 className="text-2xl font-semibold text-white">Admin Profile</h2>
//             <div className="bg-gray-800 p-6 rounded-lg space-y-4">
//               <div><span className="font-medium text-gray-300">Name: </span><span className="text-gray-100">{user.name}</span></div>
//               <div><span className="font-medium text-gray-300">Email: </span><span className="text-gray-100">{user.email}</span></div>
//               <div><span className="font-medium text-gray-300">Role: </span><span className="text-blue-400 font-semibold">{user.role}</span></div>
//               {user.organization && (
//                 <div><span className="font-medium text-gray-300">Organization: </span><span className="text-gray-100">{user.organization}</span></div>
//               )}
//             </div>
            
//             <div className="bg-gray-800 p-6 rounded-lg">
//               <h3 className="text-xl font-semibold text-white mb-4">Admin Actions</h3>
//               <div className="space-y-2">
//                 <button 
//                   onClick={() => setActiveTab("add-organization")}
//                   className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded text-white"
//                 >
//                   Add New Organization
//                 </button>
//               </div>
//             </div>
//           </div>
//         );

//       case "add-organization":
//         if (user.role !== "admin") return <div className="text-red-400">Access denied</div>;
        
//         return (
//           <div className="space-y-6">
//             <h2 className="text-2xl font-semibold text-white">Add New Organization</h2>
            
//             {error && <div className="p-3 bg-red-700 text-red-100 rounded">{error}</div>}
            
//             <div className="bg-gray-800 p-6 rounded-lg">
//               <form onSubmit={(e) => { e.preventDefault(); handleCreateOrganization(); }} className="space-y-4">
//                 <div>
//                   <label className="block text-gray-300 font-medium mb-2">Organization Name</label>
//                   <input
//                     type="text"
//                     value={orgFormData.name}
//                     onChange={(e) => onOrgFormDataChange("name", e.target.value)}
//                     className="w-full p-3 bg-gray-700 text-white rounded border border-gray-600 focus:border-blue-500"
//                     placeholder="Enter organization name"
//                     required
//                   />
//                 </div>
                
//                 <div>
//                   <label className="block text-gray-300 font-medium mb-2">Description</label>
//                   <textarea
//                     value={orgFormData.description}
//                     onChange={(e) => onOrgFormDataChange("description", e.target.value)}
//                     className="w-full p-3 bg-gray-700 text-white rounded border border-gray-600 focus:border-blue-500"
//                     rows={4}
//                     placeholder="Enter organization description"
//                     required
//                   />
//                 </div>
                
//                 <div>
//                   <label className="block text-gray-300 font-medium mb-2">Location</label>
//                   <input
//                     type="text"
//                     value={orgFormData.location}
//                     onChange={(e) => onOrgFormDataChange("location", e.target.value)}
//                     className="w-full p-3 bg-gray-700 text-white rounded border border-gray-600 focus:border-blue-500"
//                     placeholder="Enter organization location"
//                     required
//                   />
//                 </div>
                
//                 <div>
//                   <label className="block text-gray-300 font-medium mb-2">Contact Email</label>
//                   <input
//                     type="email"
//                     value={orgFormData.contactEmail}
//                     onChange={(e) => onOrgFormDataChange("contactEmail", e.target.value)}
//                     className="w-full p-3 bg-gray-700 text-white rounded border border-gray-600 focus:border-blue-500"
//                     placeholder="Enter contact email"
//                     required
//                   />
//                 </div>
                
//                 <div className="flex gap-4">
//                   <button
//                     type="submit"
//                     disabled={loading}
//                     className="bg-green-600 hover:bg-green-700 disabled:bg-gray-600 px-6 py-2 rounded text-white"
//                   >
//                     {loading ? "Creating..." : "Create Organization"}
//                   </button>
                  
//                   <button
//                     type="button"
//                     onClick={() => {
//                       setOrgFormData({ name: "", description: "", location: "", contactEmail: "" });
//                       setActiveTab("profile");
//                     }}
//                     className="bg-gray-600 hover:bg-gray-700 px-6 py-2 rounded text-white"
//                   >
//                     Cancel
//                   </button>
//                 </div>
//               </form>
//             </div>
//           </div>
//         );

//       default: 
//         return <div className="text-gray-400">Select a tab to get started</div>;
//     }
//   };

//   const getTabLabel = (tab: string) => {
//     switch (tab) {
//       case "add-organization": return "Add Organization";
//       default: return tab.charAt(0).toUpperCase() + tab.slice(1);
//     }
//   };

//   return (
//     <div className="flex min-h-screen bg-gray-900 text-gray-100">
//       <aside className="w-64 bg-gray-800 p-4 space-y-2">
//         <div className="mb-6 p-3 bg-gray-700 rounded">
//           <div className="text-sm text-gray-300">Logged in as:</div>
//           <div className="font-semibold text-white">{user.name}</div>
//           <div className="text-xs text-blue-400">{user.role}</div>
//         </div>
        
//         {getAvailableTabs().map(tab => (
//           <button 
//             key={tab}
//             className={`block w-full text-left px-3 py-2 rounded ${activeTab === tab ? "bg-gray-700" : "hover:bg-gray-700"}`}
//             onClick={() => {
//               setActiveTab(tab as Tab);
//               if (tab === "create") setShowCreateForm(true);
//             }}
//           >
//             {getTabLabel(tab)}
//           </button>
//         ))}
        
//         {activeTab === "all" && selectedNotes.length > 0 && (
//           <button 
//             className="mt-4 w-full bg-red-600 px-3 py-2 rounded hover:bg-red-500" 
//             onClick={handleBulkDelete}
//           >
//             Delete {selectedNotes.length}
//           </button>
//         )}
        
//         <button 
//           onClick={() => {
//             localStorage.removeItem("token");
//             localStorage.removeItem("user");
//             window.location.href = "/login";
//           }}
//           className="mt-8 w-full bg-red-600 hover:bg-red-700 px-3 py-2 rounded text-white"
//         >
//           Logout
//         </button>
//       </aside>
      
//       <main className="flex-1 p-6 overflow-y-auto">
//         <div className="mt-6">{renderTabContent()}</div>
//       </main>
//     </div>
//   );
// }
// "use client";

// import Header from "../components/Header";
// import SearchAndFilters from "../components/SearchAndFilters";
// import ResultsSummary from "../components/ResultsSummary";
// import NotesList from "../components/NotesList";
// import Pagination from "../components/Pagination";
// import CreateNoteModal from "../components/CreateNoteModal";
// import {
//   createNote,
//   fetchNotes,
//   deleteNote,
//   updateNote,
//   getNoteById,
//   bulkDeleteNotes,
// } from "../services/noteService";
// import { useState, useEffect } from "react";

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

// interface Filters {
//   branch: string;
//   semester: string;
//   subject: string;
//   search: string;
// }

// interface NoteFormData {
//   title: string;
//   content: string;
//   branch: string;
//   semester: string;
//   subject: string;
//   file: File | null;
// }

// interface PaginationData {
//   page: number;
//   totalPages: number;
//   total: number;
// }

// interface DecodedToken {
//   userId: string;
//   email: string;
//   role: string;
//   name?: string;
//   organization?: string;
//   exp: number;
// }

// const defaultUser = {
//   name: "",
//   email: "",
//   role: "",
//   organization: ""
// };

// type Tab = "all" | "search" | "create" | "summary" | "profile";

// // Mock user profile (replace with actual auth context/service)
// const mockUser = { name: "John Doe", email: "john.doe@example.com" };

// export default function NotesDashboard() {
//   const [notes, setNotes] = useState<Note[]>([]);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState("");
//   const [selectedNotes, setSelectedNotes] = useState<string[]>([]);
//   const [editingNote, setEditingNote] = useState<Note | null>(null);

//   const [filters, setFilters] = useState<Filters>({ branch: "", semester: "", subject: "", search: "" });
//   const [pagination, setPagination] = useState<PaginationData>({ page: 1, totalPages: 1, total: 0 });

//   const [formData, setFormData] = useState<NoteFormData>({ title: "", content: "", branch: "", semester: "", subject: "", file: null });

//   const [showCreateForm, setShowCreateForm] = useState(false);
//   const [activeTab, setActiveTab] = useState<Tab>("all");

//   useEffect(() => {
//     if (activeTab === "all") fetchNotesList();
//   }, [filters, pagination.page, activeTab]);

//   async function fetchNotesList() {
//     setLoading(true);
//     setError("");
//     try {
//       const res = await fetchNotes(filters, pagination.page, 10);
//       if (res.success) {
//         setNotes(res.notes || []);
//         setPagination(p => ({ ...p, totalPages: res.totalPages || 1, total: res.total || 0 }));
//       } else throw new Error(res.error || "Failed to fetch notes");
//     } catch (e: any) {
//       setError(e.message);
//       setNotes([]);
//     } finally {
//       setLoading(false);
//     }
//   }

//   const handleBulkDelete = async () => {
//     if (!selectedNotes.length) return;
//     if (!confirm(`Delete ${selectedNotes.length} notes?`)) return;
//     setLoading(true);
//     try {
//       const res = await bulkDeleteNotes(selectedNotes);
//       if (res.success) {
//         setSelectedNotes([]);
//         fetchNotesList();
//       } else throw new Error(res.error || "Failed to delete notes");
//     } catch (e: any) {
//       setError(e.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const onFormDataChange = (key: keyof NoteFormData, value: string | File | null) => {
//     setFormData(f => ({ ...f, [key]: value }));
//   };

//   const renderTabContent = () => {
//     switch (activeTab) {
//       case "all":
//         return (
//           <>
//             {/* All Notes View: Filters + List + Pagination */}
//                <Header onCreateNote={()=>{setActiveTab("create");setShowCreateForm(true);}} selectedCount={selectedNotes.length} onBulkDelete={handleBulkDelete} />
//             <SearchAndFilters
//               filters={filters}
//               onFilterChange={(k, v) => { setFilters(f => ({ ...f, [k]: v })); setPagination(p => ({ ...p, page: 1 })); }}
//               onClearFilters={() => setFilters({ branch: "", semester: "", subject: "", search: "" })}
//             />
//             {error && <div className="my-4 p-3 bg-red-700 text-red-100 rounded">{error}</div>}
//             <ResultsSummary loading={loading} notesCount={notes.length} totalCount={pagination.total} />
//             <NotesList
//               notes={notes}
//               loading={loading}
//               selectedNotes={selectedNotes}
//               onSelectAll={() => setSelectedNotes(s => s.length === notes.length ? [] : notes.map(n => n.id||n._id||""))}
//               onSelectNote={id => setSelectedNotes(s => s.includes(id)?s.filter(x=>x!==id):[...s,id])}
//               onEditNote={async id => {
//                 setLoading(true);
//                 const res = await getNoteById(id);
//                 setLoading(false);
//                 if (res.success && res.data) {
//                   setEditingNote(res.data);
//                   setFormData({ title: res.data.title, content: res.data.content, branch: res.data.branch, semester: res.data.semester, subject: res.data.subject, file: null });
//                   setShowCreateForm(true);
//                   setActiveTab("create");
//                 }
//               }}
//               onDeleteNote={async id => { if(confirm("Delete this note?")){ setLoading(true); const res=await deleteNote(id); setLoading(false); if(res.success) fetchNotesList(); } }}
//             />
//             <Pagination pagination={pagination} onPageChange={pg => setPagination(p => ({ ...p, page: pg }))} />
//           </>
//         );
//       case "search":
//         return (
//           <>
//             {/* All Notes View: Filters + List + Pagination */}
//             <SearchAndFilters
//               filters={filters}
//               onFilterChange={(k, v) => { setFilters(f => ({ ...f, [k]: v })); setPagination(p => ({ ...p, page: 1 })); }}
//               onClearFilters={() => setFilters({ branch: "", semester: "", subject: "", search: "" })}
//             />
//             {error && <div className="my-4 p-3 bg-red-700 text-red-100 rounded">{error}</div>}
//             <ResultsSummary loading={loading} notesCount={notes.length} totalCount={pagination.total} />
//             <NotesList
//               notes={notes}
//               loading={loading}
//               selectedNotes={selectedNotes}
//               onSelectAll={() => setSelectedNotes(s => s.length === notes.length ? [] : notes.map(n => n.id||n._id||""))}
//               onSelectNote={id => setSelectedNotes(s => s.includes(id)?s.filter(x=>x!==id):[...s,id])}
//               onEditNote={async id => {
//                 setLoading(true);
//                 const res = await getNoteById(id);
//                 setLoading(false);
//                 if (res.success && res.data) {
//                   setEditingNote(res.data);
//                   setFormData({ title: res.data.title, content: res.data.content, branch: res.data.branch, semester: res.data.semester, subject: res.data.subject, file: null });
//                   setShowCreateForm(true);
//                   setActiveTab("create");
//                 }
//               }}
//               onDeleteNote={async id => { if(confirm("Delete this note?")){ setLoading(true); const res=await deleteNote(id); setLoading(false); if(res.success) fetchNotesList(); } }}
//             />
//             <Pagination pagination={pagination} onPageChange={pg => setPagination(p => ({ ...p, page: pg }))} />
//           </>
//         );
//       case "create":
//         return (
//           <CreateNoteModal
//             show={showCreateForm}
//             formData={formData}
//             isEditing={!!editingNote}
//             onClose={()=>{setShowCreateForm(false);setEditingNote(null);setActiveTab("all");}}
//             onFormDataChange={onFormDataChange}
//             onSubmit={async()=>{
//               setLoading(true);setError("");
//               try{
//                 const res = editingNote
//                   ? await updateNote(editingNote.id||editingNote._id!, formData)
//                   : await createNote(formData);
//                 if(res.success){
//                   setShowCreateForm(false);setEditingNote(null);
//                   setFormData({title:"",content:"",branch:"",semester:"",subject:"",file:null});
//                   setActiveTab("all");fetchNotesList();
//                 } else throw new Error(res.error||"Failed to save note");
//               }catch(e:any){setError(e.message);}finally{setLoading(false);}            }}
//             error={error}
//           />
//         );
//       case "summary":
//         return <ResultsSummary loading={loading} notesCount={notes.length} totalCount={pagination.total} />;
//       case "profile":
//         return (
//           <div className="space-y-4">
//             <h2 className="text-2xl font-semibold text-white">Profile</h2>
//             <div><span className="font-medium text-gray-300">Name: </span><span className="text-gray-100">{mockUser.name}</span></div>
//             <div><span className="font-medium text-gray-300">Email: </span><span className="text-gray-100">{mockUser.email}</span></div>
//           </div>
//         );
//       default: return null;
//     }
//   };

//   return (
//     <div className="flex min-h-screen bg-gray-900 text-gray-100">
//       <aside className="w-48 bg-gray-800 p-4 space-y-2">
//         {["all","create","summary","profile"].map(tab=>(
//           <button key={tab}
//             className={`block w-full text-left px-3 py-2 rounded ${activeTab===tab?"bg-gray-700":"hover:bg-gray-700"}`}
//             onClick={()=>{setActiveTab(tab as Tab);if(tab==="create")setShowCreateForm(true);}}
//           >{tab.charAt(0).toUpperCase()+tab.slice(1)}</button>
//         ))}
//         {activeTab==="all"&&selectedNotes.length>0&&(
//           <button className="mt-4 w-full bg-red-600 px-3 py-2 rounded hover:bg-red-500" onClick={handleBulkDelete}>
//             Delete {selectedNotes.length}
//           </button>
//         )}
//       </aside>
//       <main className="flex-1 p-6 overflow-y-auto">
     
//         <div className="mt-6">{renderTabContent()}</div>
//       </main>
//     </div>
//   );
// }

// "use client";

// import { useState, useEffect } from "react";
// import Header from "../components/Header";
// import SearchAndFilters from "../components/SearchAndFilters";
// import ResultsSummary from "../components/ResultsSummary";
// import NotesList from "../components/NotesList";
// import Pagination from "../components/Pagination";
// import CreateNoteModal from "../components/CreateNoteModal";
// import {
//   createNote,
//   fetchNotes,
//   deleteNote,
//   updateNote,
//   getNoteById,
//   bulkDeleteNotes,
// } from "../services/noteService";

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

// interface Filters {
//   branch: string;
//   semester: string;
//   subject: string;
//   search: string;
// }

// interface FormData {
//   title: string;
//   content: string;
//   branch: string;
//   semester: string;
//   subject: string;
//   file: File | null;
// }

// interface PaginationData {
//   page: number;
//   totalPages: number;
//   total: number;
// }

// export default function NotesDashboard() {
//   // data & state
//   const [notes, setNotes] = useState<Note[]>([]);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState("");
//   const [selectedNotes, setSelectedNotes] = useState<string[]>([]);
//   const [editingNote, setEditingNote] = useState<Note | null>(null);

//   const [filters, setFilters] = useState<Filters>({
//     branch: "",
//     semester: "",
//     subject: "",
//     search: "",
//   });
//   const [pagination, setPagination] = useState<PaginationData>({
//     page: 1,
//     totalPages: 1,
//     total: 0,
//   });

//   const [formData, setFormData] = useState<FormData>({
//     title: "",
//     content: "",
//     branch: "",
//     semester: "",
//     subject: "",
//     file: null,
//   });

//   // modal & tab state
//   const [showCreateForm, setShowCreateForm] = useState(false);
//   const [activeTab, setActiveTab] = useState<"all" | "create" | "summary">("all");

//   // fetch on filters or page change
//   useEffect(() => {
//     if (activeTab === "all") fetchList();
//   }, [filters, pagination.page, activeTab]);

//   // fetch list helper
//   const fetchList = async () => {
//     setLoading(true);
//     setError("");
//     try {
//       const res = await fetchNotes(filters, pagination.page, 10);
//       if (res.success) {
//         setNotes(res.notes || []);
//         setPagination((p) => ({
//           ...p,
//           totalPages: res.totalPages || 1,
//           total: res.total || 0,
//         }));
//       } else {
//         throw new Error(res.error || "Failed to fetch");
//       }
//     } catch (e: any) {
//       setError(e.message);
//       setNotes([]);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // bulk delete helper
//   const handleBulkDelete = async () => {
//     if (!selectedNotes.length) {
//       alert("Select notes first");
//       return;
//     }
//     if (!confirm(`Delete ${selectedNotes.length} notes?`)) return;
//     setLoading(true);
//     try {
//       const res = await bulkDeleteNotes(selectedNotes);
//       if (res.success) {
//         setSelectedNotes([]);
//         fetchList();
//       } else {
//         throw new Error(res.error);
//       }
//     } catch (e: any) {
//       setError(e.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // ...create/update/delete/edit handlers omitted for brevity,
//   //      they mirror your existing ones but always close the form
//   //      and reset activeTab back to "all" when done.

//   // form-data change
//   const onFormDataChange = (
//     key: keyof FormData,
//     value: string | File | null
//   ) => setFormData((f) => ({ ...f, [key]: value }));

//   // tab renderer
//   const renderTab = () => {
//     switch (activeTab) {
//       case "all":
//         return (
//           <>
//             <SearchAndFilters
//               filters={filters}
//               onFilterChange={(k, v) => {
//                 setFilters((f) => ({ ...f, [k]: v }));
//                 setPagination((p) => ({ ...p, page: 1 }));
//               }}
//               onClearFilters={() =>
//                 setFilters({ branch: "", semester: "", subject: "", search: "" })
//               }
//             />

//             {error && (
//               <div className="my-4 p-3 bg-red-700 text-red-100 rounded">
//                 {error}
//               </div>
//             )}

//             <ResultsSummary
//               loading={loading}
//               notesCount={notes.length}
//               totalCount={pagination.total}
//             />

//             <NotesList
//               notes={notes}
//               loading={loading}
//               selectedNotes={selectedNotes}
//               onSelectAll={() =>
//                 setSelectedNotes((s) =>
//                   s.length === notes.length ? [] : notes.map((n) => n.id || n._id || "")
//                 )
//               }
//               onSelectNote={(id) =>
//                 setSelectedNotes((s) =>
//                   s.includes(id) ? s.filter((x) => x !== id) : [...s, id]
//                 )
//               }
//               onEditNote={async (id) => {
//                 setLoading(true);
//                 const res = await getNoteById(id);
//                 setLoading(false);
//                 if (res.success && res.data) {
//                   setEditingNote(res.data);
//                   setFormData({
//                     title: res.data.title,
//                     content: res.data.content,
//                     branch: res.data.branch,
//                     semester: res.data.semester,
//                     subject: res.data.subject,
//                     file: null,
//                   });
//                   setShowCreateForm(true);
//                   setActiveTab("create");
//                 }
//               }}
//               onDeleteNote={async (id) => {
//                 if (confirm("Delete this note?")) {
//                   setLoading(true);
//                   const res = await deleteNote(id);
//                   setLoading(false);
//                   if (res.success) fetchList();
//                 }
//               }}
//             />

//             <Pagination
//               pagination={pagination}
//               onPageChange={(pg) => setPagination((p) => ({ ...p, page: pg }))}
//             />
//           </>
//         );

//       case "create":
//         return (
//           <CreateNoteModal
//             show={showCreateForm}
//             formData={formData}
//             isEditing={!!editingNote}
//             onClose={() => {
//               setShowCreateForm(false);
//               setEditingNote(null);
//               setActiveTab("all");
//             }}
//             onFormDataChange={onFormDataChange}
//             onSubmit={async () => {
//               setLoading(true);
//               const fn = editingNote ? updateNote : createNote;
//               const id = editingNote?.id || editingNote?._id || "";
//               const res = editingNote
//                 ? await fn(id, formData)
//                 : await fn(formData);
//               setLoading(false);
//               if (res.success) {
//                 setShowCreateForm(false);
//                 setEditingNote(null);
//                 setFormData({
//                   title: "",
//                   content: "",
//                   branch: "",
//                   semester: "",
//                   subject: "",
//                   file: null,
//                 });
//                 setActiveTab("all");
//                 fetchList();
//               } else {
//                 setError(res.error || "Failed");
//               }
//             }}
//             error={error}
//           />
//         );

//       case "summary":
//         return (
//           <ResultsSummary
//             loading={loading}
//             notesCount={notes.length}
//             totalCount={pagination.total}
//           />
//         );
//     }
//   };

//   return (
//     <div className="flex min-h-screen bg-gray-900 text-gray-100">
//       {/* Sidebar */}
//       <aside className="w-48 bg-gray-800 p-4 space-y-2">
//         <button
//           className={`block w-full text-left px-3 py-2 rounded ${
//             activeTab === "all" ? "bg-gray-700" : "hover:bg-gray-700"
//           }`}
//           onClick={() => {
//             setActiveTab("all");
//             setShowCreateForm(false);
//           }}
//         >
//           All Notes
//         </button>
//         <button
//           className={`block w-full text-left px-3 py-2 rounded ${
//             activeTab === "create" ? "bg-gray-700" : "hover:bg-gray-700"
//           }`}
//           onClick={() => {
//             setActiveTab("create");
//             setShowCreateForm(true);
//           }}
//         >
//           Create Note
//         </button>
//         <button
//           className={`block w-full text-left px-3 py-2 rounded ${
//             activeTab === "summary" ? "bg-gray-700" : "hover:bg-gray-700"
//           }`}
//           onClick={() => setActiveTab("summary")}
//         >
//           Summary
//         </button>

//         {activeTab === "all" && selectedNotes.length > 0 && (
//           <button
//             className="mt-4 w-full bg-red-600 px-3 py-2 rounded hover:bg-red-500"
//             onClick={handleBulkDelete}
//           >
//             Delete {selectedNotes.length}
//           </button>
//         )}
//       </aside>

//       {/* Main content */}
//       <main className="flex-1 p-6 overflow-y-auto">
//         <Header
//           onCreateNote={() => {
//             setActiveTab("create");
//             setShowCreateForm(true);
//           }}
//           selectedCount={selectedNotes.length}
//           onBulkDelete={handleBulkDelete}
//         />

//         {/* render the active tab */}
//         <div className="mt-6">{renderTab()}</div>
//       </main>
//     </div>
//   );
// }



// "use client";

// import { useState, useEffect } from 'react';
// import Header from '../components/Header';
// import SearchAndFilters from '../components/SearchAndFilters';
// import ResultsSummary from '../components/ResultsSummary';
// import NotesList from '../components/NotesList';
// import Pagination from '../components/Pagination';
// import CreateNoteModal from '../components/CreateNoteModal';

// // Define types for better type safety
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

// interface Filters {
//   branch: string;
//   semester: string;
//   subject: string;
//   search: string;
// }

// interface FormData {
//   title: string;
//   content: string;
//   branch: string;
//   semester: string;
//   subject: string;
//   file: File | null;
// }

// interface PaginationData {
//   page: number;
//   totalPages: number;
//   total: number;
// }

// export default function NotesDashboard() {
//   const [notes, setNotes] = useState<Note[]>([]);
//   const [loading, setLoading] = useState<boolean>(false);
//   const [showCreateForm, setShowCreateForm] = useState<boolean>(false);
//   const [filters, setFilters] = useState<Filters>({
//     branch: '',
//     semester: '',
//     subject: '',
//     search: ''
//   });
//   const [formData, setFormData] = useState<FormData>({
//     title: '',
//     content: '',
//     branch: '',
//     semester: '',
//     subject: '',
//     file: null
//   });
//   const [pagination, setPagination] = useState<PaginationData>({
//     page: 1,
//     totalPages: 1,
//     total: 0
//   });

//   useEffect(() => {
//     fetchNotes();
//   }, [filters, pagination.page]);

//   const fetchNotes = async (): Promise<void> => {
//     setLoading(true);
//     try {
//       const params = new URLSearchParams();
//       if (filters.branch) params.append('branch', filters.branch);
//       if (filters.semester) params.append('semester', filters.semester);
//       if (filters.subject) params.append('subject', filters.subject);
//       if (filters.search) params.append('search', filters.search);
//       params.append('page', pagination.page.toString());
//       params.append('limit', '10');

//       const response = await fetch(`/api/notes?${params}`);
//       const data = await response.json();

//       if (data.success) {
//         setNotes(data.notes || []);
//         setPagination(prev => ({
//           ...prev,
//           totalPages: data.totalPages || 1,
//           total: data.total || 0
//         }));
//       }
//     } catch (error) {
//       console.error('Failed to fetch notes:', error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleCreateNote = async (): Promise<void> => {
//     if (!formData.title || !formData.content || !formData.branch || !formData.semester || !formData.subject) {
//       alert('Please fill all required fields');
//       return;
//     }

//     try {
//       const submitData = new FormData();
//       submitData.append('title', formData.title);
//       submitData.append('content', formData.content);
//       submitData.append('branch', formData.branch);
//       submitData.append('semester', formData.semester);
//       submitData.append('subject', formData.subject);
//       if (formData.file) {
//         submitData.append('file', formData.file);
//       }

//       const response = await fetch('/api/notes', {
//         method: 'POST',
//         body: submitData,
//       });

//       const data = await response.json();
//       if (data.success) {
//         setShowCreateForm(false);
//         setFormData({
//           title: '',
//           content: '',
//           branch: '',
//           semester: '',
//           subject: '',
//           file: null
//         });
//         fetchNotes();
//       } else {
//         alert(data.error || 'Failed to create note');
//       }
//     } catch (error) {
//       console.error('Create note error:', error);
//       alert('Failed to create note');
//     }
//   };

//   const handleDeleteNote = async (noteId: string): Promise<void> => {
//     if (!confirm('Are you sure you want to delete this note?')) return;

//     try {
//       const response = await fetch(`/api/notes?id=${noteId}`, {
//         method: 'DELETE'
//       });

//       const data = await response.json();
//       if (data.success) {
//         fetchNotes();
//       } else {
//         alert(data.error || 'Failed to delete note');
//       }
//     } catch (error) {
//       console.error('Delete note error:', error);
//       alert('Failed to delete note');
//     }
//   };

//   const handleFilterChange = (key: keyof Filters, value: string): void => {
//     setFilters(prev => ({ ...prev, [key]: value }));
//     setPagination(prev => ({ ...prev, page: 1 }));
//   };

//   const clearFilters = () => {
//     setFilters({ branch: '', semester: '', subject: '', search: '' });
//     setPagination(prev => ({ ...prev, page: 1 }));
//   };

//   const handleFormDataChange = (key: keyof FormData, value: string | File | null): void => {
//     setFormData(prev => ({ ...prev, [key]: value }));
//   };

//   const handlePaginationChange = (page: number): void => {
//     setPagination(prev => ({ ...prev, page }));
//   };

//   return (
//     <div className="min-h-screen bg-gray-50">
//       <div className="p-4 sm:p-6 max-w-7xl mx-auto">
//         <Header onCreateNote={() => setShowCreateForm(true)} />
        
//         <SearchAndFilters
//           filters={filters}
//           onFilterChange={handleFilterChange}
//           onClearFilters={clearFilters}
//         />

//         <ResultsSummary
//           loading={loading}
//           notesCount={notes.length}
//           totalCount={pagination.total}
//         />

//         <NotesList
//           notes={notes}
//           loading={loading}
//           onDeleteNote={handleDeleteNote}
//         />

//         <Pagination
//           pagination={pagination}
//           onPageChange={handlePaginationChange}
//         />

//         <CreateNoteModal
//           show={showCreateForm}
//           formData={formData}
//           onClose={() => setShowCreateForm(false)}
//           onFormDataChange={handleFormDataChange}
//           onSubmit={handleCreateNote}
//         />
//       </div>
//     </div>
//   );
// }

// "use client";

// import { useState, useEffect } from 'react';
// import { Search, Plus, FileText, Trash2, Filter, X } from 'lucide-react';

// // Define types for better type safety
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

// interface Filters {
//   branch: string;
//   semester: string;
//   subject: string;
//   search: string;
// }

// interface FormData {
//   title: string;
//   content: string;
//   branch: string;
//   semester: string;
//   subject: string;
//   file: File | null;
// }

// interface Pagination {
//   page: number;
//   totalPages: number;
//   total: number;
// }

// export default function NotesDashboard() {
//   const [notes, setNotes] = useState<Note[]>([]);
//   const [loading, setLoading] = useState<boolean>(false);
//   const [showCreateForm, setShowCreateForm] = useState<boolean>(false);
//   const [showFilters, setShowFilters] = useState<boolean>(false);
//   const [filters, setFilters] = useState<Filters>({
//     branch: '',
//     semester: '',
//     subject: '',
//     search: ''
//   });
//   const [formData, setFormData] = useState<FormData>({
//     title: '',
//     content: '',
//     branch: '',
//     semester: '',
//     subject: '',
//     file: null
//   });
//   const [pagination, setPagination] = useState<Pagination>({
//     page: 1,
//     totalPages: 1,
//     total: 0
//   });

//   const branches = ['CSE', 'ECE', 'ME', 'CE', 'EE'];
//   const semesters = ['1', '2', '3', '4', '5', '6', '7', '8'];

//   useEffect(() => {
//     fetchNotes();
//   }, [filters, pagination.page]);

//   const fetchNotes = async (): Promise<void> => {
//     setLoading(true);
//     try {
//       const params = new URLSearchParams();
//       if (filters.branch) params.append('branch', filters.branch);
//       if (filters.semester) params.append('semester', filters.semester);
//       if (filters.subject) params.append('subject', filters.subject);
//       if (filters.search) params.append('search', filters.search);
//       params.append('page', pagination.page.toString());
//       params.append('limit', '10');

//       const response = await fetch(`/api/notes?${params}`);
//       const data = await response.json();

//       if (data.success) {
//         setNotes(data.notes || []);
//         setPagination(prev => ({
//           ...prev,
//           totalPages: data.totalPages || 1,
//           total: data.total || 0
//         }));
//       }
//     } catch (error) {
//       console.error('Failed to fetch notes:', error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleCreateNote = async (): Promise<void> => {
//     if (!formData.title || !formData.content || !formData.branch || !formData.semester || !formData.subject) {
//       alert('Please fill all required fields');
//       return;
//     }

//     try {
//       const submitData = new FormData();
//       submitData.append('title', formData.title);
//       submitData.append('content', formData.content);
//       submitData.append('branch', formData.branch);
//       submitData.append('semester', formData.semester);
//       submitData.append('subject', formData.subject);
//       if (formData.file) {
//         submitData.append('file', formData.file);
//       }

//       const response = await fetch('/api/notes', {
//         method: 'POST',
//         body: submitData,
//       });

//       const data = await response.json();
//       if (data.success) {
//         setShowCreateForm(false);
//         setFormData({
//           title: '',
//           content: '',
//           branch: '',
//           semester: '',
//           subject: '',
//           file: null
//         });
//         fetchNotes();
//       } else {
//         alert(data.error || 'Failed to create note');
//       }
//     } catch (error) {
//       console.error('Create note error:', error);
//       alert('Failed to create note');
//     }
//   };

//   const handleDeleteNote = async (noteId: string): Promise<void> => {
//     if (!confirm('Are you sure you want to delete this note?')) return;

//     try {
//       const response = await fetch(`/api/notes?id=${noteId}`, {
//         method: 'DELETE'
//       });

//       const data = await response.json();
//       if (data.success) {
//         fetchNotes();
//       } else {
//         alert(data.error || 'Failed to delete note');
//       }
//     } catch (error) {
//       console.error('Delete note error:', error);
//       alert('Failed to delete note');
//     }
//   };

//   const handleFilterChange = (key: keyof Filters, value: string): void => {
//     setFilters(prev => ({ ...prev, [key]: value }));
//     setPagination(prev => ({ ...prev, page: 1 }));
//   };

//   const clearFilters = () => {
//     setFilters({ branch: '', semester: '', subject: '', search: '' });
//     setPagination(prev => ({ ...prev, page: 1 }));
//   };

//   const hasActiveFilters = filters.branch || filters.semester || filters.subject || filters.search;

//   return (
//     <div className="min-h-screen bg-gray-50">
//       <div className="p-4 sm:p-6 max-w-7xl mx-auto">
//         {/* Header */}
//         <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
//           <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
//             <div>
//               <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Notes Dashboard</h1>
//               <p className="text-gray-600 mt-1">Manage and organize your study notes</p>
//             </div>
//             <button
//               onClick={() => setShowCreateForm(true)}
//               className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 hover:bg-blue-700 transition-colors duration-200 shadow-sm"
//             >
//               <Plus size={20} />
//               Create Note
//             </button>
//           </div>
//         </div>

//         {/* Search and Filters */}
//         <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
//           {/* Search Bar - Always Visible */}
//           <div className="relative mb-4">
//             <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
//             <input
//               type="text"
//               placeholder="Search notes by title or content..."
//               value={filters.search}
//               onChange={(e) => handleFilterChange('search', e.target.value)}
//               className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
//             />
//           </div>

//           {/* Filter Toggle */}
//           <div className="flex items-center justify-between">
//             <button
//               onClick={() => setShowFilters(!showFilters)}
//               className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors duration-200"
//             >
//               <Filter size={18} />
//               {showFilters ? 'Hide Filters' : 'Show Filters'}
//               {hasActiveFilters && (
//                 <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
//                   Active
//                 </span>
//               )}
//             </button>
            
//             {hasActiveFilters && (
//               <button
//                 onClick={clearFilters}
//                 className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1"
//               >
//                 <X size={16} />
//                 Clear All
//               </button>
//             )}
//           </div>

//           {/* Filters Panel */}
//           {showFilters && (
//             <div className="mt-4 pt-4 border-t border-gray-200">
//               <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-2">Branch</label>
//                   <select
//                     value={filters.branch}
//                     onChange={(e) => handleFilterChange('branch', e.target.value)}
//                     className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
//                   >
//                     <option value="">All Branches</option>
//                     {branches.map(branch => (
//                       <option key={branch} value={branch}>{branch}</option>
//                     ))}
//                   </select>
//                 </div>
                
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-2">Semester</label>
//                   <select
//                     value={filters.semester}
//                     onChange={(e) => handleFilterChange('semester', e.target.value)}
//                     className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
//                   >
//                     <option value="">All Semesters</option>
//                     {semesters.map(sem => (
//                       <option key={sem} value={sem}>Semester {sem}</option>
//                     ))}
//                   </select>
//                 </div>
                
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
//                   <input
//                     type="text"
//                     placeholder="Filter by subject..."
//                     value={filters.subject}
//                     onChange={(e) => handleFilterChange('subject', e.target.value)}
//                     className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
//                   />
//                 </div>
//               </div>
//             </div>
//           )}
//         </div>

//         {/* Results Summary */}
//         {!loading && (
//           <div className="mb-4 text-sm text-gray-600">
//             {pagination.total > 0 ? (
//               <span>Showing {notes.length} of {pagination.total} notes</span>
//             ) : (
//               <span>No notes found</span>
//             )}
//           </div>
//         )}

//         {/* Notes List */}
//         <div className="space-y-4">
//           {loading ? (
//             <div className="bg-white rounded-lg shadow-sm p-12 text-center">
//               <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
//               <p className="text-gray-500">Loading notes...</p>
//             </div>
//           ) : notes.length === 0 ? (
//             <div className="bg-white rounded-lg shadow-sm p-12 text-center">
//               <div className="text-gray-400 mb-4">
//                 <FileText size={48} className="mx-auto" />
//               </div>
//               <p className="text-gray-500 text-lg">No notes found</p>
//               <p className="text-gray-400 mt-2">Try adjusting your search or filters, or create a new note.</p>
//             </div>
//           ) : (
//             notes.map((note) => (
//               <div key={note.id || note._id} className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200">
//                 <div className="p-6">
//                   <div className="flex justify-between items-start">
//                     <div className="flex-1 mr-4">
//                       <h3 className="text-xl font-semibold text-gray-900 mb-2">{note.title}</h3>
//                       <p className="text-gray-600 mb-4 line-clamp-3">{note.content}</p>
                      
//                       <div className="flex flex-wrap gap-2 mb-3">
//                         <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">
//                           {note.branch}
//                         </span>
//                         <span className="bg-green-50 text-green-700 px-3 py-1 rounded-full text-sm font-medium">
//                           Semester {note.semester}
//                         </span>
//                         <span className="bg-purple-50 text-purple-700 px-3 py-1 rounded-full text-sm font-medium">
//                           {note.subject}
//                         </span>
//                       </div>
                      
//                       {note.fileUrl && (
//                         <div className="mt-3">
//                           <a
//                             href={note.fileUrl}
//                             target="_blank"
//                             rel="noopener noreferrer"
//                             className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 transition-colors duration-200"
//                           >
//                             <FileText size={16} />
//                             <span className="text-sm font-medium">
//                               {note.fileName || 'View Attachment'}
//                             </span>
//                           </a>
//                         </div>
//                       )}
//                     </div>
                    
//                     <div className="flex gap-2">
//                       <button
//                         onClick={() => handleDeleteNote(note.id || note._id || '')}
//                         className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
//                         title="Delete note"
//                       >
//                         <Trash2 size={18} />
//                       </button>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             ))
//           )}
//         </div>

//         {/* Pagination */}
//         {pagination.totalPages > 1 && (
//           <div className="flex justify-center items-center gap-4 mt-8">
//             <button
//               onClick={() => setPagination(prev => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
//               disabled={pagination.page === 1}
//               className="px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:hover:bg-white transition-colors duration-200"
//             >
//               Previous
//             </button>
            
//             <span className="px-4 py-2 text-gray-600">
//               Page {pagination.page} of {pagination.totalPages}
//             </span>
            
//             <button
//               onClick={() => setPagination(prev => ({ ...prev, page: Math.min(prev.totalPages, prev.page + 1) }))}
//               disabled={pagination.page === pagination.totalPages}
//               className="px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:hover:bg-white transition-colors duration-200"
//             >
//               Next
//             </button>
//           </div>
//         )}

//         {/* Create Note Modal */}
//         {showCreateForm && (
//           <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
//             <div className="bg-white rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
//               <div className="p-6">
//                 <div className="flex justify-between items-center mb-6">
//                   <h2 className="text-xl font-bold text-gray-900">Create New Note</h2>
//                   <button
//                     onClick={() => setShowCreateForm(false)}
//                     className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
//                   >
//                     <X size={24} />
//                   </button>
//                 </div>
                
//                 <div className="space-y-4">
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-2">Title *</label>
//                     <input
//                       type="text"
//                       placeholder="Enter note title"
//                       value={formData.title}
//                       onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
//                       className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
//                     />
//                   </div>
                  
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-2">Content *</label>
//                     <textarea
//                       placeholder="Enter note content"
//                       value={formData.content}
//                       onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
//                       rows={4}
//                       className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
//                     />
//                   </div>
                  
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-2">Branch *</label>
//                     <select
//                       value={formData.branch}
//                       onChange={(e) => setFormData(prev => ({ ...prev, branch: e.target.value }))}
//                       className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
//                     >
//                       <option value="">Select Branch</option>
//                       {branches.map(branch => (
//                         <option key={branch} value={branch}>{branch}</option>
//                       ))}
//                     </select>
//                   </div>
                  
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-2">Semester *</label>
//                     <select
//                       value={formData.semester}
//                       onChange={(e) => setFormData(prev => ({ ...prev, semester: e.target.value }))}
//                       className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
//                     >
//                       <option value="">Select Semester</option>
//                       {semesters.map(sem => (
//                         <option key={sem} value={sem}>Semester {sem}</option>
//                       ))}
//                     </select>
//                   </div>
                  
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-2">Subject *</label>
//                     <input
//                       type="text"
//                       placeholder="Enter subject name"
//                       value={formData.subject}
//                       onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
//                       className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
//                     />
//                   </div>
                  
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-2">Attachment (Optional)</label>
//                     <input
//                       type="file"
//                       onChange={(e) => setFormData(prev => ({ ...prev, file: e.target.files?.[0] || null }))}
//                       className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
//                     />
//                   </div>
//                 </div>
                
//                 <div className="flex gap-3 mt-6">
//                   <button
//                     onClick={handleCreateNote}
//                     className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium"
//                   >
//                     Create Note
//                   </button>
//                   <button
//                     onClick={() => setShowCreateForm(false)}
//                     className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors duration-200 font-medium"
//                   >
//                     Cancel
//                   </button>
//                 </div>
//               </div>
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }
