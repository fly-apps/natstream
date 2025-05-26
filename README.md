<div align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://github.com/user-attachments/assets/a5099e99-5a87-498d-bd12-e0d5095496f3">
    <img src="https://github.com/user-attachments/assets/7083bbb6-a51a-41d8-b6e0-e43fd797905d"</img>
  </picture>
</div>

A real-time log streaming application that connects to Fly.io's NATS infrastructure to stream application logs via Server-Sent Events (SSE).

## How It Works

### NATS Client Connection

The application establishes a persistent connection to Fly.io's NATS server at `[fdaa::3]:4223` using the organization credentials.

### Log Streaming Architecture

1. **Client connects** to `/api/logs` endpoint
2. **Server establishes** NATS subscription based on environment configuration
3. **Real-time logs** are streamed via Server-Sent Events (SSE)
4. **Automatic cleanup** when client disconnects

## Environment Variables

### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `FLY_ORG` | Your Fly.io organization name | `my-org` |
| `ACCESS_TOKEN` | Fly.io access token for NATS authentication | `fm2_xxx...` |

### Optional Log Filtering

| Variable | Description | Default Behavior |
|----------|-------------|------------------|
| `FLY_APP` | Specific app to monitor | If not set, falls back to `FLY_APP_NAME` |
| `FLY_APP_NAME` | Reserved runtime variable automatically set by Fly.io | **Always set** - app streams its own logs by default |

### Special Values

- **`FLY_APP="*"`** - Explicitly stream logs from all applications in the organization
- **Default behavior** - Since `FLY_APP_NAME` is always set by Fly.io, the app streams its own logs by default

### NATS Subscription Patterns

The application subscribes to different NATS subjects based on configuration:

```
FLY_APP="*"           → logs.>              (all apps in org)
FLY_APP="myapp"       → logs.myapp.>        (specific app)
FLY_APP_NAME="myapp"  → logs.myapp.>        (default: own app logs)
```

## API Endpoints

### `GET /api/logs`

Streams real-time logs via Server-Sent Events.

**Response Format:**
```json
{
  "message": "log line content",
  "timestamp": 1234567890,
  "type": "log|system|error",
  "persistent": false
}
```

**Connection Events:**
- Initial connection confirmation
- Real-time log messages
- Error notifications
- Automatic cleanup on disconnect

## Deployment

### Quick Deploy from GitHub

> **Note:** The application is designed to run on Fly.io with automatic environment variable injection. The `FLY_APP_NAME` variable is a reserved runtime variable that's **always set** by Fly.io on each machine, meaning the app will stream its own logs by default unless `FLY_APP` is explicitly configured.

Launch the app from the GitHub repository:

```bash
fly launch --from https://github.com/fly-apps/natstream/ \
  --yes \
  --copy-config \
  --org $ORG \
  --env FLY_ORG=$ORG \
  --no-deploy \
  --secrets ACCESS_TOKEN="$(fly tokens create readonly $ORG)" \
  --flycast
```
