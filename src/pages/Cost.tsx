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

interface UsageData {
  date: string;
  totalInput: number;
  totalOutput: number;
  searches: number;
}

const Cost = () => {
  const [usageData, setUsageData] = useState<UsageData[]>([]);
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

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
          const dailyStats = results.data.reduce((acc: { [key: string]: any }, row: any) => {
            const date = row.usage_date_utc.split('T')[0];
            if (!acc[date]) {
              acc[date] = {
                date,
                totalInput: 0,
                totalOutput: 0,
                searches: 0,
              };
            }
            acc[date].totalInput += (
              row.usage_input_tokens_no_cache +
              row.usage_input_tokens_cache_write +
              row.usage_input_tokens_cache_read
            );
            acc[date].totalOutput += row.usage_output_tokens;
            acc[date].searches += row.web_search_count;
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
    return usageData.reduce(
      (acc, day) => ({
        totalInput: acc.totalInput + day.totalInput,
        totalOutput: acc.totalOutput + day.totalOutput,
        searches: acc.searches + day.searches,
      }),
      { totalInput: 0, totalOutput: 0, searches: 0 }
    );
  };

  const totals = calculateTotals();

  return (
    <div className="p-4 space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Cost Management</h1>
      
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-700">Total Input Tokens</h3>
            <p className="text-2xl font-bold text-blue-600">
              {totals.totalInput.toLocaleString()}
            </p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-700">Total Output Tokens</h3>
            <p className="text-2xl font-bold text-green-600">
              {totals.totalOutput.toLocaleString()}
            </p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-700">Total Searches</h3>
            <p className="text-2xl font-bold text-purple-600">
              {totals.searches.toLocaleString()}
            </p>
          </div>
        </div>
      )}

      {/* Usage Graphs */}
      {usageData.length > 0 && (
        <div className="bg-white p-4 rounded-lg shadow space-y-6">
          <h2 className="text-xl font-semibold text-gray-800">Daily Usage Trends</h2>
          
          <div className="h-96">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={usageData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 12 }}
                  angle={-45}
                  textAnchor="end"
                />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="totalInput"
                  name="Input Tokens"
                  stroke="#2563eb"
                  strokeWidth={2}
                />
                <Line
                  type="monotone"
                  dataKey="totalOutput"
                  name="Output Tokens"
                  stroke="#16a34a"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cost;