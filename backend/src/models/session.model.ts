import mongoose from "mongoose";

export interface SessionDocument extends mongoose.Document {
  user: mongoose.Types.ObjectId;
  userAgent: string;
  device: {
    name: string; // 設備品牌/型號
    type: string; // 設備類型 (Mobile/Tablet/Desktop)
    os: string; // 操作系統
    osVersion: string; // 操作系統版本
    screen: {
      // 螢幕信息
      width: number;
      height: number;
      pixelRatio: number;
    };
    isTouch: boolean; // 是否支援觸控
    isMobile: boolean; // 是否為移動設備
    isTablet: boolean; // 是否為平板
    isDesktop: boolean; // 是否為桌面設備
  };
  browser: {
    name: string; // 瀏覽器名稱
    version: string; // 瀏覽器版本
    engine: string; // 瀏覽器引擎
    engineVersion: string; // 引擎版本
  };
  network: {
    type: string; // 網絡類型 (4G/5G/WiFi)
    downlink: number; // 下載速度
    rtt: number; // 往返時間
    saveData: boolean; // 是否啟用省流量模式
  };
  location: {
    ipAddress: string; // IP 地址
    country: string; // 國家
    region: string; // 地區
    city: string; // 城市
    timezone: string; // 時區
    isp: string; // 網絡服務提供商
  };
  status: {
    online: boolean; // 是否在線
    lastActive: Date; // 最後活動時間
  };
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const sessionSchema = new mongoose.Schema<SessionDocument>(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    userAgent: { type: String },
    device: {
      name: { type: String },
      type: { type: String },
      os: { type: String },
      osVersion: { type: String },
      screen: { type: Object },
      isTouch: { type: Boolean },
      isMobile: { type: Boolean },
      isTablet: { type: Boolean },
      isDesktop: { type: Boolean },
    },
    browser: {
      name: { type: String },
      version: { type: String },
      engine: { type: String },
      engineVersion: { type: String },
    },
    network: {
      type: { type: String },
      downlink: { type: Number },
      rtt: { type: Number },
      saveData: { type: Boolean },
    },
    location: {
      ipAddress: { type: String },
      country: { type: String },
      region: { type: String },
      city: { type: String },
      timezone: { type: String },
      isp: { type: String },
    },
    status: {
      online: { type: Boolean, default: true },
      lastActive: { type: Date, default: Date.now },
    },
    expiresAt: { type: Date, required: true, index: { expireAfterSeconds: 0 } },
    createdAt: { type: Date, required: true, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// 添加中間件來更新 lastActive
sessionSchema.pre("save", function (next) {
  this.status.lastActive = new Date();
  next();
});

const SessionModel = mongoose.model<SessionDocument>("Session", sessionSchema);

export default SessionModel;
