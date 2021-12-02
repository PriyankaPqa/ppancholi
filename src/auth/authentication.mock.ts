/* eslint-disable max-len */
import { IAuthenticationAccessToken } from '@/types';

export const mockAuthenticationData = (): IAuthenticationAccessToken => ({
  accessToken: 'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsImtpZCI6Imwzc1EtNTBjQ0g0eEJWWkxIVEd3blNSNzY4MCJ9.eyJhdWQiOiI0NGRjOWEyOS0zOWQxLTQ2MmUtOWNiZS1iOTUwN2IzNDM5NmQiLCJpc3MiOiJodHRwczovL2xvZ2luLm1pY3Jvc29mdG9ubGluZS5jb20vYzQwMGY1MGQtN2E1Ni00ZWYyLThlNDQtMjExYmZhNDM0NzI0L3YyLjAiLCJpYXQiOjE2MzgzOTA3NjMsIm5iZiI6MTYzODM5MDc2MywiZXhwIjoxNjM4Mzk2Mzc1LCJhaW8iOiJBWlFBYS84VEFBQUFkbDltZGRoQTZjV3NOK1RaSktQazM5dFFHeHlJbHV6djRNa3N1UGVFemNNMnl5QlRwNVo0YSs0WTFZZlBFTmRoZStwRVVncmpyV1pFNUM1N0psRDc3c0E0YWtvQ2ZTdnlZSDVQa3RPSmppTnlPRDUxeTZiR2pRTUJOZ3VlOXlYZEpQT0FJd3VpOXNZNUtwZENZQS9TRi8yM0JFV1JjR0lXcEdqU2NsNUh1Tmxjc2pmbjJjN0pVTkRFajA4NnFVVTMiLCJhenAiOiIwMzBlNWEzMi1iNmVmLTQ5MjctOTRiYS03NGQ5MWVhYTI1MWUiLCJhenBhY3IiOiIwIiwibmFtZSI6Ik1hcmMtQW5kcsOpIERlc2Now6puZXMiLCJvaWQiOiIwZDIyZjUwYS1lMWFiLTQzNWQtYTlmMC1jZmRhNTAyODY2ZjQiLCJwcmVmZXJyZWRfdXNlcm5hbWUiOiJtYWRlc2NoZW5lc0BjcmN0ZWNobWFpbi5vbm1pY3Jvc29mdC5jb20iLCJyaCI6IjAuQVgwQURmVUF4Rlo2OGs2T1JDRWIta05ISkRKYURnUHZ0aWRKbExwMDJSNnFKUjU5QUo4LiIsInJvbGVzIjpbImxldmVsMyJdLCJzY3AiOiJhcGlfYWNjZXNzIiwic3ViIjoiWHVuR2tpR3BFRndObU9qUFdOeFBFdnhhdHM3RzNNN2stc0wyc2IzUTNqNCIsInRpZCI6ImM0MDBmNTBkLTdhNTYtNGVmMi04ZTQ0LTIxMWJmYTQzNDcyNCIsInV0aSI6Im9jYTMtcHl5cUV5eklvY0JINl9zQWciLCJ2ZXIiOiIyLjAifQ.WjnWExYS9vepYnmNBvE8R02jA20SAEzR3OIPfA_AWcszg4MgOI7xSo8HMg_mbph_2CAbSRsgLAZxLXKaDTvN4hidT4uAa_G8Cd04Exc2C4e31PKIhoWgl7ftOMzh8a5L0Mv1v0B1vCfFd9Q4_7wn2DbruGEDFgviCS5IICs88vM6j92ucWNzHbhUOrciHtsX0_Hh7DO4y8-mZ5TOthZbJALQ9RmhcNjGjH3ywVtvyIo0x9eFvbCnFu7xweVyuNuEuwocmVr_WZy8pIbt7tGIAtFnNccRsKOOA4Rx4dmjN5JqRvFtv6Lz8SgmfYiZa6VmZvukoC-i0PQozv280qA2AQ',
  account: {
    homeAccountId: '...',
    environment: '...',
    tenantId: '...',
    username: 'test@redcross.ca',
    localAccountId: '...',
    name: 'John Smith',
    idTokenClaims: {
      oid: '1',
      family_name: 'Smith',
      given_name: 'John',
      email: 'test@redcross.ca',
      roles: ['level6'],
    },
  },
  idToken: '...',
  idTokenExpiresOn: new Date(),
});
