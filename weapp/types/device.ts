import type { PageReq } from './base';

export enum DeviceStatus {
  DISABLED = 0,
  ENABLED = 1,
}

export interface DeviceListReq extends PageReq {
  id?: number;
  deviceCode?: string;
  deviceName?: string;
  location?: string;
  adcode?: string;
  status?: DeviceStatus;
  userLng?: number;
  userLat?: number;
  withDistance?: boolean;
}

export interface Device {
  id: number;
  deviceCode: string;
  deviceName: string;
  location: string;
  address: string;
  adcode?: string;
  apiKey?: string;
  apiUrl?: string;
  cncDeviceStatus?: string;
  createdAt?: string;
  createdBy?: number;
  lastStatusCheck?: string;
  remark?: string;
  sort?: number;
  status?: number;
  updatedAt?: string;
  updatedBy?: number;
  uvDeviceStatus?: string;
  contact?: string; // 联系人
  contactName?: string; // 联系人姓名
  contactAddress?: string; // 联系人地址
  distance?: number | string;
}

export interface DeviceListRes {
  list: Device[];
}
