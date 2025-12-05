using WeatherStation.Api.DataAccess.Repositories;
using WeatherStation.Api.Dtos.Sensors;
using WeatherStation.Api.Models;
using WeatherStation.Api.Shared.Results;

namespace WeatherStation.Api.Services.Implementations;

public class SensorService : ISensorService
{
    private readonly ISensorRepository sensorRepository;
    private readonly ISensorDataRepository sensorDataRepository;
    private readonly IConfiguration configuration;

    public SensorService(
        ISensorRepository sensorRepository,
        ISensorDataRepository sensorDataRepository,
        IConfiguration configuration)
    {
        this.sensorRepository = sensorRepository;
        this.sensorDataRepository = sensorDataRepository;
        this.configuration = configuration;
    }

    public async Task<Result<long>> CreateSensor(SensorCreateDto dto)
    {
        Sensor sensor = new Sensor
        {
            CreatedOn = DateTime.UtcNow,
            Name = dto.Name
        };

        sensorRepository.Create(sensor);
        await sensorRepository.SaveChanges();

        return Result<long>.Ok(sensor.Id);
    }

    public async Task<Result> CreateSensorData(long sensorId, string apiKey, CreateSensorDataDto dto)
    {
        string? storedApiKey = configuration["ApiKey"];
        if (string.IsNullOrEmpty(storedApiKey) || storedApiKey != apiKey)
        {
            return Result.Invalid("Api key invalid.");
        }

        SensorData sensorData = new SensorData
        {
            CreatedOn = DateTime.UtcNow,
            SensorId = sensorId,
            Pm1 = dto.Pm1,
            Pm25 = dto.Pm25,
            Pm10 = dto.Pm10
        };

        sensorDataRepository.Create(sensorData);
        await sensorRepository.SaveChanges();

        return Result.Ok();
    }

    public async Task<Result<List<GetSensorDto>>> GetSensors(int skip, int take)
    {
        if (take > 200)
        {
            return Result<List<GetSensorDto>>.Invalid("Range too large");
        }

        List<Sensor> sensors = await sensorRepository.GetByQuery(query =>
            query
            .OrderByDescending(x => x.Id)
            .Skip(skip)
            .Take(take));

        return Result<List<GetSensorDto>>.Ok(sensors.Select(x => new GetSensorDto
        {
            Id = x.Id,
            Name = x.Name,
            CreatedOn = x.CreatedOn
        }).ToList());
    }
}
