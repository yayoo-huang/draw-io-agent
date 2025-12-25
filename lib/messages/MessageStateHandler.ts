/**
 * Message State Handler
 * Based on Cline's MessageStateHandler architecture
 * Manages both API messages (for LLM) and display messages (for UI)
 */

import Mutex from "p-mutex";
import type { StorageMessage } from "@/lib/types/storage-message";
import type { ConversationMessage } from "@/lib/context";
import { saveApiMessages, saveConversationMessages, loadApiMessages, loadConversationMessages } from "./storage";

export interface MessageStateHandlerOptions {
  taskId: string;
  onStateUpdate?: (state: MessageState) => void;
}

export interface MessageState {
  apiMessages: StorageMessage[];
  conversationMessages: ConversationMessage[];
  conversationHistoryDeletedRange?: [number, number];
}

/**
 * Message State Handler
 * Manages message state with mutex protection against race conditions
 */
export class MessageStateHandler {
  private taskId: string;
  private apiMessages: StorageMessage[] = [];
  private conversationMessages: ConversationMessage[] = [];
  private conversationHistoryDeletedRange?: [number, number];
  private stateMutex = new Mutex();
  private onStateUpdate?: (state: MessageState) => void;

  constructor(options: MessageStateHandlerOptions) {
    this.taskId = options.taskId;
    this.onStateUpdate = options.onStateUpdate;
  }

  /**
   * Execute function with exclusive lock on message state
   * Prevents race conditions from concurrent modifications
   */
  private async withStateLock<T>(fn: () => T | Promise<T>): Promise<T> {
    return await this.stateMutex.withLock(fn);
  }

  /**
   * Get current API messages (for LLM communication)
   */
  getApiMessages(): StorageMessage[] {
    return this.apiMessages;
  }

  /**
   * Get current conversation messages (for UI and context tracking)
   */
  getConversationMessages(): ConversationMessage[] {
    return this.conversationMessages;
  }

  /**
   * Get conversation history deleted range
   */
  getDeletedRange(): [number, number] | undefined {
    return this.conversationHistoryDeletedRange;
  }

  /**
   * Set conversation history deleted range
   */
  setDeletedRange(range: [number, number] | undefined): void {
    this.conversationHistoryDeletedRange = range;
  }

  /**
   * Get current state
   */
  getState(): MessageState {
    return {
      apiMessages: this.apiMessages,
      conversationMessages: this.conversationMessages,
      conversationHistoryDeletedRange: this.conversationHistoryDeletedRange,
    };
  }

  /**
   * Add API message (with mutex protection)
   */
  async addApiMessage(message: StorageMessage): Promise<void> {
    return await this.withStateLock(async () => {
      this.apiMessages.push(message);
      await saveApiMessages(this.taskId, this.apiMessages);
      this.notifyStateUpdate();
    });
  }

  /**
   * Add conversation message (with mutex protection)
   */
  async addConversationMessage(message: ConversationMessage): Promise<void> {
    return await this.withStateLock(async () => {
      // Set conversation history index to correlate with API messages
      message.conversationHistoryIndex = this.apiMessages.length - 1;
      message.conversationHistoryDeletedRange = this.conversationHistoryDeletedRange;
      
      this.conversationMessages.push(message);
      await saveConversationMessages(this.taskId, this.conversationMessages);
      this.notifyStateUpdate();
    });
  }

  /**
   * Update an existing API message
   */
  async updateApiMessage(index: number, updates: Partial<StorageMessage>): Promise<void> {
    return await this.withStateLock(async () => {
      if (index < 0 || index >= this.apiMessages.length) {
        throw new Error(`Invalid API message index: ${index}`);
      }
      
      Object.assign(this.apiMessages[index], updates);
      await saveApiMessages(this.taskId, this.apiMessages);
      this.notifyStateUpdate();
    });
  }

  /**
   * Update an existing conversation message
   */
  async updateConversationMessage(index: number, updates: Partial<ConversationMessage>): Promise<void> {
    return await this.withStateLock(async () => {
      if (index < 0 || index >= this.conversationMessages.length) {
        throw new Error(`Invalid conversation message index: ${index}`);
      }
      
      Object.assign(this.conversationMessages[index], updates);
      await saveConversationMessages(this.taskId, this.conversationMessages);
      this.notifyStateUpdate();
    });
  }

  /**
   * Overwrite all API messages
   */
  async setApiMessages(messages: StorageMessage[]): Promise<void> {
    return await this.withStateLock(async () => {
      this.apiMessages = messages;
      await saveApiMessages(this.taskId, this.apiMessages);
      this.notifyStateUpdate();
    });
  }

  /**
   * Overwrite all conversation messages
   */
  async setConversationMessages(messages: ConversationMessage[]): Promise<void> {
    return await this.withStateLock(async () => {
      this.conversationMessages = messages;
      await saveConversationMessages(this.taskId, this.conversationMessages);
      this.notifyStateUpdate();
    });
  }

  /**
   * Clear all messages
   */
  async clear(): Promise<void> {
    return await this.withStateLock(async () => {
      this.apiMessages = [];
      this.conversationMessages = [];
      this.conversationHistoryDeletedRange = undefined;
      await saveApiMessages(this.taskId, this.apiMessages);
      await saveConversationMessages(this.taskId, this.conversationMessages);
      this.notifyStateUpdate();
    });
  }

  /**
   * Load messages from disk
   */
  async loadFromDisk(): Promise<void> {
    return await this.withStateLock(async () => {
      this.apiMessages = await loadApiMessages(this.taskId);
      this.conversationMessages = await loadConversationMessages(this.taskId);
      this.notifyStateUpdate();
    });
  }

  /**
   * Notify state update callback
   */
  private notifyStateUpdate(): void {
    if (this.onStateUpdate) {
      this.onStateUpdate(this.getState());
    }
  }
}
