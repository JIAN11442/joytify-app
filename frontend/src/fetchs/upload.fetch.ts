import API from "../config/api-client.config";

export const uploadMusic = async (data: object = {}) =>
  API.post("/upload", data);
