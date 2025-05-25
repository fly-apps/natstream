# NatStream - Fly.io Live Log Viewer

This mini-Next.js app lets you watch *every* Fly.io app log in real-time.

## How it works

On the server side we open a single connection to Fly's private NATS endpoint (`nats://[fdaa::3]:4223`). Fly pipes every `stdout` line into subjects that look like `logs.<app>.<region>.<instance>`. Authenticating is just your **org slug** as the NATS user and a **read-only Fly access-token** as the password.

The server subscribes to NATS log subjects and forwards each log line over Server-Sent Events. In the browser a MagicUI `<Terminal>` prints the stream, giving you a live, full-screen tail. The subscription pattern depends on environment variables to filter logs by app.

## Setup

1. **Install dependencies**
   ```bash
   bun install
   ```

2. **Set environment variables**
   Create a `.env.local` file with:
   ```bash
   FLY_ORG=your-org-slug
   ACCESS_TOKEN=your-read-only-fly-access-token
   # Optional: Filter logs by app
   FLY_APP=your-app-name  # or "*" for all apps
   ```

3. **Run the development server**
   ```bash
   bun run dev
   ```

4. **If running off-Fly, expose NATS locally**
   ```bash
   fly proxy 4223:4223
   ```

## Environment Variables

- `FLY_ORG`: Your Fly.io organization slug
- `ACCESS_TOKEN`: A read-only Fly.io access token
- `FLY_APP` (optional): App name to filter logs for. Set to `"*"` to show all apps in org. If not set, defaults to `FLY_APP_NAME` runtime variable
- `FLY_APP_NAME` (runtime): Automatically set by Fly.io when running on the platform

## Features

- Real-time log streaming from Fly.io apps (configurable filtering)
- Beautiful terminal UI using MagicUI components
- Automatic reconnection on connection loss
- Connection status indicator
- Responsive design
- App-specific log filtering via environment variables

## Tech Stack

- Next.js 15 (App Router)
- TypeScript
- Tailwind CSS
- MagicUI Terminal component
- NATS for log streaming
- Server-Sent Events for real-time updates

Open your Fly app's URL; the centered terminal should immediately show live logs. By default, it shows logs from the current app (via `FLY_APP_NAME`), but you can configure it to show logs from specific apps or all apps in your organization.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
