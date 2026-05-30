# CreatorSync Frontend

CreatorSync frontend is a Next.js App Router workspace for the multi-platform content publishing assistant. The home page focuses on a review-friendly Demo loop: source input, platform selection, rewritten previews, mock publish feedback, and publish history export.

## Stack and Dependencies

- [Next.js](https://nextjs.org/) with App Router
- [React](https://react.dev/)
- [TypeScript](https://www.typescriptlang.org/)
- [TailwindCSS](https://tailwindcss.com/)
- PostCSS and Autoprefixer for Tailwind processing

No new third-party business dependencies are required for the UI polish work.

## Local Development

Install dependencies from the repository root or from the `frontend` workspace:

```bash
npm install
```

Start the frontend development server:

```bash
npm run dev --workspace frontend
```

Open the local URL printed by Next.js, usually <http://localhost:3000>.

For the full Demo loop, start the backend in another terminal:

```bash
npm run dev --workspace backend
```

## Available Scripts

- `npm run dev` - start the local Next.js development server.
- `npm run build` - create a production build.
- `npm run typecheck` - run TypeScript checks with `tsc --noEmit`.
- `npm run lint` - run the configured Next.js lint command.

## Environment Variables

`NEXT_PUBLIC_API_BASE_URL` controls the backend API base URL used by mock publish and history export. When unset, the frontend falls back to `http://localhost:3001`.

Recommended local value:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:3001
```

## Source Note

No historical business code, personal templates, or old prompts were reused. The final visual hierarchy, default Demo content, and homepage Demo sequence are original to this repository.
