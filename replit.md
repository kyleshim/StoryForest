# StoryForest - Children's Book Management Platform

## Overview
A comprehensive digital platform designed to help parents curate, manage, and enhance their children's reading experiences through innovative book collection management and interactive features.

## Project Architecture
- **Frontend**: React with TypeScript, Vite build system
- **Backend**: Node.js with Express
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Clerk for user management
- **Styling**: Tailwind CSS with Shadcn/ui components
- **State Management**: TanStack Query for server state

## Recent Changes
- **2025-10-01**: ✅ Added interactive search functionality to landing page with tabbed interface (Search Books / Scan ISBN)
- **2025-10-01**: ✅ Created public API endpoints `/api/public/books/search` and `/api/public/books/isbn/:isbn` for unauthenticated access
- **2025-10-01**: ✅ Implemented PublicBookSearch and PublicIsbnScanner components for landing page
- **2025-10-01**: ✅ Configured sign-up prompts when unauthenticated users try to add books to library
- **2025-10-01**: ✅ Fixed tab state persistence - search results now persist when switching between tabs
- **2025-10-01**: ✅ Added public landing page for unauthenticated users with featured books
- **2025-10-01**: ✅ Created `/api/books/featured` public endpoint for fetching children's books
- **2025-10-01**: ✅ Updated auth middleware to allow public access to public endpoints
- **2025-10-01**: ✅ Fixed camera staying active after closing ISBN scanner dialog
- **2025-01-28**: ✅ Successfully updated book thumbnails to use `object-contain` instead of `object-cover`
- **2025-01-28**: ✅ Modified `client/src/components/book-card.tsx` to show full images without cropping
- **2025-01-28**: ✅ Created demonstration file at `/thumbnail-test.html` showing before/after comparison
- **2025-01-28**: ✅ Maintained consistent container sizes while preserving image aspect ratios
- **2025-01-28**: Added proper Clerk environment variables (VITE_CLERK_PUBLISHABLE_KEY, CLERK_SECRET_KEY)

## Current Issues
- Clerk authentication initialization still has some issues in development mode (warning logs)
- Authentication may need additional configuration for production deployment

## User Preferences
- Book thumbnails should show full image without scaling, using constraining dimension as size
- Container sizes should remain consistent regardless of image dimensions

## Key Features
- Public landing page with featured children's books for unauthenticated users
- Interactive search on landing page (text search and ISBN scanning) for unauthenticated users
- Sign-up prompts when unauthenticated users try to add books to library
- Child profile management
- Book library and wishlist management
- Book recommendations and search
- ISBN barcode scanning for quick book addition
- Rating and review system
- Privacy settings for user profiles

## Technical Notes
- Uses object-contain for book thumbnails to preserve aspect ratio and show complete images
- Authentication required for all main app routes
- Database schema managed through Drizzle with migrations