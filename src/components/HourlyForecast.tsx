import React, { useRef, useEffect } from 'react';
import { HourlyForecastData } from '../types/weather';
import { getWeatherIconUrl, formatTemperature } from '../utils/weather';

interface HourlyForecastProps {
  hourlyData: HourlyForecastData | null;
  isLoading: boolean;
  error: string | null;
}

const HourlyForecast: React.FC<HourlyForecastProps> = ({ hourlyData, isLoading, error }) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const currentHourRef = useRef<HTMLDivElement>(null);

  // 현재 시간으로 스크롤 이동 - Hook을 최상단에 배치
  useEffect(() => {
    if (hourlyData && !isLoading && !error && currentHourRef.current && scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const currentElement = currentHourRef.current;
      
      const scrollLeft = currentElement.offsetLeft - (container.clientWidth / 2) + (currentElement.clientWidth / 2);
      container.scrollTo({
        left: Math.max(0, scrollLeft),
        behavior: 'smooth'
      });
    }
  }, [hourlyData, isLoading, error]);

  if (isLoading) {
    return (
      <div className="hourly-forecast loading">
        <div className="loading-spinner">시간대별 예보를 불러오는 중...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="hourly-forecast error">
        <div className="error-message">{error}</div>
      </div>
    );
  }

  if (!hourlyData || !hourlyData.list.length) {
    return null;
  }

  const formatHour = (timestamp: number): string => {
    const date = new Date(timestamp * 1000);
    const hours = date.getHours();
    
    if (hours === 0) return '자정';
    if (hours === 12) return '정오';
    if (hours < 12) return `오전 ${hours}시`;
    return `오후 ${hours - 12}시`;
  };

  const getCurrentHour = (): number => {
    return new Date().getHours();
  };

  const currentHour = getCurrentHour();

  return (
    <div className="hourly-forecast">
      <h2>오늘 시간대별 날씨</h2>
      <div className="hourly-list" ref={scrollContainerRef}>
        {hourlyData.list.map((hourly) => {
          const hourlyTime = new Date(hourly.dt * 1000);
          const hourlyHour = hourlyTime.getHours();
          
          const isCurrentHour = hourlyHour === currentHour;
          const isPastHour = hourlyHour < currentHour;
          const isFutureHour = hourlyHour > currentHour;
          
          return (
            <div 
              key={hourly.dt} 
              ref={isCurrentHour ? currentHourRef : null}
              className={`hourly-item ${isCurrentHour ? 'current' : ''} ${isPastHour ? 'past' : ''} ${isFutureHour ? 'future' : ''}`}
            >
              <div className="hourly-time">
                {isCurrentHour ? '지금' : formatHour(hourly.dt)}
              </div>
              
              <div className="hourly-icon">
                <img 
                  src={getWeatherIconUrl(hourly.weather.icon)} 
                  alt={hourly.weather.description}
                />
              </div>
              
              <div className="hourly-description">
                {hourly.weather.description}
              </div>
              
              <div className="hourly-temp">
                {formatTemperature(hourly.temp)}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default HourlyForecast;