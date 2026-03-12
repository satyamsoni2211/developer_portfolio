# 🖥️ Developer Terminal Portfolio

[![React](https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com)
[![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vite.dev)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

**A modern, interactive developer portfolio template** where visitors navigate your profile exactly like a real terminal — `cd projects`, `ls skills`, `cat experience.txt` and more!

Stand out instantly from boring scrollable portfolios. Built with React 19, TypeScript, Tailwind CSS, Vite, Framer Motion & Radix UI.

**[🔗 Live Demo](https://www.satyamsoni.com)** • **[⭐ Star the Repo](https://github.com/satyamsoni2211/developer_portfolio)** • **[Fork & Use as Template](https://github.com/satyamsoni2211/developer_portfolio/fork)**

![Terminal Demo](thumbnails/terminal-demo.gif)

> _Tip: Record a quick 10–15 second GIF of someone typing `cd projects` → `ls` → `cat ...` and replace the image above. It dramatically increases engagement on GitHub._

## ✨ Features

- 🖥️ Full terminal-like experience with **tab completion**, **command history**, and classic commands
- 🌐 Every portfolio section is a "directory" you can `cd` into
- 📱 Fully responsive + automatic dark/light mode support
- 💼 Filterable & categorized projects showcase with tech badges
- 🛠️ Beautiful skills section with icons and proficiency levels
- 📧 Validated contact form (React Hook Form + Zod)
- ♿ Accessible (WCAG compliant) & SEO-friendly
- ⚡ Lightning fast thanks to Vite + modern React

## 🖥️ Terminal Commands Cheat Sheet

```bash
satyam@portfolio:~$ help
# Shows this exact command list
```

| Command         | What it does                      | Example                     |
| --------------- | --------------------------------- | --------------------------- |
| `help`          | List all available commands       | `help`                      |
| `ls` / `dir`    | Show available sections & files   | `ls`                        |
| `cd <section>`  | Navigate to a section             | `cd projects`               |
| `cd ..`         | Go back to parent directory       | `cd ..`                     |
| `pwd`           | Print current working directory   | `pwd`                       |
| `cat <file>`    | Display file contents             | `cat about.txt`             |
| `whoami`        | Show your personal info           | `whoami`                    |
| `clear` / `cls` | Clear the terminal screen         | `clear`                     |
| `history`       | Show previous commands            | `history`                   |
| `neofetch`      | Display stylized system/info card | `neofetch` (fun easter egg) |

**Pro moves**: Press **Tab** to autocomplete • Use **↑ / ↓** arrows for command history

## 🚀 Quick Start

### 1. Clone & Install

```bash
git clone https://github.com/satyamsoni2211/developer_portfolio.git
cd developer_portfolio
npm install
```

### 2. Development

```bash
npm run dev
```

→ Open http://localhost:5173

### 3. Production Build

```bash
npm run build
```

## 🛠️ Personalization (takes ~5–10 minutes)

All important content lives in these files:

| File                  | What to change                                        |
| --------------------- | ----------------------------------------------------- |
| `src/lib/config.ts`   | Name, tagline, bio, social links, email, prompt style |
| `src/lib/projects.ts` | Your projects (title, desc, tech, links, image)       |
| `src/lib/skills.ts`   | Tech stack, icons, proficiency levels                 |
| `public/images/`      | Add your project screenshots & profile pic            |

**Example – adding a project** (`src/lib/projects.ts`):

```ts
export const projects = [
  {
    title: "TaskFlow – Smart Todo App",
    description: "AI-powered task manager with natural language input",
    tech: ["React", "TypeScript", "Tailwind", "Supabase"],
    liveUrl: "https://taskflow.example.com",
    githubUrl: "https://github.com/username/taskflow",
    image: "/images/taskflow-preview.png",
  },
  // ...
];
```

## 🚀 One-Click Deployment Options

- **Vercel** (recommended) → Connect GitHub repo → Deploy
- **Netlify** → Drag & drop or connect repo (netlify.toml included)
- **GitHub Pages** → Works after build

## 📁 Folder Structure Overview

```
src/
├── components/
│   └── terminal/           ← core terminal + command handlers
├── lib/
│   ├── config.ts           ← ← most important file!
│   ├── projects.ts
│   └── skills.ts
├── hooks/
├── styles/
└── App.tsx
```

## 🤝 Contributing

Bug reports, new command ideas, design improvements, or theme suggestions are very welcome!

1. Fork the repo
2. Create your feature branch (`git checkout -b feature/amazing-command`)
3. Commit your changes (`git commit -m 'Add some amazing command'`)
4. Push to the branch (`git push origin feature/amazing-command`)
5. Open a Pull Request

## 📜 License

MIT © [Satyam Soni](https://github.com/satyamsoni2211)

---

Made with ❤️ and way too much time spent typing `cd` instead of clicking
