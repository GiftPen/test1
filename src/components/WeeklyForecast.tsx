import React from 'react';
import { ForecastData } from '../types/weather';
import { getWeatherIconUrl, formatTemperature, formatDate } from '../utils/weather';

interface WeeklyForecastProps {
  forecastData: ForecastData | null;
  isLoading: boolean;
  error: string | null;
}

const WeeklyForecast: React.FC<WeeklyForecastProps> = ({ forecastData, isLoading, error }) => {
  if (isLoading) {
    return (
      <div className="weekly-forecast loading">
        <div className="loading-spinner">주간 예보를 불러오는 중...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="weekly-forecast error">
        <div className="error-message">{error}</div>
      </div>
    );
  }

  if (!forecastData) {
    return null;
  }

  const dailyForecasts = forecastData.list.slice(0, 7);

  return (
    <div className="weekly-forecast">
      <h2>주간 일기예보</h2>
      <div className="forecast-list">
        {dailyForecasts.map((forecast, index) => {
          const weather = forecast.weather[0];
          const isToday = index === 0;
          
          return (
            <div key={forecast.dt} className={`forecast-item ${isToday ? 'today' : ''}`}>
              <div className="forecast-date">
                {isToday ? '오늘' : formatDate(forecast.dt)}
              </div>
              
              <div className="forecast-icon">
                <img 
                  src={getWeatherIconUrl(weather.icon)} 
                  alt={weather.description}
                />
              </div>
              
              <div className="forecast-description">
                {weather.description}
              </div>
              
              <div className="forecast-temp">
                <span className="temp-max">{formatTemperature(forecast.main.temp_max)}</span>
                <span className="temp-min">{formatTemperature(forecast.main.temp_min)}</span>
              </div>
              
              <div className="forecast-humidity">
                습도 {forecast.main.humidity}%
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default WeeklyForecast;