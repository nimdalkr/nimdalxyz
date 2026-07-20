# Nimdal BLOG editor

The private editor is available at `https://blog.nimdal.xyz/write`.

The writer enters only a Korean title and Markdown body. A daily job translates the complete
article into English and creates both languages' summary, category, tags, and reading time. The
Korean and English versions are published together in one Git commit.

## Publishing flow

1. `/write` saves the Korean source under `content/blog/pending/{slug}`.
2. The current public article remains unchanged while that request is pending. A new article is
   not added to public routes, RSS, or the sitemap yet.
3. Vercel calls `/api/cron/blog-enrichment` once a day at `18:00 UTC` (`03:00 KST`).
4. Gemini translates and classifies up to four pending articles per run.
5. Valid results are written to `content/blog/posts/{slug}` and the matching pending files are
   removed atomically. Invalid or failed results stay pending for the next run.

This repository is public. Pending Korean source files are hidden from the website but remain
readable in GitHub.

## Body images

The image button or pasting an image from the clipboard inserts Markdown at the current cursor
position. Pasting text without an image remains unchanged. JPEG, PNG, and WebP are accepted.
Animated GIF uploads are excluded so published articles respect reduced-motion preferences. One
save can include up to eight images and 2MB in total. Files are stored under
`public/media/blog/{slug}` and Gemini must preserve every image URL while translating the body.
The first image becomes the cover for a new article; an article without an image uses the NFT PFP.
Because the repository is public and these files live under `public/`, pending images are directly
reachable from both GitHub and `/media/blog/{slug}/...` after the queue commit is deployed. Do not
upload private media that must remain inaccessible before publication.

## Google sign-in

Create a Google OAuth 2.0 Web application and register:

- Authorized JavaScript origin: `https://blog.nimdal.xyz`
- Authorized redirect URI: `https://blog.nimdal.xyz/api/auth/callback/google`
- Local redirect URI when needed: `http://localhost:3000/api/auth/callback/google`

If the OAuth consent screen is in Testing, add `trialhero41@gmail.com` and
`0xnimdal@gmail.com` as test users.

```dotenv
NEXTAUTH_URL=https://blog.nimdal.xyz
NEXTAUTH_SECRET=<random value of at least 32 bytes>
GOOGLE_CLIENT_ID=<Google OAuth client ID>
GOOGLE_CLIENT_SECRET=<Google OAuth client secret>
BLOG_WRITER_EMAILS=trialhero41@gmail.com,0xnimdal@gmail.com
```

The application checks Google's `email_verified` claim and the server-side allowlist at sign-in
and before every editor read or write. Missing configuration denies access. Never prefix these
values with `NEXT_PUBLIC_`.

## GitHub persistence

Production saves create commits in `nimdalkr/nimdalxyz`. Install a GitHub App only for that
repository with Contents read/write and Metadata read access, then configure:

```dotenv
BLOG_GITHUB_APP_ID=<GitHub App ID>
BLOG_GITHUB_APP_PRIVATE_KEY=<PEM private key; escaped newlines are supported>
BLOG_GITHUB_APP_INSTALLATION_ID=<installation ID>
BLOG_GITHUB_REPOSITORY=nimdalkr/nimdalxyz
BLOG_GITHUB_BRANCH=main
```

All three `BLOG_GITHUB_APP_*` values are required together in production. Each mutation is bound
to the exact `VERCEL_GIT_COMMIT_SHA`; a stale deployment cannot overwrite a newer commit.

## Gemini and the daily job

Create a Gemini API key in Google AI Studio and configure these server-only values in Vercel:

```dotenv
GEMINI_API_KEY=<Google AI Studio API key>
GEMINI_BLOG_MODEL=gemini-3.5-flash
CRON_SECRET=<long random value>
```

Vercel sends `CRON_SECRET` as a Bearer token when invoking the configured cron route. The route
fails closed when either secret is absent. Gemini responses are accepted only when they match the
expected JSON shape, preserve Markdown image URLs, and pass the same public-post validation used
by the site.

Gemini's free tier may use submitted prompts and responses to improve Google products. Use a paid
tier instead if that data policy is not acceptable for unpublished source text.

## Local editing

Copy the names from `.env.example` to `.env.local`, set
`NEXTAUTH_URL=http://localhost:3000`, add development OAuth credentials, and run `npm run dev`.
Outside production, pending requests, published posts, and images are written directly to the
working tree.
