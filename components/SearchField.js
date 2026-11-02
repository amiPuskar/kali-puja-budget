import { Search } from 'lucide-react';

export default function SearchField({ value, onChange, placeholder = 'Search...' }) {
  return (
    <div className="relative w-full max-w-md">
      <Search
        className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
        aria-hidden="true"
      />
      <input
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
        className="input-field pl-10"
      />
    </div>
  );
}
