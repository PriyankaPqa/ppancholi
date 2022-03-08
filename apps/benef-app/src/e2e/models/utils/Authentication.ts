import axios from 'axios';

class Authentication {
    private readonly tenantId: string;

    public accessToken: string;

    constructor() {
      this.tenantId = 'c400f50d-7a56-4ef2-8e44-211bfa434724';
    }

    getLevel6Credentials() {
      return {
        userName: 'testsix@crctechmain.onmicrosoft.com',
        password: 'QAEMIS1!',
      };
    }

    // TODO Check to hide credentials and use KeyVault
    async fetchAccessToken(userName: string, password: string): Promise<string> {
      const headers = { 'Content-Type': 'application/x-www-form-urlencoded' };
      const params = new URLSearchParams();
      params.append('grant_type', 'password');
      params.append('client_id', '44dc9a29-39d1-462e-9cbe-b9507b34396d');
      params.append('client_secret', 'VwNQd7XbIYrV7stj58oiaKKHKphkjiw7KS');
      params.append('username', userName);
      params.append('password', password);
      params.append('scope', 'https://crctechmain.onmicrosoft.com/emis-dev/api/api_access');
      params.append('resource', '44dc9a29-39d1-462e-9cbe-b9507b34396d');

      try {
        const res = await axios.post(`https://login.microsoftonline.com/${this.tenantId}/oauth2/token`, params, { headers });
        // eslint-disable-next-line
        return (res.data as any).access_token;
      } catch (e) {
        return null;
      }
    }

    async login() {
      const { userName, password } = this.getLevel6Credentials();
      this.accessToken = await this.fetchAccessToken(userName, password);
    }
}

export default new Authentication();
