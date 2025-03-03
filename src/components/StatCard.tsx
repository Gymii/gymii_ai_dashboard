import React from "react";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  change?: number;
  changeText?: string;
}

export default function StatCard({
  title,
  value,
  subtitle,
  icon,
  change,
  changeText,
}: StatCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="mt-1 text-3xl font-semibold text-gray-900">{value}</p>
          {subtitle && <p className="mt-1 text-sm text-gray-500">{subtitle}</p>}

          {(change !== undefined || changeText) && (
            <div className="mt-2 flex items-center">
              {change !== undefined && (
                <span
                  className={`mr-1 text-xs font-medium ${
                    change >= 0 ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {change >= 0 ? "+" : ""}
                  {change}%
                </span>
              )}
              {changeText && (
                <span className="text-xs text-gray-500">{changeText}</span>
              )}
            </div>
          )}
        </div>

        {icon && <div className="p-3 bg-primary-100 rounded-full">{icon}</div>}
      </div>
    </div>
  );
}
