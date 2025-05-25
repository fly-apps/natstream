import { streamAll } from "@/lib/nats";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  console.log("Starting SSE connection for logs");
  
  // Create a readable stream for Server-Sent Events
  const stream = new ReadableStream({
    async start(controller) {
      let cleanup: (() => void) | null = null;
      
      try {
        // Set up the NATS streaming
        cleanup = await streamAll((line) => {
          try {
            const data = `data: ${JSON.stringify({ message: line, timestamp: Date.now() })}\n\n`;
            controller.enqueue(new TextEncoder().encode(data));
          } catch (error) {
            console.error("Error encoding message:", error);
          }
        });
        
        console.log("NATS streaming setup complete");
        
        // Send initial connection message
        const initialData = `data: ${JSON.stringify({ 
          message: "Connected to log stream", 
          timestamp: Date.now(),
          type: "system",
          persistent: false
        })}\n\n`;
        controller.enqueue(new TextEncoder().encode(initialData));
        
      } catch (error) {
        console.error("NATS streaming error:", error);
        
        // Send error message to client
        const errorMessage = error instanceof Error ? error.message : String(error);
        const errorData = `data: ${JSON.stringify({ 
          message: `Connection error: ${errorMessage}`, 
          timestamp: Date.now(),
          type: "error"
        })}\n\n`;
        
        try {
          controller.enqueue(new TextEncoder().encode(errorData));
        } catch (encodeError) {
          console.error("Failed to send error message:", encodeError);
        }
        
        // Close the stream
        controller.close();
        
        // Cleanup if needed
        if (cleanup) {
          cleanup();
        }
      }
      
      // Store cleanup function for cancel
      (controller as any)._cleanup = cleanup;
    },
    cancel() {
      console.log("SSE connection closed by client");
      
      // Call cleanup function if it exists
      const cleanup = (this as any)._cleanup;
      if (cleanup) {
        cleanup();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "Connection": "keep-alive",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET",
      "Access-Control-Allow-Headers": "Cache-Control",
      "X-Accel-Buffering": "no", // Disable nginx buffering
    },
  });
} 