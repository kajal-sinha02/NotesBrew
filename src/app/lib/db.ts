import clientPromise from "./mongodb";

export async function getUsersCollection() {
  const client = await clientPromise;
  const db = client.db(); // default DB from URI
  return db.collection("users");
}
export async function getNotesCollection() {
  const client = await clientPromise;
  const db = client.db();
  return db.collection("notes");
}
export async function getOrganizationsCollection() {
  const client = await clientPromise;
  const db = client.db();
  return db.collection("organizations");
}
export async function getMessagesCollection() {
  const client = await clientPromise;
  const db = client.db();
  return db.collection("messages");
}