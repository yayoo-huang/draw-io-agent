/**
 * Format Response Utilities
 * Provides placeholder texts for context optimization
 */

export const formatResponse = {
  /**
   * Notice shown when a file read is deduplicated
   */
  duplicateFileReadNotice(): string {
    return "[NOTE] The contents of this file have been displayed previously. The full content is still available in context but has been summarized here to save tokens.";
  },

  /**
   * Notice shown in first assistant message when context is truncated
   */
  contextTruncationNotice(): string {
    return "[NOTE] Some previous conversation history with the user has been removed to optimize context window usage. The most recent and relevant information has been preserved.";
  },

  /**
   * Process first user message for truncation
   */
  processFirstUserMessageForTruncation(): string {
    return "[Initial user request - content preserved]";
  },
};
