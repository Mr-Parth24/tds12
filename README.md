# Triode Data Systems (TDS) API Management Interface

This project provides a user-friendly frontend for managing API endpoints without writing code.

## Features

- Drag-and-drop API endpoint builder
- User authentication and role-based access
- Documentation viewer
- Admin dashboard for user management

## Getting Started

1. Install dependencies:
   ```
   npm install
   ```

2. Start the development server:
   ```
   npm start
   ```

3. Build for production:
   ```
   npm run build
   ```

## Project Structure

- `/src/assets`: Static assets like images and icons
- `/src/components`: Reusable UI components
- `/src/pages`: Page components corresponding to routes
- `/src/services`: API service functions
- `/src/hooks`: Custom React hooks
- `/src/context`: React context providers
- `/src/utils`: Utility functions
- `/src/styles`: Global styles
- `/src/mocks`: Mock data and API handlers
- `/src/routes`: Routing configuration
- `/src/constants`: Application constants
- `/src/firebase`: Firebase configuration and services

## Environment Variables

- `REACT_APP_API_URL`: Base URL for backend API
- `REACT_APP_USE_MOCK_API`: Whether to use mock API handlers (true/false)
- Firebase configuration variables for authentication
