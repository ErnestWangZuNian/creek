
// @ts-nocheck
// @ts-ignore
import Guc from '{{{ gucPath }}}';
import { getGucConfig }  from './guc-config.ts';

const gucConfig = getGucConfig();

interface GucDefaultConfig {
  env: string;
  appId: string;
  menuCode?: string;
  isClient: boolean;
  liveTimeOut: number;
  minTime: number;
  isAutoRefsToken: boolean;
  detectionFrequency: number;
  viewPageFrequency: number;
  remainingExpirationBoundary: number;
  logoutExpirationBoundary: number;
  debug: boolean;
  tokenExpiresTime: number;
  enableCookieMode: boolean;
  isStoreCookie: boolean;
  isAutoClearCode: boolean;
  server: string;
  version: string;
}

export interface GucIns {
  TOKENKEYV2: string;
  REFRESH_TOKENV2: string;
  TOKEN_TIMEOUTV2: string;
  TOKENEXPIRESTIMEV2: string;
  USERACTIVEV2: string;
  USERMOVEMOUSELASTTIMEV2: string;
  defaultconfigs: GucDefaultConfig;
  config: GucDefaultConfig;
  storage: any;
  isCClient: boolean;
  isBClient: boolean;
  GUCUSERINFO_LOCALSTORAGE_KEY: string;
  TOKENEXPIRESTIME: string;
  TOKEN: string;
  REFRESH_TOKEN: string;
  TOKEN_TIMEOUT: string;
  USERACTIVE: string;
  USERMOVEMOUSELASTTIME: string;
  isAutoRefsToken: boolean;
  cureetUserIsActive: boolean;
  detectionFrequency: number;
  remainingExpirationBoundary: number;
  domain: string;
  dispatchUserActiveTimer: any;
  keepingCheckViewPageTimer: any;
  mainDomain: string;
  isKeepMoveMouseEvent: boolean;
  init: () => void;
  storeCredentialsToHub: () => void;
  storeUserAtiveStatusToHub: () => void;
  getValuesByKeyFromHubServer: () => void;
  initVersion2Prop: () => void;
  pushSDKV2CredentialsToHubServer: () => void;
  clearUrlCode: () => void;
  reloadUrl: () => void;
  decodeJwt: () => void;
  decodeExp: () => void;
  initMousemoveEvent: () => void;
  _dispatchUserActive: () => void;
  _keepUseViewPageHandler: () => void;
  refreshToken: () => void;
  getUserInfo: () => void;
  verifyToken: () => void;
  getMenusTree: () => void;
  getButtonsList: () => void;
  getCookie: () => void;
  setCookie: () => void;
  getToken: () => void;
  DelCookie: () => void;
  login: () => void;
  clearGUCBrowserCertificate: () => void;
  logout: () => void;
  getConfigInfo: () => void;
}

export type GucConfig = GucDefaultConfig & {
  backRoute?: boolean;
  slaveMode?: boolean;
  slaveAppName?: string;
  homeUrl?: string;
};


/** 设置全局guc */
let gplusGuc: GucIns;
if (window.__gplusGuc__) {
  gplusGuc = window.__gplusGuc__;
} else { 
  gplusGuc = new Guc(gucConfig);
  window.__gplusGuc__ = gplusGuc;
}
window.gplusGuc = gplusGuc;


export {
  Guc,
  gplusGuc
};

