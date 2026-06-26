# Abhishek Portfolio

> A modern, high-performance personal portfolio application engineered with React 18 and Vite, designed to showcase professional experience, technical skills, and projects with an emphasis on performance, accessibility, and user engagement.

[![Live Demo](https://img.shields.io/badge/Live-kaushik--abhishek.vercel.app-blue?style=for-the-badge&logo=vercel)](https://kaushik-abhishek.vercel.app/)
[![React](https://img.shields.io/badge/React-18.3-61DAFB?style=for-the-badge&logo=react)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-6.0-646CFF?style=for-the-badge&logo=vite)](https://vitejs.dev/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-3.4-06B6D4?style=for-the-badge&logo=tailwindcss)](https://tailwindcss.com/)

---

## Table of Contents

- [Architecture Overview](#architecture-overview)
- [Tech Stack](#tech-stack)
- [Features](#features)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Available Scripts](#available-scripts)
- [Deployment](#deployment)
- [Design Decisions](#design-decisions)
- [Contributing](#contributing)
- [License](#license)

---

## Architecture Overview

This application follows a **component-driven architecture** with a clear separation of concerns. Each UI section is encapsulated as an independent, reusable module within the `src/component/` directory, promoting maintainability and scalability.

```
┌─────────────────────────────────────────────────────┐
│                    App Shell                         │
│  ┌───────────────────────────────────────────────┐  │
│  │              Navbar (Navigation)               │  │
│  ├───────────────────────────────────────────────┤  │
│  │              About (Hero Section)              │  │
│  ├───────────────────────────────────────────────┤  │
│  │              Skills (Tech Stack)               │  │
│  ├───────────────────────────────────────────────┤  │
│  │              Experience (Timeline)             │  │
│  ├───────────────────────────────────────────────┤  │
│  │              Education (Academic)              │  │
│  ├───────────────────────────────────────────────┤  │
│  │              Contact (Form + EmailJS)          │  │
│  ├───────────────────────────────────────────────┤  │
│  │              Footer                            │  │
│  └───────────────────────────────────────────────┘  │
│  ┌───────────────┐  ┌────────────────────────────┐  │
│  │   BlurBlob    │  │        Chatbot (AI)        │  │
│  │  (Visual FX)  │  │    (Floating Assistant)    │  │
│  └───────────────┘  └────────────────────────────┘  │
└─────────────────────────────────────────────────────┘
```

---

## Tech Stack

| Layer          | Technology                         | Purpose                              |
|----------------|------------------------------------|--------------------------------------|
| **Runtime**    | React 18.3                         | UI component library with concurrent features |
| **Bundler**    | Vite 6.0                           | Next-gen build tool with native ESM & HMR |
| **Styling**    | Tailwind CSS 3.4 + PostCSS         | Utility-first CSS framework          |
| **Routing**    | React Router DOM 7.x               | Client-side routing & navigation     |
| **Animations** | React Parallax Tilt, Typing Effect | Interactive micro-interactions       |
| **Email**      | EmailJS                            | Serverless contact form integration  |
| **Icons**      | React Icons                        | Comprehensive icon library           |
| **Notifications** | React Toastify                  | User feedback & toast notifications  |
| **Linting**    | ESLint 9 + React plugins           | Code quality enforcement             |
| **Deployment** | Vercel                             | Edge-optimized hosting with CI/CD    |

---

## Features

- **Responsive Design** — Mobile-first approach ensuring optimal UX across all viewport sizes
- **Interactive Animations** — Parallax tilt effects and typing animations for enhanced engagement
- **AI Chatbot** — Integrated conversational assistant for visitor interaction
- **Contact Form** — Serverless email delivery via EmailJS (no backend required)
- **Performance Optimized** — Vite's tree-shaking, code-splitting, and lazy-loading capabilities
- **Visual Effects** — Custom blur blob overlays and CSS grid backgrounds for depth
- **Accessible Navigation** — Semantic HTML structure with keyboard-navigable components
- **Toast Notifications** — Real-time user feedback for form submissions and interactions

---

## Project Structure

```
abhishek-portfolio-app/
├── public/                     # Static assets served at root
├── src/
│   ├── assets/                 # Images, fonts, and media resources
│   ├── component/
│   │   ├── About/              # Hero section with typing effect
│   │   ├── Chatbot/            # AI-powered chatbot widget
│   │   ├── Contact/            # EmailJS-integrated contact form
│   │   ├── Education/          # Academic timeline
│   │   ├── Experience/         # Professional experience section
│   │   ├── Footer/             # Site footer with social links
│   │   ├── Navbar/             # Navigation bar with responsive menu
│   │   ├── Skills/             # Technical skills showcase
│   │   └── BlurBlob.jsx        # Reusable decorative blur effect
│   ├── constants.js            # Centralized data & configuration
│   ├── App.jsx                 # Root component & layout orchestrator
│   ├── App.css                 # Global component styles
│   ├── index.css               # Tailwind directives & base styles
│   └── main.jsx                # Application entry point
├── index.html                  # HTML template with mount point
├── vite.config.js              # Vite build configuration
├── tailwind.config.js          # Tailwind theme & plugin configuration
├── postcss.config.js           # PostCSS pipeline configuration
├── eslint.config.js            # ESLint flat config (v9)
├── package.json                # Dependencies & scripts
└── README.md                   # Project documentation (this file)
```

---

## Getting Started

### Prerequisites

- **Node.js** >= 18.x
- **npm** >= 9.x (or yarn/pnpm equivalent)

### Installation

```bash
# Clone the repository
git clone https://github.com/kaushik-abhishek/abhishek-portfolio-app.git

# Navigate to the project directory
cd abhishek-portfolio-app

# Install dependencies
npm install
```

### Environment Configuration

Create a `.env` file at the project root for EmailJS integration:

```env
VITE_EMAILJS_SERVICE_ID=your_service_id
VITE_EMAILJS_TEMPLATE_ID=your_template_id
VITE_EMAILJS_PUBLIC_KEY=your_public_key
```

---

## Available Scripts

| Command           | Description                                      |
|-------------------|--------------------------------------------------|
| `npm run dev`     | Start development server with HMR at `localhost:5173` |
| `npm run build`   | Create optimized production build in `dist/`     |
| `npm run preview` | Preview production build locally                 |
| `npm run lint`    | Run ESLint for code quality analysis             |

---

## Deployment

This application is deployed on **Vercel** with automatic CI/CD triggered on every push to `main`.

### Manual Deployment

```bash
# Build for production
npm run build

# The output `dist/` directory is ready for any static hosting provider
```

### Vercel (Recommended)

1. Connect the repository to [Vercel](https://vercel.com)
2. Framework Preset: **Vite**
3. Build Command: `npm run build`
4. Output Directory: `dist`
5. Set environment variables in the Vercel dashboard

---

## Design Decisions

| Decision | Rationale |
|----------|-----------|
| **Vite over CRA** | 10x faster cold starts, native ESM, superior HMR performance |
| **Tailwind CSS** | Eliminates CSS bloat, enforces design consistency, JIT compilation |
| **Component-per-feature** | Each section is self-contained for independent development & testing |
| **Centralized constants** | Single source of truth for content enables non-technical content updates |
| **EmailJS** | Eliminates need for backend server, reducing infrastructure complexity |
| **Flat ESLint config** | Future-proof configuration using ESLint v9's native flat config format |

---

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/enhancement`)
3. Commit changes with conventional commits (`git commit -m 'feat: add new section'`)
4. Push to the branch (`git push origin feature/enhancement`)
5. Open a Pull Request with a detailed description

---

## License

This project is open-source and available for reference and inspiration.

---

<p align="center">
  <strong>Designed & Engineered by <a href="https://github.com/kaushik-abhishek">Abhishek Kaushik</a></strong>
  <br />
  <sub>Built with precision. Deployed with confidence.</sub>
</p>
