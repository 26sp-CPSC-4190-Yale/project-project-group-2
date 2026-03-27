## Getting Started

1. To install all packages required for this project, run the install script:

```bash
./macos_install.sh
```
It will prompt you for a password. There you simply enter your computer password.

2. Copy over .env file I sent you into your project directories.

3. Done!

## Running the Server

To run the development server:

```bash
npm run dev
```

Open [http://localhost:4000](http://localhost:4000) in your browser to see the app running. It will update when you save your files.

## Database

To generate @prisma/client library after schema changes:

```bash
npx prisma generate
```

To push those schema changes to Supabase using the DIRECT\_URL in your .env:

```bash
npx prisma db push
```

## Helpful Documentation

Initialize a Supabase project with React: 

- https://supabase.com/docs/guides/getting-started/quickstarts/reactjs

Connect Prisma ORM:

- https://supabase.com/docs/guides/database/prisma

Prisma ORM Documentation:

- https://www.prisma.io/docs/orm/reference/prisma-config-reference#engine

TypeScript Handbook:

- https://www.typescriptlang.org/docs/handbook/intro.html

Next.js Documentation:

- https://nextjs.org/docs

React Foundations Course (from Next.js docs):

- https://nextjs.org/learn/react-foundations

Next.js Foundations Course (from Next.js docs):

- https://nextjs.org/learn/dashboard-app

CSS Documentation (from Mozilla):

- https://developer.mozilla.org/en-US/docs/Web/CSS

HTML Documentation (from Mozilla):

- https://developer.mozilla.org/en-US/docs/Web/HTML
