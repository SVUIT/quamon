# Grade Calculator

A compact, browser-based grade management app built with React and TypeScript. Track semesters and subjects and calculate weighted averages with local persistence — no account required.

Table of contents

- [Features](#features)
- [Quick start](#quick-start)
- [Usage](#usage)
- [Developer notes](#developer-notes)
- [Contributing](#contributing)
- [License](#license)


Quick start

Prerequisites: Node 18+ and a package manager (npm, pnpm, or yarn).

Install dependencies and start the dev server:

```bash
npm install
npm run dev
```

Useful scripts

- `npm run dev` — start the development server (HMR)
- `npm run build` — compile TypeScript and build for production (`tsc -b && vite build`)
- `npm run preview` — preview the production build locally
- `npm run lint` — run ESLint across the project

Usage

1. Click the Add Semester row to append a new semester.
2. Use the searchable dropdown to add a course from the catalog or create a custom subject.
3. Click a subject to open the advanced editor and set scores/weights per component.
4. Review the Summary rows for weighted semester averages and the overall average.
5. Close the app or reload the page — your data is automatically saved to `localStorage`.

Developer notes

- State and persistence: `src/hooks/useGradeApp.ts`
- Grade and score calculations: `src/utils/gradeUtils.ts`
- Course catalog: `src/assets/courses_weighted.json`

If you add or change fields related to scores or weights, add tests or manually verify behavior in the UI to avoid regressions.

Contributing

Contributions are welcome. Please open an issue to discuss larger changes, or submit a pull request for smaller fixes and improvements.

License

No license is included in this repository. To add one, create a `LICENSE` file with your preferred open-source license.

