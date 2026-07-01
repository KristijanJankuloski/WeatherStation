using Microsoft.AspNetCore.SignalR;
using WeatherStation.Api.Dtos.SensorDatas;

namespace WeatherStation.Api.Hubs;

public interface INotificationHub
{
    Task Notification(GetSensorDataDto notification);
}
