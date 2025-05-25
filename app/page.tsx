"use client";

import { useEffect, useRef, useState } from "react";
import { Terminal } from "@/components/magicui/terminal";
import { NavHeader } from "@/components/nav-header";

interface LogEntry {
  message: string;
  timestamp: number;
  type?: string;
  persistent?: boolean;
}

export default function Home() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const eventSourceRef = useRef<EventSource | null>(null);
  const streamingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Connect to the Server-Sent Events endpoint
    const connectToLogs = () => {
      try {
        const eventSource = new EventSource('/api/logs');
        eventSourceRef.current = eventSource;

        eventSource.onopen = () => {
          setIsConnected(true);
          console.log('Connected to log stream');
        };

        eventSource.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            const logEntry: LogEntry = {
              message: data.message,
              timestamp: data.timestamp,
              type: data.type,
              persistent: data.persistent
            };
            setLogs(prev => [...prev.slice(-999), logEntry]); // Keep last 1000 logs
            
            // Set streaming to true when receiving messages
            setIsStreaming(true);
            
            // Clear existing timeout and set a new one
            if (streamingTimeoutRef.current) {
              clearTimeout(streamingTimeoutRef.current);
            }
            
            // Stop showing spinner after 2 seconds of no new messages
            streamingTimeoutRef.current = setTimeout(() => {
              setIsStreaming(false);
            }, 2000);
          } catch (error) {
            console.error('Error parsing log data:', error);
          }
        };

        eventSource.onerror = (error) => {
          console.error('EventSource error:', error);
          setIsConnected(false);
          setIsStreaming(false);
          eventSource.close();
          
          // Clear streaming timeout
          if (streamingTimeoutRef.current) {
            clearTimeout(streamingTimeoutRef.current);
          }
          
          // Reconnect after 5 seconds
          setTimeout(connectToLogs, 5000);
        };
      } catch (error) {
        console.error('Failed to connect to log stream:', error);
        setIsConnected(false);
      }
    };

    connectToLogs();

    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
      if (streamingTimeoutRef.current) {
        clearTimeout(streamingTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div className="min-h-screen bg-neutral-100 dark:bg-background">
      <NavHeader />
      <div className="p-4">
      <div className="mx-auto max-w-7xl">
          <div className="w-full h-[calc(100vh-8rem)]">
          <Terminal className="w-full h-full max-w-none max-h-none" isStreaming={isStreaming}>
            {logs.length === 0 ? (
              <div className="text-muted-foreground">
                {isConnected ? 'Waiting for logs...' : 'Connecting to log stream...'}
              </div>
            ) : (
              logs.slice().reverse().map((log, index) => {
                const timestamp = new Date(log.timestamp).toLocaleTimeString('en-US', {
                  hour12: false,
                  hour: '2-digit',
                  minute: '2-digit',
                  second: '2-digit',
                  fractionalSecondDigits: 3
                });
                
                return (
                  <div key={index} className="font-mono text-sm">
                    <span className="text-muted-foreground">[{timestamp}]</span> {log.message}
                  </div>
                );
              })
            )}
          </Terminal>
        </div>
        
        <div className="flex items-center justify-end gap-2 mt-2">
          <div 
            className={`w-2 h-2 rounded-full ${
              isConnected ? 'bg-green-500' : 'bg-red-500'
            }`}
          />
          <span className="text-sm text-muted-foreground">
            {isConnected ? 'Connected' : 'Disconnected'}
          </span>
          </div>
        </div>
      </div>
    </div>
  );
}
