using Microsoft.AspNetCore.SignalR;
using WeatherStation.Api.Dtos.SensorDatas;
using WeatherStation.Api.Hubs;

namespace WeatherStation.Api.Services.Implementations;

public class NotificationService : INotificationService
{
    private readonly IHubContext<NotificationHub, INotificationHub> hubContext;

    public NotificationService(IHubContext<NotificationHub, INotificationHub> hubContext)
    {
        this.hubContext = hubContext;
    }

    public async Task SendNotification(GetSensorDataDto dto)
    {
        await hubContext.Clients.All.Notification(dto);
    }
}
