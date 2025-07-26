# Web3-Enabled Snake Game Application

## Overview

This is a modern Snake game application built with a React frontend, Express.js backend, and full Web3 integration with the Monad blockchain. The application features multiple game modes including Classic Snake, Portal mode with teleportation, and Speed Boost mode. Players must pay 1 MON token to play and can earn NFT rewards for scores over 100. High scores are stored on-chain with smart contract integration. Uses a PostgreSQL database with Drizzle ORM for additional data persistence and includes a comprehensive UI component library built with shadcn/ui.

## Recent Changes (July 22, 2025)

### Latest Web3 Features Implementation:
✓ Updated chain ID to 10143 (0x279f) for Monad Testnet compatibility
✓ Enhanced submitScore() function with ethers.js transaction handling
✓ Implemented "Minted NFT!" success notification system
✓ Created blockchain leaderboard fetching scores from multiple wallet addresses
✓ Added conditional "You earned 1 MON!" message for scores >= 50
✓ Real-time wallet balance updates after earning rewards
✓ Event parsing for smart contract reward and NFT minting confirmations

## Previous Changes

### Web3 Integration Completed:
✓ Full Monad blockchain integration with smart contracts
✓ MetaMask wallet connection with automatic network switching  
✓ 1 MON token payment system to start games
✓ On-chain high score storage and tracking
✓ NFT minting system for scores over 100 points
✓ Mock MON token with faucet for testing
✓ Complete Web3 user interface and game flow
✓ Updated to Monad Testnet Chain ID 2141 (0x85d) as requested
✓ Implemented submitScore() smart contract function with ethers.js
✓ Added "Minted NFT!" success message on game completion
✓ Created blockchain leaderboard using getHighScore() for multiple wallets
✓ Added "You earned 1 MON!" notification for scores >= 50 with balance updates
✓ Updated smart contract to emit ScoreSubmitted events with reward flags
✓ Created Web3Leaderboard component showing on-chain high scores

### Game Features:
✓ Replaced "No Wall" with "Speed Boost" - ultra-fast challenge mode
✓ Classic mode - traditional snake where hitting walls ends the game
✓ Portal mode - snake wraps around screen edges with 2x score bonus
✓ Speed Boost mode - significantly faster gameplay with 1.5x score bonus
✓ Visual game mode indicators in header with color coding
✓ Enhanced settings panel with mode descriptions
✓ Fixed critical input handling bug that caused unexpected game overs
✓ Implemented input throttling to prevent rapid direction changes
✓ Added pending direction queue system for smooth gameplay

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **UI Library**: shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with custom color scheme for dark theme
- **State Management**: React hooks with custom game logic
- **Data Fetching**: TanStack Query (React Query) for server state management
- **Routing**: Wouter for lightweight client-side routing
- **Build Tool**: Vite for development and production builds

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **Database**: PostgreSQL with Neon serverless driver
- **ORM**: Drizzle ORM for type-safe database operations
- **Validation**: Zod for runtime type checking
- **Session Storage**: PostgreSQL-based session store
- **Development**: Hot module replacement with Vite integration

### Database Schema
The application uses two main tables:
- **users**: Stores user authentication data (id, username, password)
- **high_scores**: Tracks game scores with player name, score, game time, snake length, and timestamp

## Key Components

### Game Engine (`use-game` hook)
- Canvas-based rendering system using HTML5 Canvas API
- Game state management with snake position, food placement, and collision detection
- Multiple difficulty levels affecting game speed
- Real-time score calculation and game timer
- Keyboard and touch input handling

### High Score System
- RESTful API endpoints for score management
- Real-time leaderboard updates
- Player-specific score tracking
- Persistent storage with PostgreSQL

### Mobile Support
- Touch-based directional controls
- Responsive design adapting to mobile screens
- Haptic feedback for mobile devices
- Mobile-optimized UI components

### UI Components
- Comprehensive component library from shadcn/ui
- Custom game-specific components (GameCanvas, MobileControls, GameStats, Leaderboard)
- Dark theme optimized for gaming experience
- Toast notifications for user feedback

## Data Flow

1. **Game Initialization**: Game state is initialized with default snake position and random food placement
2. **User Input**: Keyboard arrows or touch controls update snake direction
3. **Game Loop**: Canvas renders game state at specified intervals based on difficulty
4. **Score Calculation**: Points awarded for food consumption, bonus for speed and length
5. **Game Over**: Final score submitted to backend API
6. **Leaderboard Update**: High scores fetched and displayed in real-time

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: PostgreSQL serverless driver for Neon
- **@tanstack/react-query**: Server state management and caching
- **drizzle-orm**: Type-safe SQL query builder and ORM
- **wouter**: Lightweight routing library
- **zod**: Runtime type validation

### UI Dependencies
- **@radix-ui/***: Headless UI component primitives
- **tailwindcss**: Utility-first CSS framework
- **class-variance-authority**: Utility for creating type-safe component variants
- **cmdk**: Command palette component

### Development Dependencies
- **vite**: Build tool and development server
- **typescript**: Static type checking
- **esbuild**: Fast JavaScript bundler for production

## Deployment Strategy

### Development Environment
- Vite development server with hot module replacement
- TypeScript compilation and type checking
- Environment variables for database connection
- Replit-specific development tools and error handling

### Production Build
1. **Frontend Build**: Vite bundles React application with optimizations
2. **Backend Build**: esbuild compiles TypeScript server code to ESM
3. **Static Serving**: Express serves built frontend assets
4. **Database Migrations**: Drizzle handles schema changes and migrations

### Environment Configuration
- Database URL configuration via environment variables
- Separate development and production database instances
- Session management with PostgreSQL store
- CORS and security headers for production deployment

The application is designed to run seamlessly on Replit with automatic database provisioning and deployment capabilities.