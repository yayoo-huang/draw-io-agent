/**
 * display_diagram tool handler
 * Validates and wraps Draw.io XML for display
 */

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
 * Wrap raw mxCell XML with proper Draw.io document structure
 */
function wrapWithMxFile(cellsXml: string): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<mxfile host="app.diagrams.net" agent="Draw.io Agent">
  <diagram name="Page-1" id="diagram-1">
    <mxGraphModel dx="1422" dy="794" grid="1" gridSize="10" guides="1" tooltips="1" connect="1" arrows="1" fold="1" page="1" pageScale="1" pageWidth="827" pageHeight="1169" math="0" shadow="0">
      <root>
        <mxCell id="0"/>
        <mxCell id="1" parent="0"/>
${cellsXml}
      </root>
    </mxGraphModel>
  </diagram>
</mxfile>`;
}

/**
 * Validate Draw.io XML structure
 * Returns error message if invalid, null if valid
 */
function validateDrawioXml(xml: string): string | null {
  // Basic XML validation
  if (!xml || xml.trim().length === 0) {
    return "XML is empty";
  }
  
  // Check for required structure
  if (!xml.includes("<mxCell")) {
    return "XML must contain at least one mxCell element";
  }
  
  // Check for invalid wrapper tags (LLM should not include these)
  if (xml.includes("<mxfile") || xml.includes("<mxGraphModel") || xml.includes("<root>")) {
    return "XML should contain ONLY mxCell elements, no wrapper tags";
  }
  
  // Check for root cells (should not be included)
  if (xml.includes('id="0"') || xml.includes('id="1"')) {
    return 'XML should not include root cells (id="0" or id="1")';
  }
  
  // Check for proper mxCell format
  const mxCellRegex = /<mxCell[^>]*>/;
  if (!mxCellRegex.test(xml)) {
    return "Invalid mxCell format";
  }
  
  return null;
}

export interface DisplayDiagramInput {
  xml: string;
}

export interface DisplayDiagramResult {
  success: boolean;
  error?: string;
  wrappedXml?: string;
  isTruncated?: boolean;
}

/**
 * Display diagram handler
 * Validates XML and prepares it for display
 */
export async function displayDiagram(
  input: DisplayDiagramInput
): Promise<DisplayDiagramResult> {
  const { xml } = input;
  
  // Validate input exists
  if (!xml || typeof xml !== 'string') {
    return {
      success: false,
      error: `Missing or invalid xml parameter. The xml field is required and must be a string.

EXAMPLE USAGE:
<display_diagram>
<xml>
<mxCell id="2" value="Component A" style="rounded=1;" vertex="1" parent="1">
  <mxGeometry x="40" y="40" width="120" height="60" as="geometry"/>
</mxCell>
</xml>
</display_diagram>

Please provide the xml parameter with mxCell elements.`,
    };
  }
  
  // Check if XML is truncated
  const isTruncated = !isMxCellXmlComplete(xml);
  
  if (isTruncated) {
    return {
      success: false,
      isTruncated: true,
      error: `Output was truncated due to length limits. The XML is incomplete.

XML ending (last 200 chars):
${xml.slice(-200)}

SOLUTION: Please regenerate with a simpler diagram or break it into smaller parts.`,
    };
  }
  
  // Validate XML structure
  const validationError = validateDrawioXml(xml);
  
  if (validationError) {
    return {
      success: false,
      error: `${validationError}

Your XML:
${xml.substring(0, 500)}${xml.length > 500 ? "..." : ""}

Please fix the XML issues and try again.`,
    };
  }
  
  // Wrap with mxfile structure
  const wrappedXml = wrapWithMxFile(xml);
  
  return {
    success: true,
    wrappedXml,
  };
}
