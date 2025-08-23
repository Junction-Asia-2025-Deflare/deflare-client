import axiosInstance from "./axiosInstance";

/**
 * Fire 관련 API
 */
// Init Fire
export const initFire = async () => {
  const res = await axiosInstance.get("/api/v1/fire/init");
  return res.data;
};

/**
 * Route 관련 API
 */

// Get Safe Path
export const getSafePath = async (lat: number, lon: number) => {
  const { data } = await axiosInstance.get("/api/v1/route/path", {
    params: { lat, lon },
  });
  return data;
};

/**
 * Shelter 관련 API
 */

// Load Shelters
export const loadShelters = async () => {
  const res = await axiosInstance.get("/api/v1/shelter");
  return res.data;
};
