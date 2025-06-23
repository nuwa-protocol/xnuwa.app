interface GeoLocation {
  latitude: string | undefined;
  longitude: string | undefined;
}

const getClientLocation = async (): Promise<GeoLocation> => {
  // Try to use the browser's location API
  if (navigator.geolocation) {
    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude.toString(),
            longitude: position.coords.longitude.toString(),
          });
        },
        () => {
          // If location retrieval fails, return default value
          resolve({
            latitude: undefined,
            longitude: undefined,
          });
        },
      );
    });
  }
  return {
    latitude: undefined,
    longitude: undefined,
  };
};

export { getClientLocation };
