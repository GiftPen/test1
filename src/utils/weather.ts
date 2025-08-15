import { WeatherData, ForecastData, WeatherLocation, HourlyForecastData } from '../types/weather';

// Open-Meteo API (완전 무료, API 키 불필요)
const OPEN_METEO_BASE_URL = 'https://api.open-meteo.com/v1';

// 캐시 및 요청 제한
const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5분 캐시

const getCachedData = (key: string) => {
  const cached = cache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }
  return null;
};

const setCachedData = (key: string, data: any) => {
  cache.set(key, { data, timestamp: Date.now() });
};

// 날씨 코드를 설명으로 변환하는 함수
const getWeatherDescription = (code: number): { main: string; description: string; icon: string } => {
  const weatherCodes: { [key: number]: { main: string; description: string; icon: string } } = {
    0: { main: 'Clear', description: '맑음', icon: '01d' },
    1: { main: 'Clear', description: '대체로 맑음', icon: '01d' },
    2: { main: 'Clouds', description: '일부 흐림', icon: '02d' },
    3: { main: 'Clouds', description: '흐림', icon: '03d' },
    45: { main: 'Fog', description: '안개', icon: '50d' },
    48: { main: 'Fog', description: '서리 안개', icon: '50d' },
    51: { main: 'Drizzle', description: '약한 이슬비', icon: '09d' },
    53: { main: 'Drizzle', description: '이슬비', icon: '09d' },
    55: { main: 'Drizzle', description: '강한 이슬비', icon: '09d' },
    61: { main: 'Rain', description: '약한 비', icon: '10d' },
    63: { main: 'Rain', description: '비', icon: '10d' },
    65: { main: 'Rain', description: '강한 비', icon: '10d' },
    71: { main: 'Snow', description: '약한 눈', icon: '13d' },
    73: { main: 'Snow', description: '눈', icon: '13d' },
    75: { main: 'Snow', description: '강한 눈', icon: '13d' },
    77: { main: 'Snow', description: '진눈깨비', icon: '13d' },
    80: { main: 'Rain', description: '약한 소나기', icon: '09d' },
    81: { main: 'Rain', description: '소나기', icon: '09d' },
    82: { main: 'Rain', description: '강한 소나기', icon: '09d' },
    85: { main: 'Snow', description: '약한 눈 소나기', icon: '13d' },
    86: { main: 'Snow', description: '눈 소나기', icon: '13d' },
    95: { main: 'Thunderstorm', description: '뇌우', icon: '11d' },
    96: { main: 'Thunderstorm', description: '약한 우박을 동반한 뇌우', icon: '11d' },
    99: { main: 'Thunderstorm', description: '강한 우박을 동반한 뇌우', icon: '11d' }
  };

  return weatherCodes[code] || { main: 'Unknown', description: '알 수 없음', icon: '01d' };
};


export const fetchCurrentWeather = async (location: WeatherLocation): Promise<WeatherData> => {
  const cacheKey = `current_${location.lat}_${location.lon}`;
  const cachedData = getCachedData(cacheKey);
  
  if (cachedData) {
    return cachedData;
  }
  
  // 단일 API 호출로 통합
  const url = `${OPEN_METEO_BASE_URL}/forecast?latitude=${location.lat}&longitude=${location.lon}&current_weather=true&daily=temperature_2m_max,temperature_2m_min&timezone=auto&forecast_days=1`;
  
  try {
    console.log('날씨 API 요청:', url);
    const response = await fetch(url);
    
    if (!response.ok) {
      console.error('API 응답 오류:', response.status, response.statusText);
      throw new Error(`날씨 정보를 가져올 수 없습니다. (${response.status})`);
    }
    
    const data = await response.json();
    console.log('날씨 API 응답:', data);
    
    // 데이터 변환
    const weather = getWeatherDescription(data.current_weather.weathercode);
    
    const result = {
      name: location.name,
      coord: {
        lat: data.latitude,
        lon: data.longitude
      },
      main: {
        temp: data.current_weather.temperature,
        feels_like: data.current_weather.temperature,
        temp_min: data.daily.temperature_2m_min[0],
        temp_max: data.daily.temperature_2m_max[0],
        pressure: 1013,
        humidity: 65
      },
      weather: [{
        id: data.current_weather.weathercode,
        main: weather.main,
        description: weather.description,
        icon: weather.icon
      }],
      wind: {
        speed: data.current_weather.windspeed,
        deg: data.current_weather.winddirection
      },
      sys: {
        country: location.country || 'XX',
        sunrise: Date.now() / 1000,
        sunset: Date.now() / 1000 + 12 * 3600
      },
      dt: new Date(data.current_weather.time).getTime() / 1000
    };
    
    setCachedData(cacheKey, result);
    return result;
  } catch (error) {
    console.error('Weather fetch error:', error);
    throw new Error('날씨 정보를 불러오는 중 오류가 발생했습니다.');
  }
};

export const fetchWeatherByCity = async (cityName: string): Promise<WeatherData> => {
  // 도시 이름을 좌표로 변환 (Nominatim API 사용 - 무료)
  const geocodeUrl = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(cityName)}&format=json&limit=1&addressdetails=1`;
  
  try {
    const geocodeResponse = await fetch(geocodeUrl);
    if (!geocodeResponse.ok) {
      throw new Error('지역 정보를 찾을 수 없습니다.');
    }
    
    const geocodeData = await geocodeResponse.json();
    if (!geocodeData || geocodeData.length === 0) {
      throw new Error('해당 지역을 찾을 수 없습니다.');
    }
    
    const lat = parseFloat(geocodeData[0].lat);
    const lon = parseFloat(geocodeData[0].lon);
    const displayName = geocodeData[0].display_name.split(',')[0];
    
    const countryCode = geocodeData[0].country_code?.toUpperCase() || geocodeData[0].address?.country_code?.toUpperCase() || 'XX';
    
    const location: WeatherLocation = {
      lat,
      lon,
      name: displayName,
      country: countryCode
    };
    
    return await fetchCurrentWeather(location);
  } catch (error) {
    console.error('City weather fetch error:', error);
    throw new Error('해당 지역의 날씨 정보를 찾을 수 없습니다.');
  }
};

export const fetchWeatherForecast = async (location: WeatherLocation): Promise<ForecastData> => {
  const cacheKey = `forecast_${location.lat}_${location.lon}`;
  const cachedData = getCachedData(cacheKey);
  
  if (cachedData) {
    return cachedData;
  }
  
  const url = `${OPEN_METEO_BASE_URL}/forecast?latitude=${location.lat}&longitude=${location.lon}&daily=temperature_2m_max,temperature_2m_min,weathercode&timezone=auto&forecast_days=7`;
  
  try {
    // 요청 지연 추가 (API 제한 회피)
    await new Promise(resolve => setTimeout(resolve, 500));
    
    console.log('예보 API 요청:', url);
    const response = await fetch(url);
    if (!response.ok) {
      console.error('예보 API 응답 오류:', response.status, response.statusText);
      throw new Error(`일기예보 정보를 가져올 수 없습니다. (${response.status})`);
    }
    
    const data = await response.json();
    console.log('예보 API 응답:', data);
    
    // 데이터 변환
    const forecastList = data.daily.time.slice(0, 7).map((time: string, index: number) => {
      const weather = getWeatherDescription(data.daily.weathercode[index]);
      
      return {
        dt: new Date(time).getTime() / 1000,
        main: {
          temp: (data.daily.temperature_2m_max[index] + data.daily.temperature_2m_min[index]) / 2,
          temp_min: data.daily.temperature_2m_min[index],
          temp_max: data.daily.temperature_2m_max[index],
          humidity: 65 // 기본값
        },
        weather: [{
          id: data.daily.weathercode[index],
          main: weather.main,
          description: weather.description,
          icon: weather.icon
        }],
        dt_txt: time
      };
    });

    const result = {
      list: forecastList,
      city: {
        name: location.name,
        country: location.country || 'XX'
      }
    };
    
    setCachedData(cacheKey, result);
    return result;
  } catch (error) {
    console.error('Forecast fetch error:', error);
    throw new Error('일기예보 정보를 불러오는 중 오류가 발생했습니다.');
  }
};

export const getWeatherIconUrl = (iconCode: string): string => {
  return `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
};

export const formatTemperature = (temp: number): string => {
  return `${Math.round(temp)}°C`;
};

export const formatDate = (timestamp: number): string => {
  const date = new Date(timestamp * 1000);
  const options: Intl.DateTimeFormatOptions = {
    month: 'short',
    day: 'numeric',
    weekday: 'short',
  };
  return date.toLocaleDateString('ko-KR', options);
};

export const formatTime = (timestamp: number): string => {
  const date = new Date(timestamp * 1000);
  return date.toLocaleTimeString('ko-KR', {
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const fetchHourlyForecast = async (location: WeatherLocation): Promise<HourlyForecastData> => {
  const cacheKey = `hourly_${location.lat}_${location.lon}`;
  const cachedData = getCachedData(cacheKey);
  
  if (cachedData) {
    return cachedData;
  }
  
  // 오늘 하루의 시간대별 데이터 (1시간 간격)
  const url = `${OPEN_METEO_BASE_URL}/forecast?latitude=${location.lat}&longitude=${location.lon}&hourly=temperature_2m,weathercode&timezone=auto&forecast_days=1`;
  
  try {
    console.log('시간대별 예보 API 요청:', url);
    const response = await fetch(url);
    
    if (!response.ok) {
      console.error('시간대별 예보 API 응답 오류:', response.status, response.statusText);
      throw new Error(`시간대별 예보 정보를 가져올 수 없습니다. (${response.status})`);
    }
    
    const data = await response.json();
    console.log('시간대별 예보 API 응답:', data);
    
    // 오늘 0시부터 23시까지 24시간 데이터
    const today = new Date();
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    
    const hourlyList = [];
    for (let hour = 0; hour < 24; hour++) {
      // API 데이터에서 해당 시간 찾기
      const matchingIndex = data.hourly.time.findIndex((timeStr: string) => {
        const apiTime = new Date(timeStr);
        return apiTime.getHours() === hour && 
               apiTime.getDate() === todayStart.getDate() &&
               apiTime.getMonth() === todayStart.getMonth() &&
               apiTime.getFullYear() === todayStart.getFullYear();
      });
      
      if (matchingIndex !== -1) {
        const time = data.hourly.time[matchingIndex];
        const weather = getWeatherDescription(data.hourly.weathercode[matchingIndex]);
        
        hourlyList.push({
          dt: new Date(time).getTime() / 1000,
          temp: data.hourly.temperature_2m[matchingIndex],
          weather: {
            id: data.hourly.weathercode[matchingIndex],
            main: weather.main,
            description: weather.description,
            icon: weather.icon
          },
          dt_txt: time
        });
      }
    }
    
    const result = {
      list: hourlyList
    };
    
    setCachedData(cacheKey, result);
    return result;
  } catch (error) {
    console.error('Hourly forecast fetch error:', error);
    throw new Error('시간대별 예보 정보를 불러오는 중 오류가 발생했습니다.');
  }
};