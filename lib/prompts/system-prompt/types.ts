/**
 * Type definitions for Draw.io Agent system prompts
 * Simplified version inspired by Cline's architecture
 */

export interface SystemPromptContext {
  diagramType: string;
  cwd?: string;
}

export interface DiagramTypeConfig {
  name: string;
  description: string;
}

export const DIAGRAM_TYPES: Record<string, DiagramTypeConfig> = {
  "system-architecture": {
    name: "System Architecture",
    description: "Create a System Architecture diagram showing overall system components, their relationships, and how they interact. Include frontend, backend, databases, external services, and system boundaries."
  },
  "component-structure": {
    name: "Component Structure",
    description: "Create a Component/Module Structure diagram showing the directory structure, main files/modules, and their dependencies. Focus on code organization and module relationships."
  },
  "data-flow": {
    name: "Data Flow",
    description: "Create a Data Flow Diagram showing how data moves through the system, from user requests through processing to storage and responses. Include all data transformations."
  },
  "microservices": {
    name: "Microservices",
    description: "Create a Microservices Architecture diagram showing individual services, their communication patterns, message queues, service discovery, and inter-service dependencies."
  },
  "class-diagram": {
    name: "Class Diagram",
    description: "Create a Class/Interface Diagram showing OOP structure with classes, interfaces, inheritance relationships, and method signatures. Focus on the object-oriented design."
  },
  "api-architecture": {
    name: "API Architecture",
    description: "Create an API Architecture diagram showing all REST/GraphQL endpoints, route structure, middleware layers, authentication flow, and request/response patterns."
  },
  "database-er": {
    name: "Database ER",
    description: "Create a Database ER Diagram showing entity relationships, tables, columns, foreign keys, and data model structure based on ORM models or schema definitions."
  }
};
