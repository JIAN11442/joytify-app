import z from "zod";

const deviceZodSchema = z.object({
  name: z.string(),
  type: z.string(),
  os: z.string(),
  osVersion: z.string(),
  screen: z.object({
    width: z.number(),
    height: z.number(),
    pixelRatio: z.number(),
  }),
  isTouch: z.boolean(),
  isMobile: z.boolean(),
  isTablet: z.boolean(),
  isDesktop: z.boolean(),
});

const browserZodSchema = z.object({
  name: z.string(),
  version: z.string(),
  engine: z.string(),
  engineVersion: z.string(),
});

const networkZodSchame = z.object({
  type: z.string(),
  downlink: z.number(),
  rtt: z.number(),
  saveData: z.boolean(),
});

const locationZodSchema = z.object({
  ipAddress: z.string(),
  country: z.string(),
  region: z.string(),
  city: z.string(),
  timezone: z.string(),
  isp: z.string(),
});

const statusZodSchema = z.object({
  online: z.boolean(),
  lastActive: z.string(),
});

export const sessionZodSchema = z.object({
  userAgent: z.string(),
  device: deviceZodSchema,
  browser: browserZodSchema,
  network: networkZodSchame,
  location: locationZodSchema,
  status: statusZodSchema,
});
