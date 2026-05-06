import axios, { AxiosInstance } from 'axios';
import dotenv from 'dotenv';
dotenv.config();

class ADClient {
  private client: AxiosInstance;
  private token: string | null = null;
  private tokenExpiry: number | null = null;

  constructor() {
    this.client = axios.create({
      baseURL: process.env.AD_BASE_URL,
      timeout: 10000,
    });
  }

  private async authenticate(): Promise<void> {
    const email = process.env.AD_AUTH_EMAIL;
    const password = process.env.AD_AUTH_PASSWORD;
    if (!email || !password) throw new Error('AD credentials not configured');

    const response = await axios.post(
      `${process.env.AD_BASE_URL}/active-directory/sign-in`,
      { email, password }
    );

    this.token = Buffer.from(`${email}:${password}`).toString('base64');
    this.tokenExpiry = Date.now() + 55 * 60 * 1000;
  }

  private async ensureToken(): Promise<void> {
    if (!this.token || (this.tokenExpiry && Date.now() >= this.tokenExpiry)) {
      await this.authenticate();
    }
  }

  private async request(method: string, url: string, data?: any) {
    await this.ensureToken();
    try {
      const response = await this.client.request({
        method,
        url,
        data,
      });
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 401) {
        this.token = null;
        await this.authenticate();
        const retry = await this.client.request({ method, url, data });
        return retry.data;
      }
      throw error;
    }
  }

  // POST /active-directory/sign-up
  async signUp(userData: {
    firstName: string;
    lastName: string;
    phone: string;
    email: string;
    password: string;
  }) {
    return this.request('post', '/active-directory/sign-up', userData);
  }

  // POST /active-directory/sign-in
  async signIn(credentials: { email?: string; phone?: string; password: string }) {
    return this.request('post', '/active-directory/sign-in', credentials);
  }

  // POST /active-directory/forget-password
  async forgetPassword(contact: { email?: string; phone?: string }) {
    return this.request('post', '/active-directory/forget-password', contact);
  }

  // PATCH /active-directory/user/:userId/password
  async changePassword(
    userId: number,
    data: { currentPassword: string; password: string }
  ) {
    return this.request('patch', `/active-directory/user/${userId}/password`, data);
  }
}

export const adClient = new ADClient();