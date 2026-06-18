/**
 * Accessana AI - Barrel Export File
 * --------------------------------
 * This file centralizes all AI-related exports:
 * - API route handlers (chat, places)
 * - Shared TypeScript types (ChatResponse, PlacesResponse, etc.)
 *
 * Use it for clean imports throughout your app:
 *   import { ChatResponse, PlacesResponse } from "@/app/api/ai";
 */

export * from "@/types/ai"; // Shared types (AccessiblePlace, ChatResponse, etc.)

// Optional: Re-export route handlers for programmatic access if needed
// (Normally these are used by Next.js routing automatically.)
export { POST as chatHandler } from "./chat/route";
export { POST as placesHandler } from "./places/route";
