import React, { useState, useEffect, useRef } from 'react';
import LocationInput from './components/LocationInput';
import WeatherDisplay from './components/WeatherDisplay';
import HourlyForecast from './components/HourlyForecast';
import WeeklyForecast from './components/WeeklyForecast';
import { WeatherData, ForecastData, WeatherLocation, HourlyForecastData } from './types/weather';
import { getCurrentLocation, getSeoulLocation, formatLocationName, reverseGeocode } from './utils/location';
import { fetchCurrentWeather, fetchWeatherByCity, fetchWeatherForecast, fetchHourlyForecast } from './utils/weather';
import './App.css';

const App: React.FC = () => {
  const [currentWeather, setCurrentWeather] = useState<WeatherData | null>(null);
  const [forecastData, setForecastData] = useState<ForecastData | null>(null);
  const [hourlyData, setHourlyData] = useState<HourlyForecastData | null>(null);
  const [currentLocation, setCurrentLocation] = useState<WeatherLocation>(getSeoulLocation());
  const [weatherLoading, setWeatherLoading] = useState(true);
  const [forecastLoading, setForecastLoading] = useState(true);
  const [hourlyLoading, setHourlyLoading] = useState(true);
  const [weatherError, setWeatherError] = useState<string | null>(null);
  const [forecastError, setForecastError] = useState<string | null>(null);
  const [hourlyError, setHourlyError] = useState<string | null>(null);
  const locationPermissionRequested = useRef(false);

  const requestLocationPermission = async () => {
    if (locationPermissionRequested.current) return;
    
    locationPermissionRequested.current = true;
    
    // 위치 요청 없이 바로 서울 날씨 로드
    const seoulLocation = getSeoulLocation();
    await loadWeatherData(seoulLocation);
    await loadForecastData(seoulLocation);
    await loadHourlyData(seoulLocation);
    
    // 사용자에게 위치 허용 여부 묻기
    setTimeout(() => {
      const shouldRequestLocation = window.confirm(
        '현재 위치의 날씨 정보를 보시겠습니까? 거부하시면 서울의 날씨를 계속 보여드립니다.'
      );
      
      if (shouldRequestLocation) {
        getCurrentLocation()
          .then(async position => {
            // 역지오코딩으로 실제 지역명 가져오기
            const locationInfo = await reverseGeocode(position.coords.latitude, position.coords.longitude);
            
            const userLocation: WeatherLocation = {
              lat: position.coords.latitude,
              lon: position.coords.longitude,
              name: `${locationInfo.name} (현재위치)`,
              country: locationInfo.country,
            };
            
            // 새로운 위치의 날씨 데이터를 직접 로드
            try {
              await loadWeatherData(userLocation);
              await loadForecastData(userLocation);
              await loadHourlyData(userLocation);
              setCurrentLocation(userLocation);
            } catch (error) {
              console.error('위치 기반 날씨 로드 실패:', error);
              alert('현재 위치의 날씨 정보를 가져올 수 없습니다. 서울 날씨를 계속 표시합니다.');
            }
          })
          .catch(error => {
            console.log('위치 정보 사용 불가:', error);
            alert('위치 정보에 접근할 수 없습니다. 서울 날씨를 계속 표시합니다.');
          });
      }
    }, 1000);
  };

  const loadWeatherData = async (location: WeatherLocation) => {
    setWeatherLoading(true);
    setWeatherError(null);

    try {
      const weather = await fetchCurrentWeather(location);
      setCurrentWeather(weather);
      setCurrentLocation({
        ...location,
        name: weather.name,
      });
    } catch (error) {
      setWeatherError(error instanceof Error ? error.message : '날씨 정보를 불러올 수 없습니다.');
    } finally {
      setWeatherLoading(false);
    }
  };

  const loadForecastData = async (location: WeatherLocation) => {
    setForecastLoading(true);
    setForecastError(null);

    try {
      const forecast = await fetchWeatherForecast(location);
      setForecastData(forecast);
    } catch (error) {
      setForecastError(error instanceof Error ? error.message : '일기예보 정보를 불러올 수 없습니다.');
    } finally {
      setForecastLoading(false);
    }
  };

  const loadHourlyData = async (location: WeatherLocation) => {
    setHourlyLoading(true);
    setHourlyError(null);

    try {
      const hourly = await fetchHourlyForecast(location);
      setHourlyData(hourly);
    } catch (error) {
      setHourlyError(error instanceof Error ? error.message : '시간대별 예보 정보를 불러올 수 없습니다.');
    } finally {
      setHourlyLoading(false);
    }
  };

  const handleLocationChange = async (cityName: string) => {
    setWeatherLoading(true);
    setForecastLoading(true);
    setHourlyLoading(true);
    setWeatherError(null);
    setForecastError(null);
    setHourlyError(null);

    try {
      const weather = await fetchWeatherByCity(cityName);
      const newLocation: WeatherLocation = {
        lat: weather.coord.lat,
        lon: weather.coord.lon,
        name: weather.name,
        country: weather.sys.country,
      };
      
      setCurrentWeather(weather);
      setCurrentLocation(newLocation);
      
      const forecast = await fetchWeatherForecast(newLocation);
      setForecastData(forecast);
      
      const hourly = await fetchHourlyForecast(newLocation);
      setHourlyData(hourly);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '해당 지역의 날씨 정보를 찾을 수 없습니다.';
      setWeatherError(errorMessage);
      setForecastError(errorMessage);
      setHourlyError(errorMessage);
    } finally {
      setWeatherLoading(false);
      setForecastLoading(false);
      setHourlyLoading(false);
    }
  };

  const handleMyLocationClick = async () => {
    try {
      setWeatherLoading(true);
      setForecastLoading(true);
      setHourlyLoading(true);
      setWeatherError(null);
      setForecastError(null);
      setHourlyError(null);

      const position = await getCurrentLocation();
      const locationInfo = await reverseGeocode(position.coords.latitude, position.coords.longitude);
      
      const userLocation: WeatherLocation = {
        lat: position.coords.latitude,
        lon: position.coords.longitude,
        name: `${locationInfo.name} (현재위치)`,
        country: locationInfo.country,
      };

      await loadWeatherData(userLocation);
      await loadForecastData(userLocation);
      await loadHourlyData(userLocation);
      setCurrentLocation(userLocation);
    } catch (error) {
      console.error('내 위치 날씨 로드 실패:', error);
      
      // 위치 권한 관련 에러 메시지 개선
      let errorMessage = '현재 위치의 날씨 정보를 가져올 수 없습니다.';
      
      if (error instanceof Error) {
        if (error.message.includes('denied') || error.message.includes('거부')) {
          errorMessage = '위치 접근이 거부되었습니다. 브라우저 설정에서 위치 권한을 허용해주세요.';
        } else if (error.message.includes('unavailable') || error.message.includes('사용할 수 없습니다')) {
          errorMessage = '현재 위치를 찾을 수 없습니다. GPS가 활성화되어 있는지 확인해주세요.';
        } else if (error.message.includes('timeout') || error.message.includes('시간')) {
          errorMessage = '위치 검색 시간이 초과되었습니다. 다시 시도해주세요.';
        }
      }
      
      alert(errorMessage);
      
      // 에러 상태 초기화
      setWeatherLoading(false);
      setForecastLoading(false);
      setHourlyLoading(false);
    }
  };

  useEffect(() => {
    requestLocationPermission();
    
    return () => {
      // cleanup function - StrictMode에서 재실행 방지
    };
  }, []);

  // currentLocation 변경시 자동 로드는 제거 (수동으로 관리)

  return (
    <div className="app">
      <header className="app-header">
        <LocationInput 
          onLocationChange={handleLocationChange}
          onMyLocationClick={handleMyLocationClick}
          currentLocation={formatLocationName(currentLocation.name, currentLocation.country)}
        />
      </header>

      <main className="app-main">
        <WeatherDisplay 
          weatherData={currentWeather}
          isLoading={weatherLoading}
          error={weatherError}
        />
        
        <HourlyForecast 
          hourlyData={hourlyData}
          isLoading={hourlyLoading}
          error={hourlyError}
        />
        
        <WeeklyForecast 
          forecastData={forecastData}
          isLoading={forecastLoading}
          error={forecastError}
        />
      </main>
    </div>
  );
};

export default App;