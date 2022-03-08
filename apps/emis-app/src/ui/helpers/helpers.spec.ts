/* eslint-disable max-len */
import moment from 'moment';
import { dateTypes } from '@/constants/dateTypes';
import helpers from './helpers';

describe('>>>> helpers', () => {
  describe('getLocalStringDate', () => {
    it('returns the date without considering time zone if passed a preformatted date', () => {
      const res = helpers.getLocalStringDate('2010-02-03', dateTypes.static[0], 'YYYY-MM-DD HH:mm');
      expect(res).toBe('2010-02-03 00:00');
    });

    it('returns the date formatted when passed a new Date of a type we want to convert to local', () => {
      const d = new Date();
      let res = helpers.getLocalStringDate(d, dateTypes.convertToLocal[0], 'YYYY-MM-DD HH:mm');
      expect(res).toBe(moment(d).format('YYYY-MM-DD HH:mm'));

      // Entity.created is a timestamp that we always want to display as local - here it is an example of how it would be called normally
      res = helpers.getLocalStringDate(d, 'Entity.created', 'YYYY-MM-DD HH:mm');
      expect(res).toBe(moment(d).format('YYYY-MM-DD HH:mm'));
    });

    it('returns the date considering UTC formatted when passed a static date', () => {
      const d = new Date();
      let res = helpers.getLocalStringDate(d, dateTypes.static[0], 'YYYY-MM-DD HH:mm');
      expect(res).toBe(moment(d).utc().format('YYYY-MM-DD HH:mm'));

      // EventSchedule.scheduledOpenDate is a static date (ie: we've stored as midnight UTC)- here it is an example of how it would be called normally
      res = helpers.getLocalStringDate(new Date('2021-10-01T00:00:00.000Z'), 'EventSchedule.scheduledOpenDate', 'YYYY-MM-DD HH:mm');
      expect(res).toBe('2021-10-01 00:00');
    });
  });

  describe('decodeJwt', () => {
    it('decodes a valid Jwt', () => {
      const result = helpers.decodeJwt('eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsImtpZCI6Imwzc1EtNTBjQ0g0eEJWWkxIVEd3blNSNzY4MCJ9.eyJhdWQiOiI0NGRjOWEyOS0zOWQxLTQ2MmUtOWNiZS1iOTUwN2IzNDM5NmQiLCJpc3MiOiJodHRwczovL2xvZ2luLm1pY3Jvc29mdG9ubGluZS5jb20vYzQwMGY1MGQtN2E1Ni00ZWYyLThlNDQtMjExYmZhNDM0NzI0L3YyLjAiLCJpYXQiOjE2MzgzOTA3NjMsIm5iZiI6MTYzODM5MDc2MywiZXhwIjoxNjM4Mzk2Mzc1LCJhaW8iOiJBWlFBYS84VEFBQUFkbDltZGRoQTZjV3NOK1RaSktQazM5dFFHeHlJbHV6djRNa3N1UGVFemNNMnl5QlRwNVo0YSs0WTFZZlBFTmRoZStwRVVncmpyV1pFNUM1N0psRDc3c0E0YWtvQ2ZTdnlZSDVQa3RPSmppTnlPRDUxeTZiR2pRTUJOZ3VlOXlYZEpQT0FJd3VpOXNZNUtwZENZQS9TRi8yM0JFV1JjR0lXcEdqU2NsNUh1Tmxjc2pmbjJjN0pVTkRFajA4NnFVVTMiLCJhenAiOiIwMzBlNWEzMi1iNmVmLTQ5MjctOTRiYS03NGQ5MWVhYTI1MWUiLCJhenBhY3IiOiIwIiwibmFtZSI6Ik1hcmMtQW5kcsOpIERlc2Now6puZXMiLCJvaWQiOiIwZDIyZjUwYS1lMWFiLTQzNWQtYTlmMC1jZmRhNTAyODY2ZjQiLCJwcmVmZXJyZWRfdXNlcm5hbWUiOiJtYWRlc2NoZW5lc0BjcmN0ZWNobWFpbi5vbm1pY3Jvc29mdC5jb20iLCJyaCI6IjAuQVgwQURmVUF4Rlo2OGs2T1JDRWIta05ISkRKYURnUHZ0aWRKbExwMDJSNnFKUjU5QUo4LiIsInJvbGVzIjpbImxldmVsMyJdLCJzY3AiOiJhcGlfYWNjZXNzIiwic3ViIjoiWHVuR2tpR3BFRndObU9qUFdOeFBFdnhhdHM3RzNNN2stc0wyc2IzUTNqNCIsInRpZCI6ImM0MDBmNTBkLTdhNTYtNGVmMi04ZTQ0LTIxMWJmYTQzNDcyNCIsInV0aSI6Im9jYTMtcHl5cUV5eklvY0JINl9zQWciLCJ2ZXIiOiIyLjAifQ.WjnWExYS9vepYnmNBvE8R02jA20SAEzR3OIPfA_AWcszg4MgOI7xSo8HMg_mbph_2CAbSRsgLAZxLXKaDTvN4hidT4uAa_G8Cd04Exc2C4e31PKIhoWgl7ftOMzh8a5L0Mv1v0B1vCfFd9Q4_7wn2DbruGEDFgviCS5IICs88vM6j92ucWNzHbhUOrciHtsX0_Hh7DO4y8-mZ5TOthZbJALQ9RmhcNjGjH3ywVtvyIo0x9eFvbCnFu7xweVyuNuEuwocmVr_WZy8pIbt7tGIAtFnNccRsKOOA4Rx4dmjN5JqRvFtv6Lz8SgmfYiZa6VmZvukoC-i0PQozv280qA2AQ');
      expect(result).toEqual({
        aud: '44dc9a29-39d1-462e-9cbe-b9507b34396d',
        iss: 'https://login.microsoftonline.com/c400f50d-7a56-4ef2-8e44-211bfa434724/v2.0',
        iat: 1638390763,
        nbf: 1638390763,
        exp: 1638396375,
        aio: 'AZQAa/8TAAAAdl9mddhA6cWsN+TZJKPk39tQGxyIluzv4MksuPeEzcM2yyBTp5Z4a+4Y1YfPENdhe+pEUgrjrWZE5C57JlD77sA4akoCfSvyYH5PktOJjiNyOD51y6bGjQMBNgue9yXdJPOAIwui9sY5KpdCYA/SF/23BEWRcGIWpGjScl5HuNlcsjfn2c7JUNDEj086qUU3',
        azp: '030e5a32-b6ef-4927-94ba-74d91eaa251e',
        azpacr: '0',
        name: 'Marc-André Deschênes',
        oid: '0d22f50a-e1ab-435d-a9f0-cfda502866f4',
        preferred_username: 'madeschenes@crctechmain.onmicrosoft.com',
        rh: '0.AX0ADfUAxFZ68k6ORCEb-kNHJDJaDgPvtidJlLp02R6qJR59AJ8.',
        roles: [
          'level3',
        ],
        scp: 'api_access',
        sub: 'XunGkiGpEFwNmOjPWNxPEvxats7G3M7k-sL2sb3Q3j4',
        tid: 'c400f50d-7a56-4ef2-8e44-211bfa434724',
        uti: 'oca3-pyyqEyzIocBH6_sAg',
        ver: '2.0',
      });
    });
  });
});
