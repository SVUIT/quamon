# Quamon

A compact browser-based grade management app built with React and TypeScript.

Quamon helps students manage semesters, subjects, and weighted grade calculations with automatic local persistence.

---

## Features

- Semester and subject management
- Weighted average calculations
- Searchable course catalog
- Custom subject creation
- Automatic localStorage persistence
- Fast React + Vite workflow
- Type-safe architecture with TypeScript

---

## Quick Start

### Prerequisites

- Node.js 18+
- pnpm

Install pnpm globally if needed:

```bash
npm install -g pnpm
```

---

## Installation

Clone the repository:

```bash
git clone [<your-repo-url>](https://github.com/SVUIT/quamon/tree/feat/pnpm-update)
cd quamon
```

Install dependencies:

```bash
pnpm install
```

Start the development server:

```bash
pnpm dev
```

---

## Available Scripts

| Command | Description |
|---|---|
| `pnpm dev` | Start the development server |
| `pnpm build` | Build the project for production |
| `pnpm preview` | Preview the production build |
| `pnpm lint` | Run ESLint |

---

## Usage

1. Add a semester using the "Add Semester" row.
2. Add subjects from the searchable catalog or create custom subjects.
3. Open a subject to edit scores and weight distributions.
4. Review weighted semester averages and the overall average.
5. Data is automatically saved to localStorage.

---

## Build

Create a production build:

```bash
pnpm build
```

Preview the production build locally:

```bash
pnpm preview
```

---
