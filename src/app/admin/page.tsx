"use client";
import { useAuth } from "../../hooks/auth";
import { useState , useEffect} from "react";

interface OrganizationFormData {
  name: string;
  description: string;
  location: string;
  contactEmail: string;
}

type AdminTab = "profile" | "add-organization";

function OrganizationList() {
  const [organizations, setOrganizations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchOrgs = async () => {
      try {
        const res = await fetch("/api/organizations");
        const data = await res.json();

        if (data.success) {
          setOrganizations(data.organizations || []);
        } else {
          throw new Error(data.error || "Failed to fetch organizations");
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchOrgs();
  }, []);

  if (loading) return <p className="text-gray-400 font-mono text-sm">[ LOADING ORGANIZATIONS... ]</p>;
  if (error) return <p className="text-red-400 font-mono text-sm">[ ERROR: {error} ]</p>;
  if (organizations.length === 0) return <p className="text-gray-500 font-mono text-sm">[ NO ORGANIZATIONS FOUND ]</p>;

  return (
    <div className="space-y-3">
      {organizations.map((org, idx) => (
        <div key={idx} className="bg-black border border-gray-800 rounded-sm p-4 hover:border-gray-700 transition-colors">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h4 className="text-white font-mono text-base font-medium tracking-wide">{org.name}</h4>
              <p className="text-gray-400 text-sm mt-1 leading-relaxed">{org.description}</p>
              <div className="flex items-center gap-6 mt-3 text-xs text-gray-500 font-mono">
                <span>LOCATION: {org.location}</span>
                <span>CONTACT: {org.contactEmail}</span>
              </div>
            </div>
            <div className="text-xs text-gray-600 font-mono">#{idx.toString().padStart(3, '0')}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function AdminDashboard() {
  const user = useAuth(["admin"]);
  const [activeTab, setActiveTab] = useState<AdminTab>("profile");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [notification, setNotification] = useState<string | null>(null);
  const [orgFormData, setOrgFormData] = useState<OrganizationFormData>({
    name: "",
    description: "",
    location: "",
    contactEmail: ""
  });

  if (!user) return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="text-center">
        <div className="text-white font-mono text-sm mb-2">[ SYSTEM AUTHENTICATION ]</div>
        <div className="text-gray-400 font-mono text-xs">VERIFYING CREDENTIALS...</div>
      </div>
    </div>
  );

  const handleCreateOrganization = async () => {
    setLoading(true);
    setError("");
    try {
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
        setNotification("ORGANIZATION.CREATED");
        setTimeout(() => setNotification(null), 4000);
      } else {
        throw new Error(result.error || "Failed to create organization");
      }
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const onOrgFormDataChange = (key: keyof OrganizationFormData, value: string) => {
    setOrgFormData(f => ({ ...f, [key]: value }));
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "profile":
        return (
          <div className="space-y-8">
            <div className="border-b border-gray-800 pb-4">
              <h2 className="text-2xl font-mono font-bold text-white tracking-wider">ADMINISTRATOR.PROFILE</h2>
              <div className="text-xs text-gray-500 font-mono mt-1">SYSTEM ACCESS LEVEL: ELEVATED</div>
            </div>
            
            <div className="bg-black border border-gray-800 rounded-sm p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    <span className="text-white font-mono text-sm tracking-wide">AUTHENTICATED SESSION</span>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex flex-col">
                      <span className="text-xs text-gray-500 font-mono tracking-wider">USER.NAME</span>
                      <span className="text-white font-mono text-sm">{user.name || "ADMIN_USER"}</span>
                    </div>
                    
                    <div className="flex flex-col">
                      <span className="text-xs text-gray-500 font-mono tracking-wider">USER.EMAIL</span>
                      <span className="text-white font-mono text-sm">{user.email}</span>
                    </div>
                    
                    <div className="flex flex-col">
                      <span className="text-xs text-gray-500 font-mono tracking-wider">ACCESS.ROLE</span>
                      <span className="text-green-400 font-mono text-sm font-medium">{user.role.toUpperCase()}</span>
                    </div>
                    
                    {user.organization && (
                      <div className="flex flex-col">
                        <span className="text-xs text-gray-500 font-mono tracking-wider">ORGANIZATION</span>
                        <span className="text-white font-mono text-sm">{user.organization}</span>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="text-xs text-gray-500 font-mono tracking-wider">SESSION.INFO</div>
                  <div className="space-y-2 text-xs font-mono">
                    <div className="flex justify-between">
                      <span className="text-gray-400">LOGIN.STATUS</span>
                      <span className="text-green-400">ACTIVE</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">LAST.ACCESS</span>
                      <span className="text-gray-300">{new Date().toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">PERMISSIONS</span>
                      <span className="text-yellow-400">FULL_ACCESS</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-black border border-gray-800 rounded-sm p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="text-xs text-gray-500 font-mono tracking-wider">ORGANIZATIONS.DATABASE</div>
                <div className="flex-1 h-px bg-gray-800"></div>
              </div>
              <OrganizationList />
            </div>
          </div>
        );

      case "add-organization":
        return (
          <div className="space-y-8">
            <div className="border-b border-gray-800 pb-4">
              <h2 className="text-2xl font-mono font-bold text-white tracking-wider">CREATE.ORGANIZATION</h2>
              <div className="text-xs text-gray-500 font-mono mt-1">SYSTEM ENTITY REGISTRATION</div>
            </div>
            
            {error && (
              <div className="bg-red-950 border border-red-800 rounded-sm p-4">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                  <span className="text-red-300 font-mono text-sm">ERROR: {error}</span>
                </div>
              </div>
            )}
            
            <div className="bg-black border border-gray-800 rounded-sm p-6">
              <form onSubmit={(e) => { e.preventDefault(); handleCreateOrganization(); }} className="space-y-6">
                <div>
                  <label className="block text-xs text-gray-500 font-mono tracking-wider mb-2">
                    ORGANIZATION.NAME *
                  </label>
                  <input
                    type="text"
                    value={orgFormData.name}
                    onChange={(e) => onOrgFormDataChange("name", e.target.value)}
                    className="w-full p-3 bg-black text-white border border-gray-800 rounded-sm focus:border-green-500 focus:outline-none transition-colors font-mono text-sm"
                    placeholder="Enter organization identifier"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-xs text-gray-500 font-mono tracking-wider mb-2">
                    DESCRIPTION *
                  </label>
                  <textarea
                    value={orgFormData.description}
                    onChange={(e) => onOrgFormDataChange("description", e.target.value)}
                    className="w-full p-3 bg-black text-white border border-gray-800 rounded-sm focus:border-green-500 focus:outline-none transition-colors font-mono text-sm resize-none"
                    rows={4}
                    placeholder="Enter organizational purpose and scope"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-xs text-gray-500 font-mono tracking-wider mb-2">
                    LOCATION.ADDRESS *
                  </label>
                  <input
                    type="text"
                    value={orgFormData.location}
                    onChange={(e) => onOrgFormDataChange("location", e.target.value)}
                    className="w-full p-3 bg-black text-white border border-gray-800 rounded-sm focus:border-green-500 focus:outline-none transition-colors font-mono text-sm"
                    placeholder="Enter geographical coordinates"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-xs text-gray-500 font-mono tracking-wider mb-2">
                    CONTACT.EMAIL *
                  </label>
                  <input
                    type="email"
                    value={orgFormData.contactEmail}
                    onChange={(e) => onOrgFormDataChange("contactEmail", e.target.value)}
                    className="w-full p-3 bg-black text-white border border-gray-800 rounded-sm focus:border-green-500 focus:outline-none transition-colors font-mono text-sm"
                    placeholder="Enter primary communication endpoint"
                    required
                  />
                </div>
                
                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className="bg-green-700 hover:bg-green-600 disabled:bg-gray-800 disabled:cursor-not-allowed px-6 py-3 rounded-sm text-white font-mono text-sm tracking-wide transition-colors border border-green-600 disabled:border-gray-700"
                  >
                    {loading ? "[ PROCESSING... ]" : "[ CREATE.ENTITY ]"}
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => {
                      setOrgFormData({ name: "", description: "", location: "", contactEmail: "" });
                      setError("");
                      setActiveTab("profile");
                    }}
                    className="bg-gray-800 hover:bg-gray-700 px-6 py-3 rounded-sm text-white font-mono text-sm tracking-wide transition-colors border border-gray-700"
                  >
                    [ CANCEL.OPERATION ]
                  </button>
                </div>
              </form>
            </div>

            <div className="bg-black border border-gray-800 rounded-sm p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="text-xs text-gray-500 font-mono tracking-wider">SYSTEM.REQUIREMENTS</div>
                <div className="flex-1 h-px bg-gray-800"></div>
              </div>
              <div className="space-y-2 text-xs text-gray-400 font-mono">
                <div>• ORGANIZATION.NAME must be unique within database</div>
                <div>• DESCRIPTION should define primary operational scope</div>
                <div>• LOCATION requires city and country specification</div>
                <div>• CONTACT.EMAIL will be used for system communications</div>
              </div>
            </div>
          </div>
        );

      default:
        return <div className="text-gray-500 font-mono text-sm">[ SELECT OPERATION MODULE ]</div>;
    }
  };

  const getTabLabel = (tab: AdminTab) => {
    switch (tab) {
      case "add-organization": return "CREATE.ORG";
      case "profile": return "PROFILE.SYS";
      default: {
        const tabStr = tab as string;
        return tabStr.toUpperCase().replace('-', '.');
      }
    }
  };

  return (
    <div className="flex min-h-screen bg-black text-gray-100 font-mono relative">
      {/* Technical Notification */}
      {notification && (
        <div className="fixed top-6 right-6 z-50 animate-pulse">
          <div className="bg-black border border-green-500 rounded-sm p-4 shadow-lg min-w-72">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <div className="flex-1">
                <div className="text-xs text-gray-400 font-mono tracking-wider">SYSTEM.NOTIFICATION</div>
                <div className="text-green-400 font-mono text-sm font-medium mt-1">
                  [ {notification} ]
                </div>
                <div className="text-xs text-gray-500 font-mono mt-1">
                  STATUS: SUCCESS | TIME: {new Date().toLocaleTimeString()}
                </div>
              </div>
              <button 
                onClick={() => setNotification(null)}
                className="text-gray-500 hover:text-white text-xs font-mono"
              >
                [X]
              </button>
            </div>
          </div>
        </div>
      )}
      
      <aside className="w-80 bg-black border-r border-gray-800 p-6">
        <div className="mb-8 p-4 bg-black border border-gray-800 rounded-sm">
          <div className="text-xs text-gray-500 tracking-wider mb-2">AUTHENTICATED.USER</div>
          <div className="text-white text-sm font-medium">{user.name || "ADMIN_USER"}</div>
          <div className="text-xs text-green-400 mt-1 tracking-wide">{user.role.toUpperCase()}</div>
          <div className="flex items-center gap-2 mt-3">
            <div className="w-1.5 h-1.5 bg-green-400 rounded-full"></div>
            <div className="text-xs text-gray-400">ONLINE</div>
          </div>
        </div>
        
        <div className="space-y-1 mb-8">
          <div className="text-xs text-gray-500 tracking-wider mb-3">SYSTEM.MODULES</div>
          {(["profile", "add-organization"] as AdminTab[]).map(tab => (
            <button 
              key={tab}
              className={`block w-full text-left px-4 py-3 rounded-sm transition-colors text-sm font-mono tracking-wide ${
                activeTab === tab 
                  ? "bg-gray-900 text-white border border-gray-700" 
                  : "hover:bg-gray-900 text-gray-400 hover:text-white border border-transparent hover:border-gray-800"
              }`}
              onClick={() => setActiveTab(tab)}
            >
              {getTabLabel(tab)}
            </button>
          ))}
        </div>
        
        <div className="space-y-3">
          <div className="text-xs text-gray-500 tracking-wider">SYSTEM.CONTROL</div>
          <button 
            onClick={() => {
              localStorage.removeItem("token");
              localStorage.removeItem("user");
              window.location.href = "/login";
            }}
            className="w-full bg-red-900 hover:bg-red-800 px-4 py-3 rounded-sm text-white font-mono text-sm tracking-wide transition-colors border border-red-700"
          >
            [ TERMINATE.SESSION ]
          </button>
        </div>
      </aside>
      
      <main className="flex-1 p-8 overflow-y-auto bg-black">
        {renderTabContent()}
      </main>
    </div>
  );
}

// "use client";
// import { useAuth } from "../../hooks/auth";
// import { useState , useEffect} from "react";

// interface OrganizationFormData {
//   name: string;
//   description: string;
//   location: string;
//   contactEmail: string;
// }

// type AdminTab = "profile" | "add-organization";

// function OrganizationList() {
//   const [organizations, setOrganizations] = useState<any[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");

//   useEffect(() => {
//     const fetchOrgs = async () => {
//       try {
//         const res = await fetch("/api/organizations");
//         const data = await res.json();

//         if (data.success) {
//           setOrganizations(data.organizations || []);
//         } else {
//           throw new Error(data.error || "Failed to fetch organizations");
//         }
//       } catch (err: any) {
//         setError(err.message);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchOrgs();
//   }, []);

//   if (loading) return <p className="text-gray-400 font-mono text-sm">[ LOADING ORGANIZATIONS... ]</p>;
//   if (error) return <p className="text-red-400 font-mono text-sm">[ ERROR: {error} ]</p>;
//   if (organizations.length === 0) return <p className="text-gray-500 font-mono text-sm">[ NO ORGANIZATIONS FOUND ]</p>;

//   return (
//     <div className="space-y-3">
//       {organizations.map((org, idx) => (
//         <div key={idx} className="bg-black border border-gray-800 rounded-sm p-4 hover:border-gray-700 transition-colors">
//           <div className="flex items-start justify-between">
//             <div className="flex-1">
//               <h4 className="text-white font-mono text-base font-medium tracking-wide">{org.name}</h4>
//               <p className="text-gray-400 text-sm mt-1 leading-relaxed">{org.description}</p>
//               <div className="flex items-center gap-6 mt-3 text-xs text-gray-500 font-mono">
//                 <span>LOCATION: {org.location}</span>
//                 <span>CONTACT: {org.contactEmail}</span>
//               </div>
//             </div>
//             <div className="text-xs text-gray-600 font-mono">#{idx.toString().padStart(3, '0')}</div>
//           </div>
//         </div>
//       ))}
//     </div>
//   );
// }

// export default function AdminDashboard() {
//   const user = useAuth(["admin"]);
//   const [activeTab, setActiveTab] = useState<AdminTab>("profile");
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState("");
//   const [orgFormData, setOrgFormData] = useState<OrganizationFormData>({
//     name: "",
//     description: "",
//     location: "",
//     contactEmail: ""
//   });

//   if (!user) return (
//     <div className="min-h-screen bg-black flex items-center justify-center">
//       <div className="text-center">
//         <div className="text-white font-mono text-sm mb-2">[ SYSTEM AUTHENTICATION ]</div>
//         <div className="text-gray-400 font-mono text-xs">VERIFYING CREDENTIALS...</div>
//       </div>
//     </div>
//   );

//   const handleCreateOrganization = async () => {
//     setLoading(true);
//     setError("");
//     try {
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
//         alert("[ ORGANIZATION CREATED SUCCESSFULLY ]");
//       } else {
//         throw new Error(result.error || "Failed to create organization");
//       }
//     } catch (e: any) {
//       setError(e.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const onOrgFormDataChange = (key: keyof OrganizationFormData, value: string) => {
//     setOrgFormData(f => ({ ...f, [key]: value }));
//   };

//   const renderTabContent = () => {
//     switch (activeTab) {
//       case "profile":
//         return (
//           <div className="space-y-8">
//             <div className="border-b border-gray-800 pb-4">
//               <h2 className="text-2xl font-mono font-bold text-white tracking-wider">ADMINISTRATOR.PROFILE</h2>
//               <div className="text-xs text-gray-500 font-mono mt-1">SYSTEM ACCESS LEVEL: ELEVATED</div>
//             </div>
            
//             <div className="bg-black border border-gray-800 rounded-sm p-6">
//               <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
//                 <div className="space-y-4">
//                   <div className="flex items-center gap-3 mb-6">
//                     <div className="w-2 h-2 bg-green-400 rounded-full"></div>
//                     <span className="text-white font-mono text-sm tracking-wide">AUTHENTICATED SESSION</span>
//                   </div>
                  
//                   <div className="space-y-3">
//                     <div className="flex flex-col">
//                       <span className="text-xs text-gray-500 font-mono tracking-wider">USER.NAME</span>
//                       <span className="text-white font-mono text-sm">{user.name || "ADMIN_USER"}</span>
//                     </div>
                    
//                     <div className="flex flex-col">
//                       <span className="text-xs text-gray-500 font-mono tracking-wider">USER.EMAIL</span>
//                       <span className="text-white font-mono text-sm">{user.email}</span>
//                     </div>
                    
//                     <div className="flex flex-col">
//                       <span className="text-xs text-gray-500 font-mono tracking-wider">ACCESS.ROLE</span>
//                       <span className="text-green-400 font-mono text-sm font-medium">{user.role.toUpperCase()}</span>
//                     </div>
                    
//                     {user.organization && (
//                       <div className="flex flex-col">
//                         <span className="text-xs text-gray-500 font-mono tracking-wider">ORGANIZATION</span>
//                         <span className="text-white font-mono text-sm">{user.organization}</span>
//                       </div>
//                     )}
//                   </div>
//                 </div>
                
//                 <div className="space-y-4">
//                   <div className="text-xs text-gray-500 font-mono tracking-wider">SESSION.INFO</div>
//                   <div className="space-y-2 text-xs font-mono">
//                     <div className="flex justify-between">
//                       <span className="text-gray-400">LOGIN.STATUS</span>
//                       <span className="text-green-400">ACTIVE</span>
//                     </div>
//                     <div className="flex justify-between">
//                       <span className="text-gray-400">LAST.ACCESS</span>
//                       <span className="text-gray-300">{new Date().toLocaleString()}</span>
//                     </div>
//                     <div className="flex justify-between">
//                       <span className="text-gray-400">PERMISSIONS</span>
//                       <span className="text-yellow-400">FULL_ACCESS</span>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             </div>
            
//             <div className="bg-black border border-gray-800 rounded-sm p-6">
//               <div className="flex items-center gap-3 mb-4">
//                 <div className="text-xs text-gray-500 font-mono tracking-wider">ORGANIZATIONS.DATABASE</div>
//                 <div className="flex-1 h-px bg-gray-800"></div>
//               </div>
//               <OrganizationList />
//             </div>
//           </div>
//         );

//       case "add-organization":
//         return (
//           <div className="space-y-8">
//             <div className="border-b border-gray-800 pb-4">
//               <h2 className="text-2xl font-mono font-bold text-white tracking-wider">CREATE.ORGANIZATION</h2>
//               <div className="text-xs text-gray-500 font-mono mt-1">SYSTEM ENTITY REGISTRATION</div>
//             </div>
            
//             {error && (
//               <div className="bg-red-950 border border-red-800 rounded-sm p-4">
//                 <div className="flex items-center gap-3">
//                   <div className="w-2 h-2 bg-red-400 rounded-full"></div>
//                   <span className="text-red-300 font-mono text-sm">ERROR: {error}</span>
//                 </div>
//               </div>
//             )}
            
//             <div className="bg-black border border-gray-800 rounded-sm p-6">
//               <form onSubmit={(e) => { e.preventDefault(); handleCreateOrganization(); }} className="space-y-6">
//                 <div>
//                   <label className="block text-xs text-gray-500 font-mono tracking-wider mb-2">
//                     ORGANIZATION.NAME *
//                   </label>
//                   <input
//                     type="text"
//                     value={orgFormData.name}
//                     onChange={(e) => onOrgFormDataChange("name", e.target.value)}
//                     className="w-full p-3 bg-black text-white border border-gray-800 rounded-sm focus:border-green-500 focus:outline-none transition-colors font-mono text-sm"
//                     placeholder="Enter organization identifier"
//                     required
//                   />
//                 </div>
                
//                 <div>
//                   <label className="block text-xs text-gray-500 font-mono tracking-wider mb-2">
//                     DESCRIPTION *
//                   </label>
//                   <textarea
//                     value={orgFormData.description}
//                     onChange={(e) => onOrgFormDataChange("description", e.target.value)}
//                     className="w-full p-3 bg-black text-white border border-gray-800 rounded-sm focus:border-green-500 focus:outline-none transition-colors font-mono text-sm resize-none"
//                     rows={4}
//                     placeholder="Enter organizational purpose and scope"
//                     required
//                   />
//                 </div>
                
//                 <div>
//                   <label className="block text-xs text-gray-500 font-mono tracking-wider mb-2">
//                     LOCATION.ADDRESS *
//                   </label>
//                   <input
//                     type="text"
//                     value={orgFormData.location}
//                     onChange={(e) => onOrgFormDataChange("location", e.target.value)}
//                     className="w-full p-3 bg-black text-white border border-gray-800 rounded-sm focus:border-green-500 focus:outline-none transition-colors font-mono text-sm"
//                     placeholder="Enter geographical coordinates"
//                     required
//                   />
//                 </div>
                
//                 <div>
//                   <label className="block text-xs text-gray-500 font-mono tracking-wider mb-2">
//                     CONTACT.EMAIL *
//                   </label>
//                   <input
//                     type="email"
//                     value={orgFormData.contactEmail}
//                     onChange={(e) => onOrgFormDataChange("contactEmail", e.target.value)}
//                     className="w-full p-3 bg-black text-white border border-gray-800 rounded-sm focus:border-green-500 focus:outline-none transition-colors font-mono text-sm"
//                     placeholder="Enter primary communication endpoint"
//                     required
//                   />
//                 </div>
                
//                 <div className="flex gap-3 pt-4">
//                   <button
//                     type="submit"
//                     disabled={loading}
//                     className="bg-green-700 hover:bg-green-600 disabled:bg-gray-800 disabled:cursor-not-allowed px-6 py-3 rounded-sm text-white font-mono text-sm tracking-wide transition-colors border border-green-600 disabled:border-gray-700"
//                   >
//                     {loading ? "[ PROCESSING... ]" : "[ CREATE.ENTITY ]"}
//                   </button>
                  
//                   <button
//                     type="button"
//                     onClick={() => {
//                       setOrgFormData({ name: "", description: "", location: "", contactEmail: "" });
//                       setError("");
//                       setActiveTab("profile");
//                     }}
//                     className="bg-gray-800 hover:bg-gray-700 px-6 py-3 rounded-sm text-white font-mono text-sm tracking-wide transition-colors border border-gray-700"
//                   >
//                     [ CANCEL.OPERATION ]
//                   </button>
//                 </div>
//               </form>
//             </div>

//             <div className="bg-black border border-gray-800 rounded-sm p-6">
//               <div className="flex items-center gap-3 mb-4">
//                 <div className="text-xs text-gray-500 font-mono tracking-wider">SYSTEM.REQUIREMENTS</div>
//                 <div className="flex-1 h-px bg-gray-800"></div>
//               </div>
//               <div className="space-y-2 text-xs text-gray-400 font-mono">
//                 <div>• ORGANIZATION.NAME must be unique within database</div>
//                 <div>• DESCRIPTION should define primary operational scope</div>
//                 <div>• LOCATION requires city and country specification</div>
//                 <div>• CONTACT.EMAIL will be used for system communications</div>
//               </div>
//             </div>
//           </div>
//         );

//       default:
//         return <div className="text-gray-500 font-mono text-sm">[ SELECT OPERATION MODULE ]</div>;
//     }
//   };

//   const getTabLabel = (tab: AdminTab) => {
//     switch (tab) {
//       case "add-organization": return "CREATE.ORG";
//       case "profile": return "PROFILE.SYS";
//       default: {
//         const tabStr = tab as string;
//         return tabStr.toUpperCase().replace('-', '.');
//       }
//     }
//   };

//   return (
//     <div className="flex min-h-screen bg-black text-gray-100 font-mono">
//       <aside className="w-80 bg-black border-r border-gray-800 p-6">
//         <div className="mb-8 p-4 bg-black border border-gray-800 rounded-sm">
//           <div className="text-xs text-gray-500 tracking-wider mb-2">AUTHENTICATED.USER</div>
//           <div className="text-white text-sm font-medium">{user.name || "ADMIN_USER"}</div>
//           <div className="text-xs text-green-400 mt-1 tracking-wide">{user.role.toUpperCase()}</div>
//           <div className="flex items-center gap-2 mt-3">
//             <div className="w-1.5 h-1.5 bg-green-400 rounded-full"></div>
//             <div className="text-xs text-gray-400">ONLINE</div>
//           </div>
//         </div>
        
//         <div className="space-y-1 mb-8">
//           <div className="text-xs text-gray-500 tracking-wider mb-3">SYSTEM.MODULES</div>
//           {(["profile", "add-organization"] as AdminTab[]).map(tab => (
//             <button 
//               key={tab}
//               className={`block w-full text-left px-4 py-3 rounded-sm transition-colors text-sm font-mono tracking-wide ${
//                 activeTab === tab 
//                   ? "bg-gray-900 text-white border border-gray-700" 
//                   : "hover:bg-gray-900 text-gray-400 hover:text-white border border-transparent hover:border-gray-800"
//               }`}
//               onClick={() => setActiveTab(tab)}
//             >
//               {getTabLabel(tab)}
//             </button>
//           ))}
//         </div>
        
//         <div className="space-y-3">
//           <div className="text-xs text-gray-500 tracking-wider">SYSTEM.CONTROL</div>
//           <button 
//             onClick={() => {
//               localStorage.removeItem("token");
//               localStorage.removeItem("user");
//               window.location.href = "/login";
//             }}
//             className="w-full bg-red-900 hover:bg-red-800 px-4 py-3 rounded-sm text-white font-mono text-sm tracking-wide transition-colors border border-red-700"
//           >
//             [ TERMINATE.SESSION ]
//           </button>
//         </div>
//       </aside>
      
//       <main className="flex-1 p-8 overflow-y-auto bg-black">
//         {renderTabContent()}
//       </main>
//     </div>
//   );
// }

// "use client";
// import { useAuth } from "../../hooks/auth";
// import { useState , useEffect} from "react";

// interface OrganizationFormData {
//   name: string;
//   description: string;
//   location: string;
//   contactEmail: string;
// }

// type AdminTab = "profile" | "add-organization";
// function OrganizationList() {
//   const [organizations, setOrganizations] = useState<any[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");

//   useEffect(() => {
//     const fetchOrgs = async () => {
//       try {
//         const res = await fetch("/api/organizations");
//         const data = await res.json();

//         if (data.success) {
//           setOrganizations(data.organizations || []);
//         } else {
//           throw new Error(data.error || "Failed to fetch organizations");
//         }
//       } catch (err: any) {
//         setError(err.message);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchOrgs();
//   }, []);

//   if (loading) return <p className="text-gray-300">Loading organizations...</p>;
//   if (error) return <p className="text-red-400">Error: {error}</p>;
//   if (organizations.length === 0) return <p className="text-gray-400">No organizations found.</p>;

//   return (
//     <ul className="space-y-2">
//       {organizations.map((org, idx) => (
//         <li key={idx} className="p-4 bg-gray-700 rounded-lg border border-gray-600">
//           <h4 className="text-lg font-semibold text-white">{org.name}</h4>
//           <p className="text-gray-300 text-sm">{org.description}</p>
//           <p className="text-gray-400 text-xs mt-1">📍 {org.location} | 📧 {org.contactEmail}</p>
//         </li>
//       ))}
//     </ul>
//   );
// }

// export default function AdminDashboard() {
//   const user = useAuth(["admin"]);
//   const [activeTab, setActiveTab] = useState<AdminTab>("profile");
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState("");
//   const [orgFormData, setOrgFormData] = useState<OrganizationFormData>({
//     name: "",
//     description: "",
//     location: "",
//     contactEmail: ""
//   });

//   if (!user) return (
//     <div className="min-h-screen bg-gray-900 flex items-center justify-center">
//       <p className="text-white text-xl">Loading...</p>
//     </div>
//   );

//   const handleCreateOrganization = async () => {
//     setLoading(true);
//     setError("");
//     try {
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

  

//   const onOrgFormDataChange = (key: keyof OrganizationFormData, value: string) => {
//     setOrgFormData(f => ({ ...f, [key]: value }));
//   };

//   const renderTabContent = () => {
//     switch (activeTab) {
//       case "profile":
//         return (
//           <div className="space-y-6">
//             <h2 className="text-3xl font-bold text-white">Admin Profile</h2>
            
//             <div className="bg-gray-800 p-6 rounded-lg space-y-4">
//               <div className="flex items-center space-x-2">
//                 <span className="text-2xl">👨‍💼</span>
//                 <span className="text-xl font-semibold text-white">Administrator Dashboard</span>
//               </div>
              
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                 <div>
//                   <span className="font-medium text-gray-300">Name: </span>
//                   <span className="text-gray-100">{user.name || "Admin User"}</span>
//                 </div>
//                 <div>
//                   <span className="font-medium text-gray-300">Email: </span>
//                   <span className="text-gray-100">{user.email}</span>
//                 </div>
//                 <div>
//                   <span className="font-medium text-gray-300">Role: </span>
//                   <span className="text-blue-400 font-semibold">{user.role}</span>
//                 </div>
                
//                 {user.organization && (
//                   <div>
//                     <span className="font-medium text-gray-300">Organization: </span>
//                     <span className="text-gray-100">{user.organization}</span>
//                   </div>
//                 )}
//               </div>
//             </div>
//              <div className="bg-gray-800 p-6 rounded-lg">
//         <h3 className="text-xl font-semibold text-white mb-4">🏢 Organizations</h3>
//         <OrganizationList />
//       </div>
//           </div>
//         );

//       case "add-organization":
//         return (
//           <div className="space-y-6">
//             <h2 className="text-3xl font-bold text-white">Add New Organization</h2>
            
//             {error && (
//               <div className="p-4 bg-red-700 text-red-100 rounded-lg border border-red-600">
//                 <div className="flex items-center space-x-2">
//                   <span>❌</span>
//                   <span>{error}</span>
//                 </div>
//               </div>
//             )}
            
//             <div className="bg-gray-800 p-6 rounded-lg">
//               <form onSubmit={(e) => { e.preventDefault(); handleCreateOrganization(); }} className="space-y-6">
//                 <div>
//                   <label className="block text-gray-300 font-medium mb-2">
//                     🏢 Organization Name *
//                   </label>
//                   <input
//                     type="text"
//                     value={orgFormData.name}
//                     onChange={(e) => onOrgFormDataChange("name", e.target.value)}
//                     className="w-full p-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none transition-colors"
//                     placeholder="Enter organization name"
//                     required
//                   />
//                 </div>
                
//                 <div>
//                   <label className="block text-gray-300 font-medium mb-2">
//                     📝 Description *
//                   </label>
//                   <textarea
//                     value={orgFormData.description}
//                     onChange={(e) => onOrgFormDataChange("description", e.target.value)}
//                     className="w-full p-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none transition-colors"
//                     rows={4}
//                     placeholder="Enter organization description"
//                     required
//                   />
//                 </div>
                
//                 <div>
//                   <label className="block text-gray-300 font-medium mb-2">
//                     📍 Location *
//                   </label>
//                   <input
//                     type="text"
//                     value={orgFormData.location}
//                     onChange={(e) => onOrgFormDataChange("location", e.target.value)}
//                     className="w-full p-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none transition-colors"
//                     placeholder="Enter organization location"
//                     required
//                   />
//                 </div>
                
//                 <div>
//                   <label className="block text-gray-300 font-medium mb-2">
//                     📧 Contact Email *
//                   </label>
//                   <input
//                     type="email"
//                     value={orgFormData.contactEmail}
//                     onChange={(e) => onOrgFormDataChange("contactEmail", e.target.value)}
//                     className="w-full p-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none transition-colors"
//                     placeholder="Enter contact email"
//                     required
//                   />
//                 </div>
                
//                 <div className="flex gap-4 pt-4">
//                   <button
//                     type="submit"
//                     disabled={loading}
//                     className="bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed px-6 py-3 rounded-lg text-white font-medium transition-colors flex items-center space-x-2"
//                   >
//                     <span>{loading ? "⏳" : "✅"}</span>
//                     <span>{loading ? "Creating..." : "Create Organization"}</span>
//                   </button>
                  
//                   <button
//                     type="button"
//                     onClick={() => {
//                       setOrgFormData({ name: "", description: "", location: "", contactEmail: "" });
//                       setError("");
//                       setActiveTab("profile");
//                     }}
//                     className="bg-gray-600 hover:bg-gray-700 px-6 py-3 rounded-lg text-white font-medium transition-colors flex items-center space-x-2"
//                   >
//                     <span>❌</span>
//                     <span>Cancel</span>
//                   </button>
//                 </div>
//               </form>
//             </div>

//             <div className="bg-gray-800 p-6 rounded-lg">
//               <h3 className="text-lg font-semibold text-white mb-3">ℹ️ Organization Guidelines</h3>
//               <ul className="space-y-2 text-gray-300">
//                 <li>• Organization name should be unique and descriptive</li>
//                 <li>• Provide a clear description of the organization's purpose</li>
//                 <li>• Location should include city and country</li>
//                 <li>• Contact email will be used for official communications</li>
//               </ul>
//             </div>
//           </div>
//         );

//       default:
//         return <div className="text-gray-400">Select a tab to get started</div>;
//     }
//   };

//   // const getTabLabel = (tab: AdminTab) => {
//   //   switch (tab) {
//   //     case "add-organization": return "Add Organization";
//   //     case "profile": return "Profile";
//   //     default: return tab.charAt(0).toUpperCase() + tab.slice(1);
//   //   }
//   // };

//   const getTabLabel = (tab: AdminTab) => {
//   switch (tab) {
//     case "add-organization": return "Add Organization";
//     case "profile": return "Profile";
//     default: {
//       const tabStr = tab as string;
//       return tabStr.charAt(0).toUpperCase() + tabStr.slice(1);
//     }
//   }
// };

//   const getTabIcon = (tab: AdminTab) => {
//     switch (tab) {
//       case "add-organization": return "🏢";
//       case "profile": return "👨‍💼";
//       default: return "📋";
//     }
//   };

//   return (
//     <div className="flex min-h-screen bg-gray-900 text-gray-100">
//       <aside className="w-64 bg-gray-800 p-4 space-y-2">
//         <div className="mb-6 p-3 bg-gray-700 rounded-lg">
//           <div className="text-sm text-gray-300">Logged in as:</div>
//           <div className="font-semibold text-white">{user.name || "Admin User"}</div>
//           <div className="text-xs text-blue-400 font-medium">{user.role}</div>
//         </div>
        
//         <div className="space-y-2">
//           {(["profile", "add-organization"] as AdminTab[]).map(tab => (
//             <button 
//               key={tab}
//               className={`block w-full text-left px-4 py-3 rounded-lg transition-colors flex items-center space-x-2 ${
//                 activeTab === tab 
//                   ? "bg-gray-700 text-white" 
//                   : "hover:bg-gray-700 text-gray-300 hover:text-white"
//               }`}
//               onClick={() => setActiveTab(tab)}
//             >
//               <span>{getTabIcon(tab)}</span>
//               <span>{getTabLabel(tab)}</span>
//             </button>
//           ))}
//         </div>
        
//         <div className="pt-8 space-y-2">
//           <button 
//             onClick={() => {
//               localStorage.removeItem("token");
//               localStorage.removeItem("user");
//               window.location.href = "/login";
//             }}
//             className="w-full bg-red-600 hover:bg-red-700 px-4 py-3 rounded-lg text-white font-medium transition-colors flex items-center space-x-2"
//           >
//             <span>🚪</span>
//             <span>Logout</span>
//           </button>
//         </div>
//       </aside>
      
//       <main className="flex-1 p-8 overflow-y-auto">
//         {renderTabContent()}
//       </main>
//     </div>
//   );
// }