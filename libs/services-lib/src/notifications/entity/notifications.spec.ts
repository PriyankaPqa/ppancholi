import { IHttpMock, mockHttp, GlobalHandler } from '../../http-client';
import { NotificationsService } from './notifications';

describe('>>> Notifications Service', () => {
  let http: IHttpMock;
  let service: NotificationsService;

  beforeEach(() => {
    http = mockHttp();
    service = new NotificationsService(http as never);
    jest.clearAllMocks();
  });

  test('fetchCurrentUserNotifications is linked to the correct URL', async () => {
    const params = {
      limit: 5,
      beforeDateTimeUtc: '2023-09-05',
    };
    await service.fetchCurrentUserNotifications(params);
    expect(http.get).toHaveBeenCalledWith(`${service.baseUrl}/user`, { params, globalHandler: GlobalHandler.Partial });
  });

  test('fetchCurrentUserUnreadIds is linked to the correct URL', async () => {
    await service.fetchCurrentUserUnreadIds();
    expect(http.get).toHaveBeenCalledWith(`${service.baseUrl}/user/ids`, { params: { unreadOnly: true } });
  });

  test('updateIsRead is linked to the correct URL', async () => {
    const id = 'id1';
    const isRead = true;
    await service.updateIsRead([id], isRead);
    expect(http.patch).toHaveBeenCalledWith(`${service.baseUrl}/user`, { isRead, notificationIds: [id] });
  });
});
