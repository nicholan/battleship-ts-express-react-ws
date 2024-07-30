
---

# 🛳️ Multiplayer Battleship Game

Welcome to the Multiplayer Battleship Game! This web application allows you to play the classic game of Battleship with friends online or in singleplayer against AI! Built with modern web technologies, it offers a seamless, responsive, and accessible gaming experience. Try it at [https://battleship-nicholan.onrender.com/](https://battleship-nicholan.onrender.com/)!

## ✨ Features

- 🕹️ **Real-time Multiplayer Gameplay**: Play Battleship with friends in real-time through WebSockets.
- 🤖 **Singleplayer Gameplay**: You can also play against computer in offline mode!
- 🎨 **Responsive Design**: Optimized for all devices, from desktops to mobile phones.
- ♿ **Accessibility**: Designed with accessibility in mind to ensure a great experience for all users.
- 🔒 **Type-safe API Calls**: Utilizes tRPC and Zod for type-safe communication between frontend and backend.

## 🛠️ Tech Stack

- **Typescript**: Fully written in [Typescript](https://www.typescriptlang.org/)!
- **Frontend**: Built with [React](https://reactjs.org/), styled with [TailwindCSS](https://tailwindcss.com/), bundled with [Vite](https://vitejs.dev/).
- **Backend**: Backend running on [Express](https://expressjs.com/) and [Node.js](https://nodejs.org/).
- **Database**: [MongoDB](https://www.mongodb.com/)
- **WebSockets**: [ws](https://github.com/websockets/ws) for real-time multiplayer gameplay.
- **Data fetching**: [tRPC](https://trpc.io/) for End-to-end typesafe API.
- **Data validation**: [Zod](https://zod.dev/) for schema declarations and validation.
- **Testing**: [Vitest](https://vitest.dev/) for unit tests, [Playwright](https://playwright.dev/) for end-to-end testing.
- **Hosting**: Demo deployed and playable on [Render.com](https://battleship-nicholan.onrender.com/).

## 🚀 Quick installation

To quickstart a localhost demo of the app, follow these steps:

1. **Clone the repository**:
   ```bash
   git clone https://github.com/your-username/battleship-ts-express-react-ws.git
   cd battleship-ts-express-react-ws
   ```

2. **Install dependencies** using [pnpm](https://pnpm.io/):
   ```bash
   pnpm install
   ```

3. **Run the demo app**:
   ```bash
   pnpm start:demo
   ```

## 📖 Usage

Once the demo server is running, open your browser and navigate to `http://localhost:3000` to try out the app. 

## 🧪 Testing

- **Unit Tests**: Run unit tests with Vitest.
  ```bash
  pnpm test
  ```

- **End-to-End Tests**: Start the e2e testing server, then run tests with Playwright.
  ```bash
  pnpm start:e2e
  pnpm test:e2e
  ```
