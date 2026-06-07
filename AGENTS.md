# AGENT.md

## Purpose

Quamon is a TypeScript-based academic planning and GPA management platform.

Core features:

- Semester and course tracking
- GPA and weighted score calculations
- Required-score forecasting
- PDF transcript import through Appwrite Functions

Primary goals:

- Accurate calculations
- Predictable behavior
- Strong type safety
- Safe deployments
- Minimal regressions

---

## Tech Stack

### Frontend

- Next.js (App Router)
- React
- TypeScript
- Tailwind CSS

### Backend

- Next.js Route Handlers
- Appwrite
- Appwrite Functions

### CI/CD

- GitHub Actions
- Appwrite Sites

---

## Architecture

### UI Layer

```text
src/app/
src/components/
```

Responsibilities:

- Rendering
- Forms
- User interaction

Keep business logic out of components whenever possible.

### Domain Layer

```text
src/utils/
src/types/
```

Responsibilities:

- GPA calculations
- Grade calculations
- Academic rules
- Shared business logic

### API Layer

```text
src/app/api/
```

Responsibilities:

- Validation
- Upload handling
- External integrations

### Infrastructure Layer

```text
src/config/
```

Responsibilities:

- Appwrite configuration
- Environment setup
- External services

---

## Critical Domain Rules

### Actual Scores vs Minimum Scores

This is the most important concept in the codebase.

Each subject contains two independent score groups:

```ts
interface Subject {
  // Actual scores
  progressScore: string;
  midtermScore: string;
  practiceScore: string;
  finalScore: string;

  // Calculated required scores
  minProgressScore: string;
  minMidtermScore: string;
  minPracticeScore: string;
  minFinalScore: string;
}
```

#### Actual Scores

Real scores entered by users or imported from PDFs.

Examples:

```ts
progressScore
midtermScore
practiceScore
finalScore
```

#### Minimum Scores

Calculated values showing what a student needs to achieve a target score.

Examples:

```ts
minProgressScore
minMidtermScore
minPracticeScore
minFinalScore
```

#### Rules

Always initialize minimum scores as:

```ts
""
```

Never:

```ts
"0"
```

Why:

```ts
"0"
```

is truthy and can override actual scores in the UI.

Display logic follows:

```ts
hasMinScore ? minScore : score
```

Minimum scores should only be populated by required-score calculations.

PDF imports must leave all minimum score fields empty.

---

## PDF Import Architecture

Flow:

```text
User
 ↓
Frontend
 ↓
API / Appwrite
 ↓
PDF Parser Function
 ↓
Structured Data
 ↓
Frontend
```

PDF parser repository:

https://github.com/SVUIT/grades-pdf-extractor

Correct transformation:

```ts
{
  progressScore: value?.toString() || "",
  minProgressScore: ""
}
```

Incorrect:

```ts
{
  progressScore: value?.toString() || "",
  minProgressScore: "0"
}
```

---

## Expected Score Feature

When a user enters an expected score:

1. System calculates missing required scores
2. Results are stored in `min*Score`
3. UI displays those values with special styling

Main logic:

```text
src/utils/gradeUtils.ts
```

Function:

```ts
calcRequiredScores()
```

---

## TypeScript Rules

### Do

- Use strict typing
- Reuse existing types
- Prefer interfaces for shared models
- Add return types to exported functions

Example:

```ts
export function calculateGpa(
  subjects: Subject[]
): number {
  ...
}
```

### Don't

- Use `any` unless unavoidable
- Duplicate existing types
- Bypass type checking

---

## React Rules

### Do

- Use functional components
- Keep components focused
- Prefer composition
- Keep state local

### Don't

- Mix UI and business logic
- Create large monolithic components
- Store unnecessary derived state

---

## API Rules

### Do

- Validate all inputs
- Return typed responses
- Handle failures gracefully

### Don't

- Expose secrets
- Trust client input
- Return raw errors

---

## Common Pitfalls

### Scores Are Strings

Scores are stored as strings.

Correct:

```ts
""
"8.5"
"10"
```

Not:

```ts
null
undefined
0
```

Convert only when calculating:

```ts
Number(score)
```

---

### "0" Is Truthy

Avoid assumptions like:

```ts
if (score) {
}
```

Use explicit checks when needed.

---

### Do Not Confuse Score Types

```ts
progressScore
```

Actual score.

```ts
minProgressScore
```

Calculated required score.

They serve different purposes.

---

### Missing Scores

Correct:

```ts
progressScore: ""
```

Incorrect:

```ts
progressScore: "0"
```

Use empty strings when data does not exist.

---

## Development Workflow

Before submitting changes:

```bash
pnpm install
pnpm lint
pnpm build
```

For calculation changes:

- Test normal inputs
- Test empty values
- Test edge cases
- Test PDF imports

---

## Key Files

Core Types:

```text
src/types/index.ts
```

Grade Logic:

```text
src/utils/gradeUtils.ts
```

Display Logic:

```text
src/components/GradeTable/SubjectRow.tsx
```

PDF Import:

```text
src/pages/Home.tsx
```

Appwrite:

```text
src/config/appwrite.ts
```

Architecture Docs:

```text
docs/architecture.md
```

---

## Protected Files

Do not modify without explicit human approval.

### CI/CD

```text
.github/workflows/*
```

### Appwrite

```text
src/config/appwrite.ts
```

### Authentication

```text
src/app/api/auth/**
```

### Framework Configuration

```text
next.config.*
package.json
pnpm-lock.yaml
eslint.config.*
prettier.config.*
postcss.config.*
```

---

## Preferred Agent Workflow

1. Read `docs/architecture.md`
2. Understand affected domain rules
3. Reuse existing types and patterns
4. Make the smallest reasonable change
5. Preserve API contracts
6. Run lint and build checks
7. Document non-obvious decisions

Avoid unrelated refactors.

---

## Agent Permissions

### AI Agents May

- Add features
- Fix bugs
- Improve type safety
- Add tests
- Improve documentation
- Refactor internal logic

### AI Agents Must Not

- Modify secrets
- Change Appwrite environments
- Change deployment targets
- Rewrite authentication flows
- Modify CI/CD infrastructure
- Change protected configuration files

Unless explicitly requested and reviewed by a human.

Updated 08/08/2026
