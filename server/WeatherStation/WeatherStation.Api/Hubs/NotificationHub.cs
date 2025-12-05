using Microsoft.AspNetCore.SignalR;
using Newtonsoft.Json;
using WeatherStation.Api.Dtos.SensorDatas;

namespace WeatherStation.Api.Hubs;

public class NotificationHub : Hub
{
    private const string NotificationName = "Notification";

    public async Task SendNotification(GetSensorDataDto dto)
    {
        string jsonData = JsonConvert.SerializeObject(dto);
        await Clients.All.SendAsync(NotificationName, jsonData);
    }
}
