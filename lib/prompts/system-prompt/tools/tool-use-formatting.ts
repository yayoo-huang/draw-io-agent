/**
 * Tool Use Formatting
 * Explains how to format tool calls
 */

export function getToolUseFormatting(): string {
  return `# Tool Use Formatting

Tool use is formatted using XML-style tags. The tool name is enclosed in opening and closing tags, and each parameter is similarly enclosed within its own set of tags. Here's the structure:

<tool_name>
<parameter1_name>value1</parameter1_name>
<parameter2_name>value2</parameter2_name>
</tool_name>

For example:

<read_file>
<path>/path/to/file.ts</path>
</read_file>

## Multiple Tools in One Turn (CRITICAL FOR PERFORMANCE)

You can and SHOULD call multiple tools in a single turn when they are read-only operations. Simply place them one after another:

**Example - Parallel file reading (all execute simultaneously):**

<read_file>
<path>/src/config.json</path>
</read_file>
<read_file>
<path>/src/main.ts</path>
</read_file>
<read_file>
<path>/package.json</path>
</read_file>

**Example - Parallel searching (all execute simultaneously):**

<search_files>
<path>/project</path>
<pattern>\.smithy$</pattern>
</search_files>
<search_files>
<path>/project</path>
<pattern>\.coral$</pattern>
</search_files>
<search_files>
<path>/project</path>
<pattern>Activity\.java$</pattern>
</search_files>

**Example - Mixed parallel operations:**

<list_code_definition_names>
<path>/src/UserService.java</path>
</list_code_definition_names>
<list_code_definition_names>
<path>/src/OrderService.java</path>
</list_code_definition_names>
<read_file>
<path>/src/config/application.properties</path>
</read_file>

All read-only tools (read_file, search_files, list_files_recursive, list_code_definition_names) will execute in parallel, dramatically reducing response time. This is NOT optional - batching tool calls is essential for performance.

Always adhere to this format for the tool use to ensure proper parsing and execution.`;
}
