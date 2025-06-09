import { RequestHandler } from "express";
import { HttpCode } from "@joytify/shared-types/constants";
import { IP2LOCATION_KEY } from "../constants/env-validate.constant";

const { OK } = HttpCode;

// get client's IP address from request headers
export const getIPAddressFromHeaders: RequestHandler = async (req, res, next) => {
  try {
    const ip =
      req.headers["x-forwarded-for"]?.toString().split(",")[0] ||
      req.headers["x-real-ip"]?.toString() ||
      req.socket.remoteAddress ||
      "Unknown";

    return res.status(OK).json({ ip });
  } catch (error) {
    next(error);
  }
};

// get IP address from Cloudflare's trace endpoint
export const getIPAddressFromCloudflare: RequestHandler = async (req, res, next) => {
  try {
    const response = await fetch("https://cloudflare.com/cdn-cgi/trace");
    const data = await response.text();
    const ipMatch = data.match(/ip=(.+)/);
    const ip = ipMatch ? ipMatch[1] : "Unknown";

    return res.status(OK).json({ ip });
  } catch (error) {
    next(error);
  }
};

// get detailed location information for an IP address
export const getIPAddressLocation: RequestHandler = async (req, res, next) => {
  try {
    const { ip } = req.params;

    const response = await fetch(`https://api.ip2location.io/?key=${IP2LOCATION_KEY}&ip=${ip}`);
    const data = await response.json();

    return res.status(OK).json(data);
  } catch (error) {
    next(error);
  }
};
