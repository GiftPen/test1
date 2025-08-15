// Open-Meteo API 타입 정의
export interface OpenMeteoCurrentWeather {
  latitude: number;
  longitude: number;
  current: {
    time: string;
    temperature_2m: number;
    apparent_temperature: number;
    humidity: number;
    pressure_msl: number;
    wind_speed_10m: number;
    wind_direction_10m: number;
    weather_code: number;
  };
  daily: {
    time: string[];
    temperature_2m_max: number[];
    temperature_2m_min: number[];
    sunrise: string[];
    sunset: string[];
  };
}

export interface OpenMeteoForecast {
  latitude: number;
  longitude: number;
  daily: {
    time: string[];
    temperature_2m_max: number[];
    temperature_2m_min: number[];
    weather_code: number[];
    precipitation_sum: number[];
    humidity: number[];
  };
}

// 기존 WeatherData 인터페이스 (Open-Meteo 데이터를 변환하여 사용)
export interface WeatherData {
  name: string;
  coord: {
    lat: number;
    lon: number;
  };
  main: {
    temp: number;
    feels_like: number;
    temp_min: number;
    temp_max: number;
    pressure: number;
    humidity: number;
  };
  weather: Array<{
    id: number;
    main: string;
    description: string;
    icon: string;
  }>;
  wind: {
    speed: number;
    deg: number;
  };
  sys: {
    country: string;
    sunrise: number;
    sunset: number;
  };
  dt: number;
}

export interface ForecastData {
  list: Array<{
    dt: number;
    main: {
      temp: number;
      temp_min: number;
      temp_max: number;
      humidity: number;
    };
    weather: Array<{
      id: number;
      main: string;
      description: string;
      icon: string;
    }>;
    dt_txt: string;
  }>;
  city: {
    name: string;
    country: string;
  };
}

export interface WeatherLocation {
  lat: number;
  lon: number;
  name: string;
  country?: string;
}

export interface HourlyForecastData {
  list: Array<{
    dt: number;
    temp: number;
    weather: {
      id: number;
      main: string;
      description: string;
      icon: string;
    };
    dt_txt: string;
  }>;
}

export interface WeatherApiError {
  cod: string;
  message: string;
}