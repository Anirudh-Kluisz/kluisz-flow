# Kluisz AI Studio

## Project Overview
A React-based web application for building and comparing agentic AI workflows. The app provides a visual studio interface for creating intelligent AI agents that work together.

## Recent Changes
- **2024-09-24**: Initial import from GitHub and configured for Replit environment
  - Configured Vite server to use port 5000 and host 0.0.0.0 for Replit compatibility
  - Set up frontend workflow for development server
  - Confirmed application runs successfully in Replit environment

## User Preferences
- No specific user preferences documented yet

## Project Architecture
- **Frontend**: React 18 with TypeScript
- **Build Tool**: Vite
- **UI Framework**: shadcn-ui + Tailwind CSS
- **Routing**: React Router DOM
- **State Management**: Zustand + TanStack Query
- **Styling**: Dark theme with Kluisz.ai brand colors (electric blue primary, mint accent)

### Key Features
- Landing page with chat interface
- Visual workflow studio with canvas-based editing
- Component library with shadcn-ui components
- Responsive design with mobile support
- AI workflow visualization and comparison tools

### Project Structure
- `src/pages/` - Main application pages (Index, Studio, Compare, RunDetail)
- `src/components/` - Reusable UI components organized by feature
- `src/components/ui/` - shadcn-ui component library
- `src/assets/` - Static assets including hero images
- `src/stores/` - Zustand state management
- `src/utils/` - Utility functions and mock data generators

### Development
- Uses npm for package management
- Development server runs on port 5000 (configured for Replit)
- Hot reload enabled with Vite
- TypeScript for type safety
- ESLint for code quality

### Dependencies
- No backend or database dependencies
- Pure frontend React application
- All functionality is client-side