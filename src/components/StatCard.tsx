import React from "react";
import { HiInformationCircle } from "react-icons/hi";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  change?: number;
  changeText?: string;
  subsection?: React.ReactNode;
  additionalLabel1?: string;
  additionalValue1?: string | number;
  additionalLabel2?: string;
  additionalValue2?: string | number;
}

export default function StatCard({
  title,
  value,
  subtitle,
  icon,
  change,
  changeText,
  subsection,
  additionalLabel1,
  additionalValue1,
  additionalLabel2,
  additionalValue2,
}: StatCardProps) {
  // Determine whether to show the default subsection
  const shouldShowDefaultSubsection =
    !subsection &&
    ((additionalLabel1 && additionalValue1) ||
      (additionalLabel2 && additionalValue2));

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="mt-1 text-3xl font-semibold text-gray-900">{value}</p>
          {subtitle && <p className="mt-1 text-sm text-gray-500">{subtitle}</p>}

          {changeText && (
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
              <span className="text-xs text-gray-500">{changeText}</span>
            </div>
          )}
        </div>

        {icon && <div className="p-3 bg-primary-100 rounded-full">{icon}</div>}
      </div>

      {subsection && (
        <div className="mt-4 pt-3 border-t border-gray-200">{subsection}</div>
      )}

      {shouldShowDefaultSubsection && (
        <div className="mt-4 pt-3 border-t border-gray-200 space-y-2">
          {additionalLabel1 && additionalValue1 !== undefined && (
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <HiInformationCircle className="h-4 w-4 text-gray-500" />
                <span className="text-xs text-gray-600">
                  {additionalLabel1}:
                </span>
              </div>
              <span className="text-sm font-medium text-gray-900">
                {additionalValue1}
              </span>
            </div>
          )}

          {additionalLabel2 && additionalValue2 !== undefined && (
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <HiInformationCircle className="h-4 w-4 text-gray-500" />
                <span className="text-xs text-gray-600">
                  {additionalLabel2}:
                </span>
              </div>
              <span className="text-sm font-medium text-gray-900">
                {additionalValue2}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
