import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

const AD_BASE_URL = process.env.AD_BASE_URL || 'https://api-test.portall.com.do:2053/api/v2';
const AD_AUTH_EMAIL = process.env.AD_AUTH_EMAIL || 'ecrt-plus@portaldom.com.do';
const AD_AUTH_PASSWORD = process.env.AD_AUTH_PASSWORD || 'TMmTP0NYOS0=';

let adToken: string | null = null;
let tokenExpiry: number | null = null;

async function refreshToken(): Promise<string> {
  const response = await axios.post(`${AD_BASE_URL}/auth/token`, {
    email: AD_AUTH_EMAIL,
    password: AD_AUTH_PASSWORD
  });
  adToken = response.data.access_token;
  const expiresIn = response.data.expires_in || 3600;
  tokenExpiry = Date.now() + (expiresIn * 1000);
  return adToken!;
}

async function getToken(): Promise<string> {
  if (adToken && tokenExpiry && Date.now() < tokenExpiry - 60000) {
    return adToken;
  }
  return refreshToken();
}

async function adRequest(method: string, path: string, data?: any) {
  const token = await getToken();
  const response = await axios({
    method,
    url: `${AD_BASE_URL}${path}`,
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    data
  });
  return response.data;
}

export const signUpInAD = (body: any) => adRequest('POST', '/active-directory/sign-up', body);
export const signInInAD = (body: any) => adRequest('POST', '/active-directory/sign-in', body);
export const forgetPasswordInAD = (body: any) => adRequest('POST', '/active-directory/forget-password', body);
export const changePasswordInAD = (userId: number, body: any) => adRequest('PATCH', `/active-directory/user/${userId}/password`, body);
