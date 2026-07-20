# Nimdal BLOG editor

The private editor is available at `https://blog.nimdal.xyz/write`. It can create, edit,
publish, and delete the Korean and English versions of a post together.

The repository is public, so `/write` does not offer a private draft mode. Saving creates a
publish commit. The local Keystatic recovery screen can hide a post from the site, but its
files remain readable in the public repository.

## Google sign-in

Create a Google OAuth 2.0 Web application and register these values:

- Authorized JavaScript origin: `https://blog.nimdal.xyz`
- Authorized redirect URI: `https://blog.nimdal.xyz/api/auth/callback/google`
- Local redirect URI when needed: `http://localhost:3000/api/auth/callback/google`

If the OAuth consent screen is still in Google's Testing status, add
`trialhero41@gmail.com` and `0xnimdal@gmail.com` as test users.

Configure the following server-only environment variables:

```dotenv
NEXTAUTH_URL=https://blog.nimdal.xyz
NEXTAUTH_SECRET=<random value of at least 32 bytes>
GOOGLE_CLIENT_ID=<Google OAuth client ID>
GOOGLE_CLIENT_SECRET=<Google OAuth client secret>
BLOG_WRITER_EMAILS=trialhero41@gmail.com,0xnimdal@gmail.com
```

The application checks Google's `email_verified` claim and the server-side email allowlist
at sign-in and again before every read or write. Missing configuration denies access. Do not
prefix any of these values with `NEXT_PUBLIC_`.

## GitHub persistence

Production saves create commits in `nimdalkr/nimdalxyz`. Create and install a GitHub App only
for that repository with these repository permissions:

- Contents: read and write
- Metadata: read

Then configure:

```dotenv
BLOG_GITHUB_APP_ID=<GitHub App ID>
BLOG_GITHUB_APP_PRIVATE_KEY=<PEM private key; escaped newlines are supported>
BLOG_GITHUB_APP_INSTALLATION_ID=<installation ID>
BLOG_GITHUB_REPOSITORY=nimdalkr/nimdalxyz
BLOG_GITHUB_BRANCH=main
```

All three `BLOG_GITHUB_APP_*` values are required together in production. Saving fails closed
when the configuration is incomplete. The branch head is checked before each mutation to
avoid overwriting a newer edit. A successful commit triggers the normal deployment workflow;
the public post updates after that deployment completes.

Keep the Vercel project connected to the same repository and production branch. Vercel supplies
`VERCEL_GIT_COMMIT_SHA`; the editor refuses production writes when that deployment SHA is absent
or invalid. If branch protection blocks direct GitHub App commits, explicitly allow the app to
write to the configured branch or use a dedicated publishing branch with an equivalent deploy
workflow.

## Local editing

Copy the non-secret names from `.env.example` to `.env.local`, set
`NEXTAUTH_URL=http://localhost:3000`, add development Google OAuth credentials, and run
`npm run dev`. Open `http://localhost:3000/write`. Outside production, post changes are written
directly to `content/blog/posts` and uploaded covers to `public/media/blog`.

Cover uploads are limited to 2MB and each localized Markdown body to 200,000
characters so the complete Server Action request remains below the production
function payload limit.
