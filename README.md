# Real-Time Chat App

A full-stack real-time chat application built with a Node.js/Express backend and a React frontend. Users can sign in with a username, send and receive chat messages in real time via WebSockets, like/unlike messages, and see who is currently online. JSON Web Tokens (JWT) are stored in secure, HttpOnly cookies to protect authentication credentials.  

---

## Table of Contents

1. [Features](#features)  
2. [Tech Stack](#tech-stack)  
3. [Project Structure](#project-structure)  
4. [Prerequisites](#prerequisites)  
5. [Installation](#installation)  
   - [Backend Setup](#backend-setup)  
   - [Frontend Setup](#frontend-setup)  
6. [Environment Variables](#environment-variables)  
7. [Database Setup (Prisma)](#database-setup-prisma)  
8. [Running the Application](#running-the-application)  
9. [Usage](#usage)  
10. [License](#license)  

---

## Features

- **User Authentication**  
  - Enter a unique username to join the chat; no password required.  
  - JWT is issued on login and stored in a secure, HttpOnly cookie (no sensitive token in localStorage).  
  - `/auth` endpoint verifies the JWT cookie to confirm the user is logged in.  

- **Real-Time Messaging**  
  - Messages are broadcast to all connected clients via WebSockets (using `ws`).  
  - When a new message is sent, it immediately appears in every client’s chat window.  

- **Message Likes / Unlikes**  
  - Users can like or unlike any chat message.  
  - Likes are stored in the database and updated in real time.  
  - Each message tracks a `likes` count and a list of usernames who liked it.  

- **Online User List**  
  - The app displays a sidebar with all connected usernames and their online/offline status.  
  - Status updates are broadcast via WebSocket whenever users connect or disconnect.  

- **Virtualized Lists**  
  - Both the message list and the user list use [React-Virtuoso](https://virtuoso.dev/) for efficient virtualization and smooth scrolling, even with large data sets.  

- **Secure Cookie-Based Auth**  
  - JWT is issued and stored only in an HttpOnly, SameSite cookie to mitigate XSS attacks.  
  - No authentication token is ever stored in `localStorage` or exposed to JavaScript.  

---

## Tech Stack

**Backend**  
- Node.js / Express  
- WebSocket server via `ws`  
- JWT authentication using `jsonwebtoken`  
- Cookie parsing via `cookie-parser` / `cookie`  
- ORM: [Prisma](https://www.prisma.io/) (SQLite/PostgreSQL/MySQL)  
- Rate limiting on login endpoint via `express-rate-limit`  
- CORS enabled with `cors` middleware  
- Environment configuration via `dotenv`  

**Frontend**  
- React (Create React App or Vite)  
- Hooks & functional components  
- Virtualized lists via [React-Virtuoso](https://virtuoso.dev/)  
- Icons via [`react-icons` (Material Design + FontAwesome)](https://react-icons.github.io/react-icons/)  
- CSS Modules for scoped styling  
- Fetch API & WebSockets for real-time communication  

---

## Project Structure
```bash
   /
   ├── Back-end/
   │ ├── index.js # Main Express + WebSocket server
   │ ├── prisma/ # Prisma schema & migrations
   │ │ └── schema.prisma
   │ ├── package.json # Backend dependencies & scripts
   │ └── .env # Environment variables (JWT_SECRET, DATABASE_URL)
   │
   └── front-end/
   ├── public/
   │ └── index.html
   ├── src/
   │ ├── App.js # Root React component
   │ ├── index.js # React entry point
   │ ├── components/
   │ │ ├── ChatPage/
   │ │ │ ├── ChatPage.js
   │ │ │ └── ChatPage.module.css
   │ │ ├── Message/
   │ │ │ ├── Message.js
   │ │ │ └── Message.module.css
   │ │ ├── MessageList/
   │ │ │ ├── MessageList.js
   │ │ │ └── MessageList.module.css
   │ │ └── UsersList/
   │ │ ├── UsersList.js
   │ │ └── UsersList.module.css
   │ ├── hooks/
   │ │ └── useChat.js # Custom hook handling WS & REST logic
   │ ├── Utils/
   │ │ └── api.js # Exports API_URL constant
   │ └── index.css # Global styles (optional)
   ├── package.json # Frontend dependencies & scripts
   └── .env # Environment variables (REACT_APP_API_URL if needed)
```
---

## Prerequisites

- **Node.js** (v14 or later)  
- **npm** or **Yarn**  
- **Git** (for cloning the repo)  
- **Prisma CLI** (installed globally or via `npx prisma`)  
- A supported database (SQLite, PostgreSQL, MySQL). This README will use SQLite by default.

---

## Installation
### Backend Setup

1. **Navigate to the backend folder**  
   ```bash
   cd Back-end
   ```

2. **Install dependencies**  
   ```bash
   npm install
   # or
   yarn install
   ```
3. **Configure environment variables**
    Create a file named .env in Back-end/ with at least the following:

    ```bash
    # Secret for signing JWTs
    JWT_SECRET=your_super_secret_key_here

    # Database connection string for Prisma
    # For SQLite (default development), you can use:
    DATABASE_URL="file:./dev.db"
    ```
4.**Initialize Prisma & migrate the database**

   ```bash
   npx prisma migrate dev --name init
   ```
   This will:
5. **Start the backend server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

### Frontend Setup

1. **Navigate to the front-end folder**  
   ```bash
   cd front-end
   ```

2. **Install dependencies**  
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Configure environment variables**
    Create a file named .env in front-end/ with at least the following:

    ```bash
    # URL of the backend API
    REACT_APP_API_URL=http://localhost:4000
    ```

4. **Start the frontend app**
   ```bash
   npm start
   # or
   yarn start
   ```

---

## Usage
Once the backend and frontend are set up, you can start the chat app by navigating to http://localhost:3000 in your browser.
1. **Login / Authentication**
   - Visit the homepage and enter a username.
   - On submit, the client calls POST /login { name }, the server issues a JWT cookie and responds { approved: true }.
   - The browser saves the JWT in an HttpOnly cookie; no token is exposed to JavaScript.
2. **Fetching Messages**
   - Upon successful login, the client calls GET /auth to verify the cookie and retrieve username.
   - Next, GET /messages fetches all existing messages. The client reverses them so the oldest appear first.
3. **WebSocket Connection**
   - Once authenticated, the client opens new WebSocket("ws://localhost:3000") (CRA proxy) or ws://localhost:4000 if no proxy.
   - The browser automatically sends the JWT cookie in the WebSocket handshake request.
   - The server validates the cookie, determines ws.username, and marks the user online.
4. **Real-Time Events**
   - **New Message:**: When a user types a message and clicks “Send”, client sends { type: "message", content, username } over WS.
        - Server stores it in the database via Prisma, retrieves the newly created message (with author info), and broadcasts { type: "newMessage", message } to all connected clients.
   - **Like/Unlike:** When a user clicks a like or unlike button, client sends { type: "like", messageId } or { type: "unlike", messageId } over WS.
        - Server updates the corresponding message in the database and broadcasts { type: "likeMessage", messageId } or { type: "unlikeMessage", messageId } to all connected clients.
        - Clients update their local messages array and their own likedSet accordingly.
   - **Online Users:** 
        - On every WS connect/disconnect, server updates UserStatus (Map<username, boolean>) and broadcasts { type: "users", data: Array<[username, online]> }.
        - Clients render that list in UserList.
5. **UI Components**
   - **Message List:** Virtualized list (React-Virtuoso) showing message bubbles in chronological order.
        - Each <Message> shows author name, text, timestamp, like button, and like count.
        - The “scroll to bottom” button (<FaArrowDown />) appears when the user scrolls up (not at bottom).
   - **UsersList:** Virtualized list of all users and their online/offline status.
   - **ChatPage:** Combines <MessageList> and <UsersList>, plus an input field and send button.
---
