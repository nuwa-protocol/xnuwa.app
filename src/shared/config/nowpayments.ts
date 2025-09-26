/**
 * NowPayments Configuration
 */

export const NOWPAYMENTS_IPN_CALLBACK_URL =
  'https://nowpayment-service-test.up.railway.app/webhook/nowpayments';

interface NowPaymentsConfig {
  appUrl: string;
  appName: string;
  isDevelopment: boolean;
}

// 获取NowPayments配置（仅前端配置）
export function getNowPaymentsConfig(): NowPaymentsConfig {
  return {
    appUrl:
      import.meta.env.VITE_APP_URL ||
      'https://nowpayment-service-test.up.railway.app',
    appName: import.meta.env.VITE_APP_NAME || 'NUWA Client',
    isDevelopment: import.meta.env.MODE === 'development',
  };
}

// 延迟初始化配置
let configInstance: NowPaymentsConfig | null = null;

export function getConfig(): NowPaymentsConfig {
  if (!configInstance) {
    configInstance = getNowPaymentsConfig();
  }
  return configInstance;
}

// 导出类型
export type { NowPaymentsConfig };
