using WeatherStation.Api.Dtos.Sensors;
using WeatherStation.Api.Shared.Results;

namespace WeatherStation.Api.Services;

public interface ISensorService
{
    Task<Result<long>> CreateSensor(SensorCreateDto dto);

    Task<Result<List<GetSensorDto>>> GetSensors(int skip, int take);

    Task<Result> CreateSensorData(long sensorId, string apiKey, CreateSensorDataDto dto);
}
