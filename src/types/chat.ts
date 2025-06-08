export interface ChatMessage {
  content: string;
  senderEmail: string;
  senderName: string;
  organization: string;
  createdAt: string;
  isGroup: boolean;
  receiverEmail?: string; // only for one-on-one
}