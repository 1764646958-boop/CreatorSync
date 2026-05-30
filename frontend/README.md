# CreatorSync Frontend

CreatorSync frontend is a Next.js App Router application shell for the multi-platform content publishing assistant. This PR intentionally includes only the UI container, layout, and placeholders; it does not connect APIs or implement publishing business logic.

## Stack and Dependencies

- [Next.js](https://nextjs.org/) with App Router
- [React](https://react.dev/)
- [TypeScript](https://www.typescriptlang.org/)
- [TailwindCSS](https://tailwindcss.com/)
- PostCSS and Autoprefixer for Tailwind processing

## Local Development

Install dependencies from the `frontend` directory:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Open the local URL printed by Next.js, usually <http://localhost:3000>.

## Available Scripts

- `npm run dev` - start the local Next.js development server.
- `npm run build` - create a production build.

## Environment Variables

No environment variables are required for the current frontend shell.

## Source Note

No historical business code, personal templates, or old prompts were reused. The SaaS layout and CreatorSync workspace structure are original to this repository.
