# AI-Powered Ticket Management System

[![Ask DeepWiki](https://devin.ai/assets/askdeepwiki.png)](https://deepwiki.com/garv-mittal/AI-Ticket-Management-System)

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

## Getting Started

### Prerequisites

*   Node.js (v18 or higher)
*   npm or yarn
*   A MongoDB database (local or cloud-based)
*   Google Gemini API Key
*   A Mailtrap account (for testing email notifications)

### Backend Setup (`ai-ticket-assistant`)

1.  **Clone the repository:**
    ```sh
    git clone https://github.com/garv-mittal/AI-Ticket-Management-System.git
    cd AI-Ticket-Management-System/ai-ticket-assistant
    ```

2.  **Install dependencies:**
    ```sh
    npm install
    ```

3.  **Create and configure the environment file:**
    Create a `.env` file in the `ai-ticket-assistant` directory and add the following variables:
    ```env
    PORT=3000
    MONGO_URI="your_mongodb_connection_string"
    JWT_SECRET="your_strong_jwt_secret"
    GEMINI_API_KEY="your_google_gemini_api_key"

    # Mailtrap Credentials
    MAILTRAP_HOST="sandbox.smtp.mailtrap.io"
    MAILTRAP_PORT=2525
    MAILTRAP_USER="your_mailtrap_user"
    MAILTRAP_PASS="your_mailtrap_password"
    ```

4.  **Run the backend server:**
    ```sh
    npm run dev
    ```
    The server will be running on `http://localhost:3000`.

5.  **Run the Inngest Dev Server:**
    In a separate terminal, run the Inngest development server. This allows you to see events and function logs in real-time at `http://localhost:8288`.
    ```sh
    npm run inngest-dev
    ```

### Frontend Setup (`ai-ticket-frontend`)

1.  **Navigate to the frontend directory:**
    ```sh
    cd ../ai-ticket-frontend
    ```

2.  **Install dependencies:**
    ```sh
    npm install
    ```

3.  **Create the environment file:**
    Create a `.env` file in the `ai-ticket-frontend` directory and add the following:
    ```env
    VITE_SERVER_URL=http://localhost:3000/api
    ```

4.  **Run the frontend development server:**
    ```sh
    npm run dev
    ```
    The frontend will be available at `http://localhost:5173`.

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
