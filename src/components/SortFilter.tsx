import { useState } from "react";

export type SortOption = {
  id: string;
  label: string;
  field: string;
};

interface SortFilterProps {
  options: SortOption[];
  onSortChange: (field: string | null) => void;
}

export default function SortFilter({ options, onSortChange }: SortFilterProps) {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);

  const handleToggle = (optionId: string) => {
    const newValue = selectedOption === optionId ? null : optionId;
    setSelectedOption(newValue);
    onSortChange(newValue);
  };

  return (
    <div className="flex flex-wrap gap-4">
      {options.map((option) => (
        <div key={option.id} className="flex items-center space-x-2">
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              className="sr-only peer"
              checked={selectedOption === option.id}
              onChange={() => handleToggle(option.id)}
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
            <span className="ml-3 text-sm font-medium text-gray-900">
              {option.label}
            </span>
          </label>
        </div>
      ))}
    </div>
  );
}
