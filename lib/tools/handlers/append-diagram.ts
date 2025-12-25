/**
 * append_diagram Tool Handler
 * Continues adding mxCell elements to an existing diagram when content is too large for a single call
 */

import { DOMParser, XMLSerializer } from "@xmldom/xmldom";

export interface AppendDiagramInput {
  xml: string;
}

export interface AppendDiagramResult {
  success: boolean;
  wrappedXml?: string;
  error?: string;
  appendedCount?: number;
  isTruncated?: boolean;
}

/**
 * Check if mxCell XML is complete (not truncated)
 * A complete XML should have properly closed mxCell tags
 */
function isMxCellXmlComplete(xml: string): boolean {
  const trimmed = xml.trim();
  
  // Check if it ends with a complete tag
  if (!trimmed.endsWith(">")) {
    return false;
  }
  
  // Count opening and closing mxCell tags
  const openTags = (trimmed.match(/<mxCell[^>]*>/g) || []).length;
  const closeTags = (trimmed.match(/<\/mxCell>/g) || []).length;
  const selfClosingTags = (trimmed.match(/<mxCell[^>]*\/>/g) || []).length;
  
  // Self-closing tags count as both open and close
  const totalOpen = openTags;
  const totalClose = closeTags + selfClosingTags;
  
  return totalOpen === totalClose;
}

/**
 * Append additional mxCell elements to the current diagram
 * This is used when display_diagram content is too large and needs to be split
 */
export async function appendDiagram(
  input: AppendDiagramInput,
  currentXml: string | null
): Promise<AppendDiagramResult> {
  try {
    const { xml } = input;

    // Validate input exists
    if (!xml || typeof xml !== 'string') {
      return {
        success: false,
        error: "Missing or invalid xml parameter. The xml field is required and must be a string.",
      };
    }

    // Check if XML is truncated
    const isTruncated = !isMxCellXmlComplete(xml);
    
    if (isTruncated) {
      return {
        success: false,
        isTruncated: true,
        error: `Output was truncated due to length limits. The XML is incomplete.\n\n` +
               `XML ending (last 200 chars):\n${xml.slice(-200)}\n\n` +
               `SOLUTION: Please regenerate with fewer components (8-12 max per append_diagram call).`,
      };
    }

    // Validate that we have a current diagram to append to
    if (!currentXml || currentXml.trim() === "") {
      return {
        success: false,
        error: "No existing diagram found. Use display_diagram to create a diagram first, then append_diagram to add more elements.",
      };
    }

    // Parse the current diagram XML
    const parser = new DOMParser();
    const currentDoc = parser.parseFromString(currentXml, "text/xml");
    
    // Check for parse errors
    const parseError = currentDoc.getElementsByTagName("parsererror")[0];
    if (parseError) {
      return {
        success: false,
        error: `Failed to parse current diagram XML: ${parseError.textContent}`,
      };
    }

    // Find the root element
    const root = currentDoc.getElementsByTagName("root")[0];
    if (!root) {
      return {
        success: false,
        error: "Current diagram is missing <root> element",
      };
    }

    // Parse the new XML fragment (wrap it to handle fragment parsing)
    const fragmentDoc = parser.parseFromString(`<wrapper>${xml}</wrapper>`, "text/xml");
    const fragmentParseError = fragmentDoc.getElementsByTagName("parsererror")[0];
    if (fragmentParseError) {
      return {
        success: false,
        error: `Failed to parse append XML: ${fragmentParseError.textContent}`,
      };
    }

    // Get all mxCell elements from the fragment
    const wrapper = fragmentDoc.getElementsByTagName("wrapper")[0];
    if (!wrapper) {
      return {
        success: false,
        error: "Failed to parse XML fragment",
      };
    }

    const newCells = wrapper.getElementsByTagName("mxCell");
    if (newCells.length === 0) {
      return {
        success: false,
        error: "No mxCell elements found in append XML. Please provide only mxCell elements.",
      };
    }

    // Track existing IDs to detect duplicates
    const existingIds = new Set<string>();
    const existingCells = root.getElementsByTagName("mxCell");
    for (let i = 0; i < existingCells.length; i++) {
      const id = existingCells[i].getAttribute("id");
      if (id) existingIds.add(id);
    }

    // Append each new cell to the root
    let appendedCount = 0;
    const errors: string[] = [];

    for (let i = 0; i < newCells.length; i++) {
      const newCell = newCells[i];
      const cellId = newCell.getAttribute("id");

      // Validate cell has an id
      if (!cellId) {
        errors.push(`Cell ${i + 1} is missing id attribute`);
        continue;
      }

      // Check for duplicate IDs
      if (existingIds.has(cellId)) {
        errors.push(`Cell with id="${cellId}" already exists in diagram`);
        continue;
      }

      // Validate cell has parent attribute
      const parent = newCell.getAttribute("parent");
      if (!parent) {
        errors.push(`Cell id="${cellId}" is missing parent attribute`);
        continue;
      }

      // Import the node into the current document
      const importedNode = currentDoc.importNode(newCell, true);
      root.appendChild(importedNode);
      existingIds.add(cellId);
      appendedCount++;
    }

    if (appendedCount === 0) {
      return {
        success: false,
        error: `No cells could be appended. Errors:\n${errors.join("\n")}`,
      };
    }

    // Serialize the updated document
    const serializer = new XMLSerializer();
    const wrappedXml = serializer.serializeToString(currentDoc);

    const result: AppendDiagramResult = {
      success: true,
      wrappedXml,
      appendedCount,
    };

    if (errors.length > 0) {
      result.error = `Appended ${appendedCount} cells, but encountered ${errors.length} error(s):\n${errors.join("\n")}`;
    }

    return result;
  } catch (error) {
    return {
      success: false,
      error: `Failed to append diagram: ${error instanceof Error ? error.message : String(error)}`,
    };
  }
}
