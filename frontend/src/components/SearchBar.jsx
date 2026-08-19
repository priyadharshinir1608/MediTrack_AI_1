import React from 'react';
import { FiSearch } from 'react-icons/fi';

const SearchBar = ({ placeholder, onChange, value }) => {
  return (
    <div className="search-bar" style={{ position: 'relative', width: '100%', maxWidth: '400px' }}>
      <FiSearch style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
      <input 
        type="text" 
        placeholder={placeholder || "Search..."} 
        value={value}
        onChange={onChange}
        className="form-input"
        style={{ width: '100%', paddingLeft: '2.5rem', borderRadius: '999px', background: 'rgba(255, 255, 255, 0.05)' }}
      />
    </div>
  );
};

export default SearchBar;
