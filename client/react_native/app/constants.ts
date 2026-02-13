import { API_URL, API_PORT } from "@env";

export const SERVER_URL = `https://${API_URL}:${API_PORT}`;

export const EMPTY_ROUTE = {
  type: "FeatureCollection",
  features: [],
};