import { connect, StringCodec, NatsConnection } from "nats";

let conn: NatsConnection | null = null;

export async function getNatsConnection(): Promise<NatsConnection> {
  if (!conn || conn.isClosed()) {
    try {
      // Validate environment variables
      const flyOrg = process.env.FLY_ORG;
      const accessToken = process.env.ACCESS_TOKEN;
      
      if (!flyOrg) {
        throw new Error("FLY_ORG environment variable is not set");
      }
      
      if (!accessToken) {
        throw new Error("ACCESS_TOKEN environment variable is not set");
      }
      
      console.log("Connecting to NATS...");
      
      conn = await connect({
        servers: "[fdaa::3]:4223",
        user: flyOrg,
        pass: accessToken,
        timeout: 10000, // 10 second timeout
        reconnect: true,
        maxReconnectAttempts: 5,
        reconnectTimeWait: 2000, // 2 seconds between reconnect attempts
        debug: false,
      });
      
      console.log("NATS connection established successfully");
      
      // Handle connection events
      conn.closed().then((err) => {
        if (err) {
          console.error("NATS connection closed with error:", err);
        } else {
          console.log("NATS connection closed gracefully");
        }
        conn = null;
      });
      
    } catch (error) {
      console.error("Failed to connect to NATS:", error);
      if (error instanceof Error) {
        console.error("Error details:", {
          name: error.name,
          message: error.message,
          stack: error.stack
        });
      }
      conn = null;
      throw error;
    }
  }
  return conn;
}

export async function streamAll(cb: (s: string) => void): Promise<() => void> {
  const sc = StringCodec();
  let connection: NatsConnection;
  let subscription: any;
  
  try {
    connection = await getNatsConnection();
    
    // Determine which logs to subscribe to based on environment variables
    let subscriptionPattern: string;
    const flyApp = process.env.FLY_APP;
    const flyAppName = process.env.FLY_APP_NAME;
    
    if (flyApp === "*") {
      // Show all apps in the org
      subscriptionPattern = "logs.>";
      console.log("Subscribing to all apps in org (logs.>)");
    } else if (flyApp) {
      // Show logs for specific app set via FLY_APP
      subscriptionPattern = `logs.${flyApp}.>`;
      console.log(`Subscribing to logs for app: ${flyApp} (${subscriptionPattern})`);
    } else if (flyAppName) {
      // Default to FLY_APP_NAME if FLY_APP is not set
      subscriptionPattern = `logs.${flyAppName}.>`;
      console.log(`Subscribing to logs for app: ${flyAppName} (${subscriptionPattern})`);
    } else {
      // Fallback to all logs if neither is set
      subscriptionPattern = "logs.>";
      console.log("No FLY_APP or FLY_APP_NAME set, subscribing to all apps (logs.>)");
    }
    
    subscription = connection.subscribe(subscriptionPattern);
    
    // Process messages in the background
    (async () => {
      try {
        for await (const m of subscription) {
          cb(sc.decode(m.data));
        }
      } catch (error) {
        console.error("Error processing NATS messages:", error);
      }
    })();
    
  } catch (error) {
    console.error("Failed to set up NATS streaming:", error);
    throw error;
  }
  
  // Return cleanup function
  return () => {
    try {
      if (subscription) {
        subscription.unsubscribe();
        console.log("Unsubscribed from NATS");
      }
    } catch (error) {
      console.error("Error unsubscribing from NATS:", error);
    }
  };
}

export async function closeNatsConnection() {
  if (conn && !conn.isClosed()) {
    try {
      await conn.close();
      console.log("NATS connection closed");
    } catch (error) {
      console.error("Error closing NATS connection:", error);
    }
    conn = null;
  }
} 