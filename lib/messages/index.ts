/**
 * Message System Index
 * Exports all message-related functionality
 */

export { MessageStateHandler } from "./MessageStateHandler";
export type { MessageStateHandlerOptions, MessageState } from "./MessageStateHandler";

export {
  saveApiMessages,
  saveConversationMessages,
  loadApiMessages,
  loadConversationMessages,
  taskStorageExists,
  deleteTaskStorage,
} from "./storage";
