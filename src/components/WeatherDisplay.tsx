import React from 'react';
import { WeatherData } from '../types/weather';
import { getWeatherIconUrl, formatTemperature, formatTime } from '../utils/weather';

interface WeatherDisplayProps {
  weatherData: WeatherData | null;
  isLoading: boolean;
  error: string | null;
}

const WeatherDisplay: React.FC<WeatherDisplayProps> = ({ weatherData, isLoading, error }) => {
  if (isLoading) {
    return (
      <div className="weather-display loading">
        <div className="loading-spinner">날씨 정보를 불러오는 중...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="weather-display error">
        <div className="error-message">{error}</div>
      </div>
    );
  }

  if (!weatherData) {
    return null;
  }

  const weather = weatherData.weather[0];
  const sunrise = formatTime(weatherData.sys.sunrise);
  const sunset = formatTime(weatherData.sys.sunset);

  return (
    <div className="weather-display">
      <div className="weather-main">
        <div className="weather-location">
          <h1>{weatherData.name}, {weatherData.sys.country}</h1>
        </div>
        
        <div className="weather-current">
          <div className="weather-icon">
            <img 
              src={getWeatherIconUrl(weather.icon)} 
              alt={weather.description}
            />
          </div>
          
          <div className="weather-info">
            <div className="temperature">
              {formatTemperature(weatherData.main.temp)}
            </div>
            <div className="description">{weather.description}</div>
            <div className="feels-like">
              체감 온도: {formatTemperature(weatherData.main.feels_like)}
            </div>
          </div>
        </div>

        <div className="weather-details">
          <div className="detail-item">
            <span className="label">최고/최저</span>
            <span className="value">
              {formatTemperature(weatherData.main.temp_max)} / {formatTemperature(weatherData.main.temp_min)}
            </span>
          </div>
          
          <div className="detail-item">
            <span className="label">습도</span>
            <span className="value">{weatherData.main.humidity}%</span>
          </div>
          
          <div className="detail-item">
            <span className="label">기압</span>
            <span className="value">{weatherData.main.pressure} hPa</span>
          </div>
          
          <div className="detail-item">
            <span className="label">풍속</span>
            <span className="value">{weatherData.wind.speed} m/s</span>
          </div>
          
          <div className="detail-item">
            <span className="label">일출/일몰</span>
            <span className="value">{sunrise} / {sunset}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WeatherDisplay;