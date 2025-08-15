import { WeatherLocation } from '../types/weather';

export const getCurrentLocation = (): Promise<any> => {
  return new Promise((resolve, reject) => {
    console.log('위치 정보 요청 시작...');
    
    if (!navigator.geolocation) {
      console.error('Geolocation not supported');
      reject(new Error('브라우저에서 위치 정보를 지원하지 않습니다.'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        console.log('위치 정보 수신:', position.coords);
        resolve(position);
      },
      (error) => {
        console.error('위치 정보 오류:', error);
        switch (error.code) {
          case error.PERMISSION_DENIED:
            reject(new Error('위치 정보 접근이 거부되었습니다.'));
            break;
          case error.POSITION_UNAVAILABLE:
            reject(new Error('위치 정보를 사용할 수 없습니다.'));
            break;
          case error.TIMEOUT:
            reject(new Error('위치 정보 요청 시간이 초과되었습니다.'));
            break;
          default:
            reject(new Error('알 수 없는 오류가 발생했습니다.'));
            break;
        }
      },
      {
        enableHighAccuracy: false, // 더 빠른 응답을 위해 false로 변경
        timeout: 10000, // 10초로 증가
        maximumAge: 60000, // 1분으로 감소
      }
    );
  });
};

export const getSeoulLocation = (): WeatherLocation => {
  return {
    lat: 37.5665,
    lon: 126.9780,
    name: '서울',
    country: 'KR',
  };
};

// 좌표를 실제 지역명으로 변환하는 역지오코딩 함수
export const reverseGeocode = async (lat: number, lon: number): Promise<{ name: string; country: string }> => {
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&accept-language=ko`;
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error('역지오코딩 실패');
    }
    
    const data = await response.json();
    
    const countryCode = data.address?.country_code?.toUpperCase() || 'XX';
    
    // 한국어 지역명 추출
    if (data.address) {
      const address = data.address;
      // 도시, 구, 동 순으로 우선순위
      const locationParts = [
        address.city || address.town || address.village,
        address.borough || address.city_district || address.suburb,
        address.neighbourhood || address.hamlet
      ].filter(Boolean);
      
      if (locationParts.length > 0) {
        return {
          name: locationParts.slice(0, 2).join(' '), // 최대 2개 부분만 사용
          country: countryCode
        };
      }
    }
    
    // fallback: display_name에서 첫 번째 부분 사용
    if (data.display_name) {
      const firstPart = data.display_name.split(',')[0];
      return {
        name: firstPart.trim(),
        country: countryCode
      };
    }
    
    return {
      name: '현재 위치',
      country: countryCode
    };
  } catch (error) {
    console.error('역지오코딩 오류:', error);
    return {
      name: '현재 위치',
      country: 'XX'
    };
  }
};

export const formatLocationName = (name: string, country?: string): string => {
  // (현재위치) 라벨이 있는 경우 그대로 표시
  if (name.includes('(현재위치)')) {
    return name;
  }
  
  if (country && country !== 'KR') {
    return `${name}, ${country}`;
  }
  return name;
};