"use client";

import React, { useEffect, useState } from "react";
import {
  collection,
  addDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../lib/firebase";

interface GroupChatProps {
  user: {
    email: string;
    name: string;
    organization: string;
  };
}

interface ChatMessage {
  id: string;
  content: string;
  senderEmail: string;
  senderName: string;
  organization: string;
  createdAt: any;
}

export default function GroupChat({ user }: GroupChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [orgName, setOrgName] = useState("");

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const parsed = JSON.parse(storedUser);
      setOrgName(parsed.organizationName || "Your Organization");
    }
  }, []);


  useEffect(() => {
    if (!user.organization) {
      console.warn("🚨 No organization found for user.");
      return;
    }

    // console.log("👤 Subscribing to messages for organization:", user.organization);

    const messagesRef = collection(db, "messages");
    const q = query(
      messagesRef,
      where("organization", "==", user.organization),
      orderBy("createdAt", "asc")
    );

    const unsubscribe = onSnapshot(
      q,
      (querySnapshot) => {
        const msgs: ChatMessage[] = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          msgs.push({
            id: doc.id,
            content: data.content,
            senderEmail: data.senderEmail,
            senderName: data.senderName,
            organization: data.organization,
            createdAt: data.createdAt,
          });
        });

        // console.log("📥 New messages received:", msgs);
        setMessages(msgs);
        setLoading(false);
      },
      (error) => {
        console.error("❌ Error in onSnapshot:", error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user.organization]);

  const sendMessage = async () => {
    if (!newMessage.trim()) return;

    try {
      await addDoc(collection(db, "messages"), {
        content: newMessage.trim(),
        senderEmail: user.email,
        senderName: user.name,
        organization: user.organization,
        createdAt: serverTimestamp(),
      });
      // console.log("✅ Message sent");
      setNewMessage("");
    } catch (error) {
      // console.error("❌ Error sending message:", error);
    }
  };

  return (
    <div className="border rounded p-4 max-w-xl mx-auto bg-white dark:bg-gray-900 dark:border-gray-700 shadow">
      <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-100">
        Group Chat - {orgName}
      </h2>

      <div className="h-64 overflow-y-auto border p-2 mb-4 bg-gray-50 dark:bg-gray-800 dark:border-gray-700 rounded">
        {loading ? (
          <p className="text-center text-gray-500 dark:text-gray-400">
            Loading messages...
          </p>
        ) : messages.length === 0 ? (
          <p className="text-center text-gray-600 dark:text-gray-400">No messages yet.</p>
        ) : (
          messages.map((m) => (
            <div key={m.id} className="mb-2">
              <strong className="text-blue-600 dark:text-blue-400">{m.senderName}:</strong>{" "}
              <span className="text-gray-800 dark:text-gray-200">{m.content}</span>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                {m.createdAt?.seconds
                  ? new Date(m.createdAt.seconds * 1000).toLocaleString(undefined, {
                    weekday: "short", // Optional: 'Mon'
                    day: "2-digit",
                    month: "short",   // 'Jun'
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit",
                    hour12: true,
                  })
                  : "Just now"}

              </div>
            </div>
          ))
        )}
      </div>

      <div className="flex gap-2">
        <input
          type="text"
          className="flex-1 border px-2 py-1 rounded bg-white dark:bg-gray-700 dark:text-white dark:border-gray-600"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type your message..."
          onKeyDown={(e) => {
            if (e.key === "Enter") sendMessage();
          }}
        />
        <button
          onClick={sendMessage}
          className="bg-blue-500 text-white px-4 py-1 rounded hover:bg-blue-600"
        >
          Send
        </button>
      </div>
    </div>
  );
}
