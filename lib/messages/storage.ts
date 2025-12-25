/**
 * Message Storage
 * Handles persistence of messages to disk
 */

import fs from "fs/promises";
import path from "path";
import type { StorageMessage } from "@/lib/types/storage-message";
import type { ConversationMessage } from "@/lib/context";

const STORAGE_DIR = ".drawio-agent";
const API_MESSAGES_FILE = "api-messages.json";
const CONVERSATION_MESSAGES_FILE = "conversation-messages.json";

/**
 * Ensure storage directory exists
 */
async function ensureStorageDir(taskId: string): Promise<string> {
  const taskDir = path.join(process.cwd(), STORAGE_DIR, taskId);
  await fs.mkdir(taskDir, { recursive: true });
  return taskDir;
}

/**
 * Save API messages to disk
 */
export async function saveApiMessages(
  taskId: string,
  messages: StorageMessage[]
): Promise<void> {
  try {
    const taskDir = await ensureStorageDir(taskId);
    const filePath = path.join(taskDir, API_MESSAGES_FILE);
    await fs.writeFile(filePath, JSON.stringify(messages, null, 2), "utf-8");
  } catch (error) {
    console.error("Failed to save API messages:", error);
    throw error;
  }
}

/**
 * Load API messages from disk
 */
export async function loadApiMessages(taskId: string): Promise<StorageMessage[]> {
  try {
    const taskDir = path.join(process.cwd(), STORAGE_DIR, taskId);
    const filePath = path.join(taskDir, API_MESSAGES_FILE);
    const data = await fs.readFile(filePath, "utf-8");
    return JSON.parse(data);
  } catch (error) {
    // File doesn't exist or is invalid - return empty array
    return [];
  }
}

/**
 * Save conversation messages to disk
 */
export async function saveConversationMessages(
  taskId: string,
  messages: ConversationMessage[]
): Promise<void> {
  try {
    const taskDir = await ensureStorageDir(taskId);
    const filePath = path.join(taskDir, CONVERSATION_MESSAGES_FILE);
    await fs.writeFile(filePath, JSON.stringify(messages, null, 2), "utf-8");
  } catch (error) {
    console.error("Failed to save conversation messages:", error);
    throw error;
  }
}

/**
 * Load conversation messages from disk
 */
export async function loadConversationMessages(taskId: string): Promise<ConversationMessage[]> {
  try {
    const taskDir = path.join(process.cwd(), STORAGE_DIR, taskId);
    const filePath = path.join(taskDir, CONVERSATION_MESSAGES_FILE);
    const data = await fs.readFile(filePath, "utf-8");
    return JSON.parse(data);
  } catch (error) {
    // File doesn't exist or is invalid - return empty array
    return [];
  }
}

/**
 * Check if task storage exists
 */
export async function taskStorageExists(taskId: string): Promise<boolean> {
  try {
    const taskDir = path.join(process.cwd(), STORAGE_DIR, taskId);
    await fs.access(taskDir);
    return true;
  } catch {
    return false;
  }
}

/**
 * Delete task storage
 */
export async function deleteTaskStorage(taskId: string): Promise<void> {
  try {
    const taskDir = path.join(process.cwd(), STORAGE_DIR, taskId);
    await fs.rm(taskDir, { recursive: true, force: true });
  } catch (error) {
    console.error("Failed to delete task storage:", error);
  }
}
