import { useEffect, useState } from 'react';
import { Device, DeviceInfo } from '@capacitor/device';
import { isNativeApp } from '@/utils/platformDetection';

export const useDevice = () => {
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo | null>(null);

  useEffect(() => {
    if (!isNativeApp()) return;

    const fetchDeviceInfo = async () => {
      const info = await Device.getInfo();
      console.log('Device info:', info);
      setDeviceInfo(info);
    };

    fetchDeviceInfo();
  }, []);

  const getInfo = async () => {
    if (!isNativeApp()) {
      return {
        model: 'Web',
        platform: 'web' as const,
        operatingSystem: 'unknown' as const,
        osVersion: '',
        manufacturer: 'unknown',
        isVirtual: false,
        webViewVersion: '',
      };
    }
    return await Device.getInfo();
  };

  const getId = async () => {
    if (!isNativeApp()) return null;
    const id = await Device.getId();
    return id.identifier;
  };

  const getBatteryInfo = async () => {
    if (!isNativeApp()) return null;
    return await Device.getBatteryInfo();
  };

  const getLanguageCode = async () => {
    if (!isNativeApp()) return navigator.language;
    const info = await Device.getLanguageCode();
    return info.value;
  };

  return {
    deviceInfo,
    getInfo,
    getId,
    getBatteryInfo,
    getLanguageCode,
  };
};
