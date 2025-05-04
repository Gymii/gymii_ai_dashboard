import { useState, useEffect } from 'react';
import Anthropic from '@anthropic-ai/sdk';

export default function Cost() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'error' | null>(null);

  useEffect(() => {
    const testConnection = async () => {
      try {
        const anthropic = new Anthropic({
          apiKey: import.meta.env.VITE_CLAUDE_API_KEY,
          dangerouslyAllowBrowser:true // Using Vite's environment variable format
        });

        // Test the connection with a simple message
        await anthropic.messages.create({
          messages: [{ role: 'user', content: 'Hello' }],
          model: 'claude-3-opus-20240229',
          max_tokens: 1
        });

        setConnectionStatus('connected');
        setError(null);
      } catch (err) {
        setConnectionStatus('error');
        setError(err instanceof Error ? err.message : 'Failed to connect to Claude API');
      } finally {
        setIsLoading(false);
      }
    };

    testConnection();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">Cost Management</h1>
      </div>
      <div className="bg-white rounded-lg shadow">
        <div className="p-6">
          {isLoading ? (
            <p>Testing API connection...</p>
          ) : error ? (
            <div>
              <p className="text-red-600 mb-2">Error connecting to Claude API:</p>
              <p className="text-red-600">{error}</p>
            </div>
          ) : connectionStatus === 'connected' ? (
            <div>
              <p className="text-green-600">✓ Successfully connected to Claude API</p>
              <p className="mt-4 text-gray-600">
                Note: Detailed cost data is available in the Anthropic Console.
                Visit the <a href="https://console.anthropic.com" className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">Anthropic Console</a> to view your usage and costs.
              </p>
            </div>
          ) : (
            <p>No connection status available</p>
          )}
        </div>
      </div>
    </div>
  );
}
