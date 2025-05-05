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

const MODEL_COSTS = {
  'claude-3-5-sonnet-20240620': { input: 3, output: 15 },  
  'claude-3-5-sonnet-20241022': { input: 3, output: 15 },
  'claude-3-7-sonnet-20250219': { input: 3, output: 15 },
};

interface ModelUsage {
  input: number;
  output: number;
  total: number;
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
  const [showDetailedView, setShowDetailedView] = useState(false);

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
          const uniqueModels = [...new Set(results.data.map((row: any) => row.model_version))];
          setModels(uniqueModels);

          // Process daily stats by model
          const dailyStats = results.data.reduce((acc: { [key: string]: any }, row: any) => {
            const date = row.usage_date_utc.split('T')[0];
            const model = row.model_version;
            
            if (!acc[date]) {
              acc[date] = { 
                date,
                total_input: 0,
                total_output: 0
              };
              // Initialize all models with 0 values
              uniqueModels.forEach(m => {
                acc[date][`${m}_input`] = 0;
                acc[date][`${m}_output`] = 0;
                acc[date][`${m}_total`] = 0;
              });
            }

            // Add tokens
            const inputTokens = row.usage_input_tokens_no_cache +
              row.usage_input_tokens_cache_write +
              row.usage_input_tokens_cache_read;
            const outputTokens = row.usage_output_tokens;

            acc[date][`${model}_input`] += inputTokens;
            acc[date][`${model}_output`] += outputTokens;
            acc[date][`${model}_total`] += inputTokens + outputTokens;
            acc[date].total_input += inputTokens;
            acc[date].total_output += outputTokens;
            acc[date].total = (acc[date].total_input + acc[date].total_output);

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
    const modelTotals = models.reduce((acc, model) => {
      const modelTotal = usageData.reduce((sum, day) => {
        const inputTokens = day[`${model}_input`] || 0;
        const outputTokens = day[`${model}_output`] || 0;
        
        if (showCost) {
          const inputCost = (inputTokens / 1000000) * MODEL_COSTS[model as keyof typeof MODEL_COSTS].input;
          const outputCost = (outputTokens / 1000000) * MODEL_COSTS[model as keyof typeof MODEL_COSTS].output;
          return {
            input: sum.input + inputCost,
            output: sum.output + outputCost,
            total: sum.total + inputCost + outputCost
          };
        }
        
        return {
          input: sum.input + inputTokens,
          output: sum.output + outputTokens,
          total: sum.total + inputTokens + outputTokens
        };
      }, { input: 0, output: 0, total: 0 });

      acc[model] = modelTotal;
      return acc;
    }, {} as Record<string, ModelUsage>);

    // Calculate grand total
    const grandTotal = {
      input: Object.values(modelTotals).reduce((sum, model) => sum + model.input, 0),
      output: Object.values(modelTotals).reduce((sum, model) => sum + model.output, 0),
      total: Object.values(modelTotals).reduce((sum, model) => sum + model.total, 0)
    };

    return {
      byModel: modelTotals,
      total: grandTotal
    };
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
        if (!showDetailedView) {
          // Calculate total cost for the day
          const totalInputCost = (day.total_input / 1000000) * 3; // All models have same input cost
          const totalOutputCost = (day.total_output / 1000000) * 15; // All models have same output cost
          dayData.total_input = totalInputCost;
          dayData.total_output = totalOutputCost;
          dayData.total = totalInputCost + totalOutputCost;
        } else {
          models.forEach(model => {
            const inputTokens = day[`${model}_input`] || 0;
            const outputTokens = day[`${model}_output`] || 0;
            const inputCost = (inputTokens / 1000000) * MODEL_COSTS[model as keyof typeof MODEL_COSTS].input;
            const outputCost = (outputTokens / 1000000) * MODEL_COSTS[model as keyof typeof MODEL_COSTS].output;
            dayData[`${model}_input`] = inputCost;
            dayData[`${model}_output`] = outputCost;
            dayData[`${model}_total`] = inputCost + outputCost;
          });
        }
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
          <button
            onClick={() => setShowDetailedView(!showDetailedView)}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${
              showDetailedView
                ? 'bg-purple-100 text-purple-700'
                : 'bg-gray-100 text-gray-700'
            }`}
          >
            {showDetailedView ? 'Show Summary' : 'Show By Model'}
          </button>
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
          {/* Total Summary Card */}
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">Total Usage</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <h4 className="text-sm font-medium text-gray-600">Total Input {showCost ? 'Cost' : 'Tokens'}</h4>
                <p className="text-2xl font-bold text-blue-600">
                  {formatValue(totals.total.input)}
                </p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-600">Total Output {showCost ? 'Cost' : 'Tokens'}</h4>
                <p className="text-2xl font-bold text-green-600">
                  {formatValue(totals.total.output)}
                </p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-600">Combined Total</h4>
                <p className="text-2xl font-bold text-purple-600">
                  {formatValue(totals.total.total)}
                </p>
              </div>
            </div>
          </div>

          {/* Per-Model Statistics (only shown in detailed view) */}
          {showDetailedView && models.map(model => (
            <div key={model} className="bg-white p-4 rounded-lg shadow">
              <h3 className="text-lg font-semibold text-gray-700 mb-4">{model}</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-600">Total Input {showCost ? 'Cost' : 'Tokens'}</h4>
                  <p className="text-2xl font-bold text-blue-600">
                    {formatValue(totals.byModel[model]?.input || 0)}
                  </p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-600">Total Output {showCost ? 'Cost' : 'Tokens'}</h4>
                  <p className="text-2xl font-bold text-green-600">
                    {formatValue(totals.byModel[model]?.output || 0)}
                  </p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-600">Combined Total</h4>
                  <p className="text-2xl font-bold text-purple-600">
                    {formatValue(totals.byModel[model]?.total || 0)}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Usage Graphs */}
      {usageData.length > 0 && (
        !showDetailedView ? (
          // Summary Graph
          <div className="bg-white p-4 rounded-lg shadow space-y-6">
            <h2 className="text-xl font-semibold text-gray-800">Total Daily Usage</h2>
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
                    dataKey="total_input"
                    name="Total Input"
                    stroke="#2563eb"
                    strokeWidth={2}
                  />
                  <Line
                    type="monotone"
                    dataKey="total_output"
                    name="Total Output"
                    stroke="#16a34a"
                    strokeWidth={2}
                  />
                  <Line
                    type="monotone"
                    dataKey="total"
                    name="Combined Total"
                    stroke="#7c3aed"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        ) : (
          // Individual Model Graphs
          models.map(model => (
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
                    <Line
                      type="monotone"
                      dataKey={`${model}_total`}
                      name="Total"
                      stroke="#7c3aed"
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          ))
        )
      )}
    </div>
  );
};

export default Cost;