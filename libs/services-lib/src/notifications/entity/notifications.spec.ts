import { IHttpMock, mockHttp } from '../../http-client';
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
    await service.fetchCurrentUserNotifications();
    expect(http.get).toHaveBeenCalledWith(`${service.baseUrl}/user`, { globalHandler: false });
  });

  test('updateIsRead is linked to the correct URL', async () => {
    const id = 'id1';
    const isRead = true;
    await service.updateIsRead(id, isRead);
    expect(http.patch).toHaveBeenCalledWith(`${service.baseUrl}/${id}/isRead`, { isRead });
  });
});
