import React, { useState } from 'react';

interface LocationInputProps {
  onLocationChange: (city: string) => void;
  onMyLocationClick: () => void;
  currentLocation: string;
}

const LocationInput: React.FC<LocationInputProps> = ({ onLocationChange, onMyLocationClick, currentLocation }) => {
  const [inputValue, setInputValue] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      onLocationChange(inputValue.trim());
      setInputValue('');
    }
  };

  return (
    <div className="location-input-container">
      <div className="location-form">
        <button 
          type="button" 
          onClick={onMyLocationClick}
          className="my-location-button"
          title="내 위치로 이동"
        >
          📍
        </button>
        <form onSubmit={handleSubmit} className="location-search-form">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder={`현재 위치: ${currentLocation}`}
            className="location-input"
          />
          <button type="submit" className="location-button">
            🔍
          </button>
        </form>
      </div>
    </div>
  );
};

export default LocationInput;