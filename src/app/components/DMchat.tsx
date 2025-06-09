"use client";

import React, { useEffect, useState, useRef } from "react";
import {
    collection,
    query,
    orderBy,
    onSnapshot,
    addDoc,
    serverTimestamp,
} from "firebase/firestore";
import { db } from "../lib/firebase";

interface User {
    _id: string;
    name: string;
    email: string;
}

interface Message {
    id: string;
    senderId: string;
    text: string;
    timestamp: any;
}

interface Props {
    currentUser: { uid: string; name: string };
}

function generateChatId(uid1: string, uid2: string) {
    return [uid1, uid2].sort().join("_");
}

export default function DMChat({ currentUser }: Props) {
    const [users, setUsers] = useState<User[]>([]);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState("");
    const messagesEndRef = useRef<HTMLDivElement | null>(null);

    // Scroll to bottom when messages change
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    useEffect(() => {
        async function fetchUsers() {
            try {
                const storedUser = localStorage.getItem("user");
                if (!storedUser) return;

                const parsed = JSON.parse(storedUser);
                const orgId = parsed.organization;
                if (!orgId) return;

                const res = await fetch(`/api/users?organization=${orgId}`);
                const data: User[] = await res.json();

                const filtered = data.filter((u) => u._id !== currentUser.uid);
                setUsers(filtered);
            } catch (error) {
                console.error("Failed to fetch users", error);
            }
        }
        fetchUsers();
    }, [currentUser.uid]);

    useEffect(() => {
        if (!selectedUser) {
            setMessages([]);
            return;
        }

        const chatId = generateChatId(currentUser.uid, selectedUser._id);
        const messagesRef = collection(db, "chats", chatId, "messages");
        const q = query(messagesRef, orderBy("timestamp", "asc"));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const msgs: Message[] = [];
            snapshot.forEach((doc) => {
                const data = doc.data() as Message;
                // Debug: Log every message received to console
                // console.log("Message received:", data.text, "from", data.senderId);
                msgs.push({ ...data, id: doc.id });
            });
            setMessages(msgs);
        });

        return () => unsubscribe();
    }, [selectedUser, currentUser.uid]);

    async function handleSendMessage(e: React.FormEvent) {
        e.preventDefault();
        if (!newMessage.trim() || !selectedUser) return;

        const chatId = generateChatId(currentUser.uid, selectedUser._id);
        const messagesRef = collection(db, "chats", chatId, "messages");

        try {
            await addDoc(messagesRef, {
                senderId: currentUser.uid,
                text: newMessage.trim(),
                timestamp: serverTimestamp(),
            });
            setNewMessage("");
        } catch (error) {
            console.error("Error sending message:", error);
        }
    }

    return (
        <div className="flex h-[500px] border rounded shadow-lg overflow-hidden bg-gray-900 text-gray-100">
            {/* Users List */}
            <div className="w-1/3 border-r border-gray-700 overflow-y-auto bg-gray-800">
                <h2 className="p-4 font-semibold border-b border-gray-700 sticky top-0 z-10 bg-gray-800">
                    Users
                </h2>
                {users.length === 0 && (
                    <p className="p-4 text-gray-400">No users found</p>
                )}
                {users.map((user) => (
                    <button
                        key={user._id}
                        onClick={() => setSelectedUser(user)}
                        className={`block w-full text-left px-4 py-3 hover:bg-gray-700 transition-colors ${selectedUser?._id === user._id
                                ? "bg-blue-700 font-semibold text-white"
                                : "bg-gray-800 text-gray-300"
                            }`}
                    >
                        {user.name || user.email}
                    </button>
                ))}
            </div>

            {/* Chat Window */}
            <div className="flex flex-col flex-1 bg-gray-900">
                <div className="p-4 border-b border-gray-700 font-semibold bg-gray-800 sticky top-0 z-10">
                    {selectedUser
                        ? `Chat with ${selectedUser.name || selectedUser.email}`
                        : "Select a user to chat"}
                </div>

                <div
                    className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800"
                    style={{ display: "flex", flexDirection: "column" }}
                >
                    {selectedUser ? (
                        messages.length > 0 ? (
                            messages.map((msg) => {
                                const date = msg.timestamp?.toDate
                                    ? msg.timestamp.toDate()
                                    : null;
                                const timeString = date
                                    ? date.toLocaleTimeString([], {
                                        day: "2-digit",
                                        month: "short",
                                        year: "numeric",
                                        hour: "2-digit",
                                        minute: "2-digit",
                                        hour12: true,

                                    })
                                    : "";

                                return (
                                    <div
                                        key={msg.id}
                                        className={`max-w-xs px-4 py-2 rounded shadow-sm ${msg.senderId === currentUser.uid
                                                ? "bg-blue-600 text-white self-end"
                                                : "bg-gray-700 border border-gray-600 text-gray-300 self-start"
                                            }`}
                                        style={{
                                            alignSelf:
                                                msg.senderId === currentUser.uid
                                                    ? "flex-end"
                                                    : "flex-start",
                                        }}
                                    >
                                        <div>{msg.text}</div>
                                        {timeString && (
                                            <div className="text-xs text-gray-400 mt-1 text-right select-none">
                                                {timeString}
                                            </div>
                                        )}
                                    </div>
                                );
                            })
                        ) : (
                            <p className="text-center text-gray-500 mt-10">
                                No messages yet. Say hi!
                            </p>
                        )
                    ) : (
                        <p className="text-center text-gray-500 mt-10">
                            Select a user to start chatting
                        </p>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input Box */}
                {selectedUser && (
                    <form
                        onSubmit={handleSendMessage}
                        className="p-4 border-t border-gray-700 flex gap-2 bg-gray-800"
                    >
                        <input
                            type="text"
                            placeholder="Type your message..."
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            className="flex-1 border border-gray-600 rounded px-3 py-2 bg-gray-900 text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        />
                        <button
                            type="submit"
                            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
                        >
                            Send
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
}
