# AI-Powered Ticket Management System


This repository contains a full-stack AI-Enhanced Ticket Management System. The application leverages AI to automatically triage, analyze, and assign support tickets, streamlining the workflow for support teams. It features a Node.js backend with Express, MongoDB, and Inngest for event-driven background processing, and a React frontend built with Vite and Tailwind CSS.

## Core Features

*   **User Authentication**: Secure signup and login functionality using JWT.
*   **Role-Based Access Control**: Differentiates between `user`, `moderator`, and `admin` roles, each with specific permissions.
*   **Ticket Creation & Management**: Users can create tickets, while moderators and admins can view and manage them.
*   **AI-Powered Triage**:
    *   Utilizes **Google's Gemini model** via the Inngest Agent Kit.
    *   Automatically analyzes new ticket content to generate a concise summary and determine priority (`low`, `medium`, `high`).
    *   Identifies relevant technical skills required to resolve the ticket (e.g., "React", "MongoDB").
    *   Provides helpful notes and potential resources for the assigned moderator.
*   **Automated Ticket Assignment**:
    *   Leverages **Inngest** for reliable background job processing.
    *   Intelligently assigns tickets to moderators based on skill matching.
    *   Falls back to an `admin` if no suitable moderator is found.
*   **Automated Email Notifications**:
    *   Sends a welcome email to new users upon signup.
    *   Notifies moderators via email when they are assigned a new ticket.
*   **Admin Dashboard**: A simple interface for admins to view all users and update their roles and skills.

## How It Works

The system's automated workflow is orchestrated by Inngest events:

1.  **Ticket Creation**: A user submits a new ticket through the React frontend. The backend creates a ticket record and immediately sends a `ticket/created` event to Inngest.
2.  **Inngest Function Trigger**: The `onTicketCreated` Inngest function is triggered in the background.
3.  **AI Analysis**: The function calls the `analyzeTicket` utility, which uses the Inngest Agent Kit to prompt the Gemini AI model with the ticket's title and description.
4.  **Enrichment**: The AI returns a structured JSON object containing a `summary`, `priority`, `helpfulNotes`, and an array of `relatedSkills`. The ticket is updated in MongoDB with this new information.
5.  **Assignment**: The system queries the user database to find a `moderator` whose skills match the `relatedSkills` identified by the AI. The ticket is then assigned to that moderator. If no match is found, it's assigned to an `admin`.
6.  **Notification**: An email is sent to the assigned moderator/admin to notify them of the new ticket.

This entire process happens asynchronously without blocking the user interface, providing a seamless experience.

## Tech Stack

### Backend (`ai-ticket-assistant`)

*   **Framework**: Node.js, Express.js
*   **Database**: MongoDB with Mongoose ODM
*   **Background Jobs & Events**: Inngest
*   **AI Integration**: Inngest Agent Kit with Google Gemini
*   **Authentication**: JSON Web Tokens (JWT), Bcrypt
*   **Emailing**: Nodemailer (with Mailtrap for development)
*   **Environment Variables**: dotenv

### Frontend (`ai-ticket-frontend`)

*   **Library/Framework**: React
*   **Build Tool**: Vite
*   **Styling**: Tailwind CSS, daisyUI
*   **Routing**: React Router
*   **Linting**: ESLint


## Project Structure

```
.
├── ai-ticket-assistant/        # Backend Node.js application
│   ├── controllers/            # Route handlers (logic)
│   ├── inngest/                # Inngest client and functions
│   │   ├── functions/
│   │   └── client.inngest.js
│   ├── middleware/             # Express middleware (e.g., auth)
│   ├── models/                 # Mongoose schemas
│   ├── routes/                 # API route definitions
│   └── utils/                  # Utility functions (AI, mailer)
└── ai-ticket-frontend/         # Frontend React application
    └── src/
        ├── components/         # Reusable React components
        ├── pages/              # Page components for each route
        └── main.jsx            # App entrypoint and router setup
