import React, { useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import Papa from 'papaparse';

// Cost per 1M tokens for different models
const MODEL_COSTS = {
  'claude-3-5-sonnet-20240620': { input: 3, output: 15 },  
  'claude-3-5-sonnet-20241022': { input: 3, output: 15 },
  'claude-3-7-sonnet-20250219': { input: 3, output: 15 },  // Example higher cost for newer model
};

interface ModelUsage {
  input: number;
  output: number;
}

interface DailyData {
  date: string;
  [key: string]: any;  // For dynamic model data
}

const Cost = () => {
  const [usageData, setUsageData] = useState<DailyData[]>([]);
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [showCost, setShowCost] = useState(false);
  const [models, setModels] = useState<string[]>([]);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    setError('');

    try {
      const text = await file.text();
      Papa.parse(text, {
        header: true,
        dynamicTyping: true,
        skipEmptyLines: true,
        complete: (results) => {
          // Get unique models from the data
          const uniqueModels = [...new Set(results.data.map((row: any) => row.model_version))];
          setModels(uniqueModels);

          // Process daily stats by model
          const dailyStats = results.data.reduce((acc: { [key: string]: any }, row: any) => {
            const date = row.usage_date_utc.split('T')[0];
            const model = row.model_version;
            
            if (!acc[date]) {
              acc[date] = { date };
              // Initialize all models with 0 values
              uniqueModels.forEach(m => {
                acc[date][`${m}_input`] = 0;
                acc[date][`${m}_output`] = 0;
              });
            }

            // Add tokens
            acc[date][`${model}_input`] += (
              row.usage_input_tokens_no_cache +
              row.usage_input_tokens_cache_write +
              row.usage_input_tokens_cache_read
            );
            acc[date][`${model}_output`] += row.usage_output_tokens;

            return acc;
          }, {});

          const processedData = Object.values(dailyStats).sort((a: any, b: any) => 
            a.date.localeCompare(b.date)
          );
          setUsageData(processedData);
        },
        error: (error) => {
          setError('Error parsing CSV file: ' + error.message);
        },
      });
    } catch (err) {
      setError('Error reading file: ' + (err instanceof Error ? err.message : String(err)));
    } finally {
      setIsLoading(false);
    }
  };

  const calculateTotals = () => {
    return models.reduce((acc, model) => {
      const modelTotal = usageData.reduce((sum, day) => {
        const inputTokens = day[`${model}_input`] || 0;
        const outputTokens = day[`${model}_output`] || 0;
        
        if (showCost) {
          const inputCost = (inputTokens / 1000000) * MODEL_COSTS[model as keyof typeof MODEL_COSTS].input;
          const outputCost = (outputTokens / 1000000) * MODEL_COSTS[model as keyof typeof MODEL_COSTS].output;
          return {
            input: sum.input + inputCost,
            output: sum.output + outputCost
          };
        }
        
        return {
          input: sum.input + inputTokens,
          output: sum.output + outputTokens
        };
      }, { input: 0, output: 0 });

      acc[model] = modelTotal;
      return acc;
    }, {} as Record<string, ModelUsage>);
  };

  const formatValue = (value: number): string => {
    if (showCost) {
      return `$${value.toFixed(2)}`;
    }
    return value.toLocaleString();
  };

  const getChartData = () => {
    if (showCost) {
      return usageData.map(day => {
        const dayData: any = { date: day.date };
        models.forEach(model => {
          const inputTokens = day[`${model}_input`] || 0;
          const outputTokens = day[`${model}_output`] || 0;
          dayData[`${model}_input`] = (inputTokens / 1000000) * MODEL_COSTS[model as keyof typeof MODEL_COSTS].input;
          dayData[`${model}_output`] = (outputTokens / 1000000) * MODEL_COSTS[model as keyof typeof MODEL_COSTS].output;
        });
        return dayData;
      });
    }
    return usageData;
  };

  const totals = calculateTotals();

  return (
    <div className="p-4 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Cost Management</h1>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">Show as:</span>
          <button
            onClick={() => setShowCost(!showCost)}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${
              showCost
                ? 'bg-blue-100 text-blue-700'
                : 'bg-gray-100 text-gray-700'
            }`}
          >
            {showCost ? 'Cost ($)' : 'Tokens'}
          </button>
        </div>
      </div>
      
      {/* File Upload Section */}
      <div className="bg-white p-4 rounded-lg shadow">
        <label className="block mb-2 text-sm font-medium text-gray-700">
          Upload Usage CSV
          <input
            type="file"
            accept=".csv"
            onChange={handleFileUpload}
            className="block w-full text-sm text-gray-500 mt-1
              file:mr-4 file:py-2 file:px-4
              file:rounded-full file:border-0
              file:text-sm file:font-semibold
              file:bg-blue-50 file:text-blue-700
              hover:file:bg-blue-100"
          />
        </label>
        {isLoading && <p className="text-gray-600">Loading...</p>}
        {error && <p className="text-red-500">{error}</p>}
      </div>

      {/* Summary Statistics */}
      {usageData.length > 0 && (
        <div className="grid grid-cols-1 gap-6">
          {models.map(model => (
            <div key={model} className="bg-white p-4 rounded-lg shadow">
              <h3 className="text-lg font-semibold text-gray-700 mb-4">{model}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-600">Total Input {showCost ? 'Cost' : 'Tokens'}</h4>
                  <p className="text-2xl font-bold text-blue-600">
                    {formatValue(totals[model]?.input || 0)}
                  </p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-600">Total Output {showCost ? 'Cost' : 'Tokens'}</h4>
                  <p className="text-2xl font-bold text-green-600">
                    {formatValue(totals[model]?.output || 0)}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Usage Graphs */}
      {usageData.length > 0 && models.map(model => (
        <div key={`graph-${model}`} className="bg-white p-4 rounded-lg shadow space-y-6">
          <h2 className="text-xl font-semibold text-gray-800">{model} Daily Usage</h2>
          
          <div className="h-96">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={getChartData()}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 12 }}
                  angle={-45}
                  textAnchor="end"
                />
                <YAxis />
                <Tooltip 
                  formatter={(value: number) => showCost ? `$${value.toFixed(2)}` : value.toLocaleString()}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey={`${model}_input`}
                  name="Input"
                  stroke="#2563eb"
                  strokeWidth={2}
                />
                <Line
                  type="monotone"
                  dataKey={`${model}_output`}
                  name="Output"
                  stroke="#16a34a"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Cost;