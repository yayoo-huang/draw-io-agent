/**
 * Tool specification types
 * Simplified from Cline's architecture for Draw.io Agent
 */

export interface ToolParameter {
  name: string;
  required: boolean;
  instruction: string;
  usage: string;
  description?: string;
}

export interface ToolSpec {
  name: string;
  description: string;
  parameters: ToolParameter[];
}

/**
 * Format a tool specification into prompt text
 */
export function formatToolSpec(spec: ToolSpec): string {
  const lines: string[] = [];
  
  lines.push(`## ${spec.name}`);
  lines.push(`Description: ${spec.description}`);
  
  if (spec.parameters.length > 0) {
    lines.push("");
    lines.push("Parameters:");
    for (const param of spec.parameters) {
      const required = param.required ? "(required)" : "(optional)";
      lines.push(`- ${param.name}: ${required} ${param.instruction}`);
    }
    
    lines.push("");
    lines.push("Usage:");
    lines.push(`<${spec.name}>`);
    for (const param of spec.parameters) {
      if (param.name === "xml") {
        lines.push(`<${param.name}>`);
        lines.push(`<mxCell id="2" value="Component A" style="rounded=1;" vertex="1" parent="1">`);
        lines.push(`  <mxGeometry x="40" y="40" width="120" height="60" as="geometry"/>`);
        lines.push(`</mxCell>`);
        lines.push(`</${param.name}>`);
      } else {
        lines.push(`<${param.name}>${param.usage}</${param.name}>`);
      }
    }
    lines.push(`</${spec.name}>`);
  }
  
  return lines.join("\n");
}
