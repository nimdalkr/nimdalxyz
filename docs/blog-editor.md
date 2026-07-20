# Nimdal BLOG editor

The editor is available at `/keystatic`.

## Local editing

Run `npm run dev`, open `http://127.0.0.1:3000/keystatic`, edit a post, and save. Local mode writes changes directly to `content/blog/posts` and `public/media/blog`.

Each collection entry owns one canonical slug, shared publish/update dates and cover, plus Korean and English metadata and bodies. Keep the Korean and English tag arrays in the same order because both languages share the English tag slug.

## Production editing

Production uses GitHub mode only when all four variables in `.env.example` are configured. Without them, both `/keystatic` and `/api/keystatic/*` return `404`.

Create a GitHub App with access limited to `nimdalkr/nimdalxyz` and these repository permissions:

- Contents: read and write
- Metadata: read
- Pull requests: read

Use `https://nimdal.xyz/api/keystatic/github/oauth/callback` as its callback URL, then add the client ID, client secret, a strong random `KEYSTATIC_SECRET`, and the GitHub App slug to the production environment. Only GitHub users with write access to the repository can edit. Saving from production creates Git commits, so the public site updates after the deployment triggered by that commit finishes.
