import { useState, useEffect } from 'react';

interface UsageLog {
  id: string;
  model: string;
  input_tokens: number;
  output_tokens: number;
  timestamp: string;
  type: string;
  service_tier: string;
}

interface ModelStats {
  model: string;
  total_input_tokens: number;
  total_output_tokens: number;
  total_calls: number;
  total_cost: number;
}

interface DailyStats {
  date: string;
  total_calls: number;
  total_cost: number;
  models: ModelStats[];
}

export default function Cost() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dailyStats, setDailyStats] = useState<DailyStats | null>(null);
  const [showLogs, setShowLogs] = useState(false);

  const PRICING = {
    'claude-3-opus': {
      input: 0.015,  // $0.015 per 1K tokens
      output: 0.075  // $0.075 per 1K tokens
    },
    'claude-3-sonnet': {
      input: 0.003,  // $0.003 per 1K tokens
      output: 0.015  // $0.015 per 1K tokens
    }
  };

  const calculateCost = (tokens: number, model: string, isInput: boolean) => {
    const modelType = model.includes('opus') ? 'claude-3-opus' : 'claude-3-sonnet';
    const rate = isInput ? PRICING[modelType].input : PRICING[modelType].output;
    return (tokens / 1000) * rate;
  };

  const [rawLogs, setRawLogs] = useState<UsageLog[]>([]);

  useEffect(() => {
    const processLogs = (logs: UsageLog[]) => {
      console.log('Processing logs:', logs.length); // Debug log
      const modelStats: { [key: string]: ModelStats } = {};
      let totalCalls = 0;
      let totalCost = 0;

      logs.forEach(log => {
        console.log('Processing log:', log.id); // Debug log
        const modelKey = log.model;
        if (!modelStats[modelKey]) {
          modelStats[modelKey] = {
            model: modelKey,
            total_input_tokens: 0,
            total_output_tokens: 0,
            total_calls: 0,
            total_cost: 0
          };
        }

        modelStats[modelKey].total_input_tokens += log.input_tokens;
        modelStats[modelKey].total_output_tokens += log.output_tokens;
        modelStats[modelKey].total_calls += 1;

        const inputCost = calculateCost(log.input_tokens, modelKey, true);
        const outputCost = calculateCost(log.output_tokens, modelKey, false);
        const totalLogCost = inputCost + outputCost;

        modelStats[modelKey].total_cost += totalLogCost;
        totalCost += totalLogCost;
        totalCalls += 1;
      });

      // Get the current date in EDT
      const now = new Date();
      const edtDate = new Intl.DateTimeFormat('en-US', {
        timeZone: 'America/New_York',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      }).format(now);

      return {
        date: edtDate,
        total_calls: totalCalls,
        total_cost: totalCost,
        models: Object.values(modelStats)
      };
    };

    const fetchUsageData = async () => {
      try {
        // Generate 100 simulated logs
        const mockLogs: UsageLog[] = [];
        const startTime = new Date('2025-05-04T16:00:00-04:00');
        const models = [
          'claude-3-opus-20240229',
          'claude-3-5-sonnet-20241022'
        ];

        for (let i = 0; i < 100; i++) {
          const timestamp = new Date(startTime.getTime() + i * 60000); // Add 1 minute per log
          const model = models[Math.floor(Math.random() * models.length)];
          const isOpus = model.includes('opus');

          mockLogs.push({
            id: `req_011CNo${Math.random().toString(36).substr(2, 16)}`,
            model,
            input_tokens: isOpus ? Math.floor(Math.random() * 20) + 5 : Math.floor(Math.random() * 2000) + 1000,
            output_tokens: isOpus ? Math.floor(Math.random() * 100) + 1 : Math.floor(Math.random() * 1500) + 100,
            timestamp: timestamp.toISOString(),
            type: 'HTTP',
            service_tier: 'Standard'
          });
        }

        setRawLogs(mockLogs);
        const stats = processLogs(mockLogs);
        setDailyStats(stats);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch usage data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsageData();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">Cost Management</h1>
      </div>
      <div className="bg-white rounded-lg shadow">
        <div className="p-6">
          {isLoading ? (
            <p>Fetching usage data...</p>
          ) : error ? (
            <div>
              <p className="text-red-600 mb-2">Error fetching usage data:</p>
              <p className="text-red-600">{error}</p>
            </div>
          ) : dailyStats ? (
            <div className="space-y-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h2 className="text-xl font-semibold mb-2 text-gray-900">Daily Summary - {dailyStats.date}</h2>
                <p className="text-lg text-gray-900">Total API Calls: {dailyStats.total_calls}</p>
                <p className="text-lg mb-4 text-gray-900">Total Cost: ${dailyStats.total_cost.toFixed(4)}</p>

                <button 
                  onClick={() => setShowLogs(!showLogs)}
                  className="mb-4 inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  {showLogs ? 'Hide' : 'Show'} Individual Logs ({rawLogs.length} total)
                </button>

                {showLogs && (
                  <div className="mb-8">
                    <h3 className="text-lg font-medium mb-3 text-gray-900">Individual Logs</h3>
                    <div className="space-y-4 max-h-96 overflow-y-auto">
                      {rawLogs.map((log) => (
                        <div key={log.id} className="bg-white p-4 rounded-lg border border-gray-200 text-gray-900">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <p className="text-gray-900"><span className="font-medium">ID:</span> {log.id}</p>
                              <p className="text-gray-900"><span className="font-medium">Model:</span> {log.model}</p>
                              <p className="text-gray-900"><span className="font-medium">Time:</span> {new Date(log.timestamp).toLocaleTimeString()}</p>
                            </div>
                            <div>
                              <p className="text-gray-900"><span className="font-medium">Input Tokens:</span> {log.input_tokens}</p>
                              <p className="text-gray-900"><span className="font-medium">Output Tokens:</span> {log.output_tokens}</p>
                              <p className="text-gray-900"><span className="font-medium">Cost:</span> $
                                {(calculateCost(log.input_tokens, log.model, true) + 
                                  calculateCost(log.output_tokens, log.model, false)).toFixed(4)}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <h3 className="text-lg font-medium mb-3 text-gray-900">Aggregated Model Stats</h3>
                <div className="space-y-4">
                  {dailyStats.models.map((modelStat, index) => (
                    <div key={index} className="bg-white p-4 rounded-lg border border-gray-200 text-gray-900">
                      <h4 className="font-medium mb-2 text-gray-900">{modelStat.model}</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-gray-900"><span className="font-medium">Input Tokens:</span> {modelStat.total_input_tokens.toLocaleString()}</p>
                          <p className="text-gray-900"><span className="font-medium">Cost:</span> ${calculateCost(modelStat.total_input_tokens, modelStat.model, true).toFixed(4)}</p>
                        </div>
                        <div>
                          <p className="text-gray-900"><span className="font-medium">Output Tokens:</span> {modelStat.total_output_tokens.toLocaleString()}</p>
                          <p className="text-gray-900"><span className="font-medium">Cost:</span> ${calculateCost(modelStat.total_output_tokens, modelStat.model, false).toFixed(4)}</p>
                        </div>
                      </div>
                      <div className="mt-2">
                        <p className="text-gray-900"><span className="font-medium">Total Calls:</span> {modelStat.total_calls}</p>
                        <p className="text-gray-900"><span className="font-medium">Total Cost:</span> ${modelStat.total_cost.toFixed(4)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="mt-4">
                <p className="text-sm text-gray-600">
                  Note: For complete cost history and detailed analytics, visit the {' '}
                  <a href="https://console.anthropic.com" 
                     className="text-blue-600 hover:underline" 
                     target="_blank" 
                     rel="noopener noreferrer">Anthropic Console</a>.
                </p>
              </div>
            </div>
          ) : (
            <p>No usage data available</p>
          )}
        </div>
      </div>
    </div>
  );
}
