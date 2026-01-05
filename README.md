# 🚀 CodeLabs - Cloud-Based IDE in your browser

</u><b><a href="https://code-labs.tech" target="_blank">🔗<u>code-labs.tech</u></a></b>

A modern, full-stack cloud IDE that enables developers to create, edit, and run projects directly in the browser with real-time containerized execution environments.

![React](https://img.shields.io/badge/React-20232A?style=flat&logo=react&logoColor=61DAFB) ![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat&logo=typescript&logoColor=white) ![Vite](https://img.shields.io/badge/Vite-646CFF?style=flat&logo=vite&logoColor=white) ![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=flat&logo=tailwind-css&logoColor=white) ![Socket.io](https://img.shields.io/badge/Socket.io-010101?style=flat&logo=socket.io&logoColor=white) ![Node.js](https://img.shields.io/badge/Node.js-339933?style=flat&logo=node.js&logoColor=white) ![Express](https://img.shields.io/badge/Express-000000?style=flat&logo=express&logoColor=white) ![Docker](https://img.shields.io/badge/Docker-2496ED?style=flat&logo=docker&logoColor=white) ![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=flat&logo=mongodb&logoColor=white) ![Firebase](https://img.shields.io/badge/Firebase-FFCA28?style=flat&logo=firebase&logoColor=black) ![Google Gemini](https://img.shields.io/badge/Google_Gemini-4285F4?style=flat&logo=google&logoColor=white) ![LLM](https://img.shields.io/badge/LLM-000000?style=flat&logo=llm&logoColor=white) ![Auth0](https://img.shields.io/badge/Auth0-EB5424?style=flat&logo=auth0&logoColor=white) ![Google Cloud](https://img.shields.io/badge/Google_Cloud-blue?logo=googlecloud) ![NGINX](https://img.shields.io/badge/NGINX-green?logo=nginx) ![GitHub Actions](https://img.shields.io/badge/GitHub_Actions-2088FF?style=flat&logo=github-actions&logoColor=white) ![Ubuntu](https://img.shields.io/badge/Ubuntu-orange?logo=ubuntu) ![Docker Hub](https://img.shields.io/badge/Docker-Hub-blue?logo=docker) ![SSH](https://img.shields.io/badge/SSH-blue?logo=openssh)



## ✨ Features

- **Multi-Project Support** - Create projects with different tech stacks or frameworks (React, Node.js, Express, Next.js)
- **File Management** - Complete file explorer with create, rename, delete operations
- **Integrated Code Editor** - Powerful code edior that sync with cloud in real-time
- **Browser Terminal** - Full terminal access with Docker containerization
- **AI Chat Bot** - Integrated AI chat bot powered by Gemini for coding queries
- **Authentication** - Secure login with Auth0 auth library
- **Cloud Storage** - Projects stored in Google Firebase Cloud Storage
- **Real-time Connection** - WebSockets for real-time persistent connection with the server
- **Contanerization** - All user projects run in isolated docker contaiers
- **Project Live Preview** - Currently in development, will allow users to preview their projects live in the browser

## 🛠️ Tech Stack

### Frontend

- ![React](https://img.shields.io/badge/React-20232A?style=flat&logo=react&logoColor=61DAFB) **React 18** - UI framework
- ![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat&logo=typescript&logoColor=white) **TypeScript** - Type safety
- ![Vite](https://img.shields.io/badge/Vite-646CFF?style=flat&logo=vite&logoColor=white) **Vite** - Build tool
- ![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=flat&logo=tailwind-css&logoColor=white) **Tailwind CSS** - Styling
- ![Socket.io](https://img.shields.io/badge/Socket.io-010101?style=flat&logo=socket.io&logoColor=white) **Socket.IO Client** - Real-time communication

### Backend

- ![Node.js](https://img.shields.io/badge/Node.js-339933?style=flat&logo=node.js&logoColor=white) **Node.js** - Runtime environment
- ![Express](https://img.shields.io/badge/Express-000000?style=flat&logo=express&logoColor=white) **Express.js** - Web framework
- ![Socket.io](https://img.shields.io/badge/Socket.io-010101?style=flat&logo=socket.io&logoColor=white) **Socket.IO** - WebSocket server
- ![Docker](https://img.shields.io/badge/Docker-2496ED?style=flat&logo=docker&logoColor=white) **Docker** - Containerization
- ![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat&logo=typescript&logoColor=white) **TypeScript** - Type safety

### Database & Storage

- ![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=flat&logo=mongodb&logoColor=white) **MongoDB** - Database
- ![Firebase](https://img.shields.io/badge/Firebase-FFCA28?style=flat&logo=firebase&logoColor=black) **Firebase Storage** - File storage

### AI Integration
- ![Google Gemini](https://img.shields.io/badge/Google_Gemini-4285F4?style=flat&logo=google&logoColor=white) **Gemini API** - AI chat bot for coding queries
- ![LLM](https://img.shields.io/badge/LLM-000000?style=flat&logo=llm&logoColor=white) **Large Language Model** - gemini-2.5-flash

### Authentication & Deployment

- ![Auth0](https://img.shields.io/badge/Auth0-EB5424?style=flat&logo=auth0&logoColor=white) **Auth0** - Authentication
- ![Google Cloud](https://img.shields.io/badge/Google_Cloud-blue?logo=googlecloud) **Google Cloud** - Virtual Machine (VM)
- ![Docker](https://img.shields.io/badge/Docker-2496ED?style=flat&logo=docker&logoColor=white) **Docker** - Containerized App
- ![NGINX](https://img.shields.io/badge/NGINX-green?logo=nginx) **Nginx** - Reverse proxy & web server
- ![GitHub Actions](https://img.shields.io/badge/GitHub_Actions-2088FF?style=flat&logo=github-actions&logoColor=white) **GitHub Actions** - CI/CD
- ![Ubuntu](https://img.shields.io/badge/Ubuntu-orange?logo=ubuntu) **Ubuntu OS v24.04 - Operating System**
- ![Docker](https://img.shields.io/badge/Docker-Hub-blue?logo=docker) **Docker Hub - Image registry**
- ![SSH](https://img.shields.io/badge/SSH-blue?logo=openssh) **SSH - Remote access to VM**
- ![Certbot](https://img.shields.io/badge/Certbot-Let’s_Encrypt-003A8F?style=flat&logo=letsencrypt&logoColor=white) **SSL/TLS Encryption - HTTPS**

## 🔄 Application Flow

#### 1. **User Authentication**

```mermaid
graph LR
    A[User Login] --> B[Auth0 Verification]
    B --> C[JWT Token]
    C --> D[User Session]
```

#### 2. **Project Creation**

```mermaid
graph LR
    A[Select Tech Stack] --> B[Create Project]
    B --> C[Copy Base Template]
    C --> D[Store in Firebase]
    D --> E[Update Database]
```

#### 3. **IDE Workflow**

```mermaid
graph LR
    A[Open Project] --> B[Load File Structure]
    B --> C[Create Docker Container]
    C --> D[Mount Project Files]
    D --> E[Initialize Terminal]
    E --> F[Start Coding]
    F --> G[Real-time Sync]
```

#### 4. **File Operations**

```mermaid
graph LR
    A[File Action] --> B[Frontend Update]
    B --> C[WebSocket Event]
    C --> D[Docker Container]
    D --> E[Firebase Sync]
    E --> F[UI Refresh]
```

## 🚀 Getting Started

### Prerequisites

- Node.js
- Docker
- MongoDB
- Firebase account
- Auth0 account
- Gemini API key

### Installation

#### Using Docker Compose

1. **Clone the repository**

```bash
git clone <repository-url>
cd codelabs
```

2. **Configure Environment Variables**

```bash
# Back-end (.env)
PORT=5000
MONGODB_URI=mongod://127.0.0.1:27017
AUTH0_DOMAIN=#
## Firebase Secrets
apiKey=#
authDomain=#
projectId=#
storageBucket=#
messagingSenderId=#
appId=#
measurementId=#
FB_SECRETS_JSON=#  Firebase service account JSON string

GEMINI_API_KEY=#

# Frontend (.env)
VITE_SERVER_URL=http://localhost:5000
VITE_AUTH0_DOMAIN=#
VITE_AUTH0_CLIENT_ID=#
VITE_REDIRECT_URI=http://localhost:5173/home
```

3. **Run with Docker Compose**

```bash
docker-compose up --build
```

#### Manual Development Setup

1. **Setup Backend**

```bash
cd back-end
npm install
```

2. **Start Backend**

```bash
cd back-end
npm run dev
```

3. **Setup Frontend**

```bash
cd front-end
npm install
```

4. **Start Frontend**

```bash
cd front-end
npm run dev
```

## 🌐 Connect
- ##### LinkedIn: [Aman Tiwari](https://www.linkedin.com/in/aman-tiwari001/)
- ##### X: [@aman_tiwari001](https://x.com/aman_tiwari100)
- ##### Email: <a href="mailto:amananjalitiwari2007@gmail.com">amananjalitiwari2007@gmail.com</a>

---
**Built with ❤️‍🔥 by Aman Tiwari**
