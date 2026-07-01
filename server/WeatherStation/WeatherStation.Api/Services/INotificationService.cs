using WeatherStation.Api.Dtos.SensorDatas;

namespace WeatherStation.Api.Services;

public interface INotificationService
{
    Task SendNotification(GetSensorDataDto dto);
}
