import path from "path";

// SSRF protection - prevent access to sensitive paths
const BLOCKED_PATTERNS = [
  /\/etc\/passwd/,
  /\/etc\/shadow/,
  /\.ssh/,
  /\.aws/,
  /\.env/,
  /node_modules\/.*\.env/,
];

export function isPathSafe(filepath: string): boolean {
  const normalized = path.normalize(filepath);
  return !BLOCKED_PATTERNS.some(pattern => pattern.test(normalized));
}
