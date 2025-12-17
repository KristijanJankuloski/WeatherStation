using Microsoft.AspNetCore.SignalR;
using Newtonsoft.Json;
using WeatherStation.Api.DataAccess.Repositories;
using WeatherStation.Api.Dtos.SensorDatas;
using WeatherStation.Api.Dtos.Sensors;
using WeatherStation.Api.Hubs;
using WeatherStation.Api.Models;
using WeatherStation.Api.Shared.Results;

namespace WeatherStation.Api.Services.Implementations;

public class SensorService : ISensorService
{
    private readonly ISensorRepository sensorRepository;
    private readonly ISensorDataRepository sensorDataRepository;
    private readonly IConfiguration configuration;
    private readonly IHubContext<NotificationHub> hubContext;

    public SensorService(
        ISensorRepository sensorRepository,
        ISensorDataRepository sensorDataRepository,
        IConfiguration configuration,
        IHubContext<NotificationHub> hubContext)
    {
        this.sensorRepository = sensorRepository;
        this.sensorDataRepository = sensorDataRepository;
        this.configuration = configuration;
        this.hubContext = hubContext;
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

        if (
            dto.Pm1 == null
            || dto.Pm25 == null
            || dto.Pm10 == null
            || dto.Temperature == null
            || dto.Humidity == null)
        {
            return Result.Ok();
        }

        SensorData sensorData = new SensorData
        {
            CreatedOn = DateTime.UtcNow,
            SensorId = sensorId,
            Pm1 = dto.Pm1.Value,
            Pm25 = dto.Pm25.Value,
            Pm10 = dto.Pm10.Value,
            Temperature = dto.Temperature.Value,
            Humidity = dto.Humidity.Value
        };

        sensorDataRepository.Create(sensorData);
        await sensorRepository.SaveChanges();

        GetSensorDataDto createdData = new GetSensorDataDto
        {
            Id = sensorData.Id,
            Pm1 = sensorData.Pm1,
            Pm25 = sensorData.Pm25,
            Pm10 = sensorData.Pm10,
            Temperature = sensorData.Temperature,
            Humidity = sensorData.Humidity,
            CreatedOn = sensorData.CreatedOn
        };

        await hubContext.Clients.All.SendAsync("Notification", JsonConvert.SerializeObject(createdData));
        return Result.Ok();
    }

    public async Task<Result<List<GetSensorDataDto>>> GetFromRange(DateOnly start, DateOnly end, TimeOnly roundTime)
    {
        DateTime startDate = new DateTime(start, new TimeOnly(0, 0), DateTimeKind.Utc);
        DateTime endDate = new DateTime(end, new TimeOnly(23, 59), DateTimeKind.Utc);
        List<SensorData> sensorData = await sensorDataRepository.GetByQuery(query =>
         query.Where(x => x.CreatedOn >= startDate && x.CreatedOn <= endDate));

        int bucketMinutes = roundTime.Hour * 60 + roundTime.Minute;

        // Whole-day aggregation
        if (bucketMinutes == 0)
        {
            var daily = sensorData
                .GroupBy(x => x.CreatedOn.Date)
                .Select(group => new GetSensorDataDto
                {
                    Id = group.First().Id,
                    CreatedOn = group.Key,
                    Temperature = group.Average(x => x.Temperature),
                    Humidity = (int)Math.Round(group.Average(x => x.Humidity)),
                    Pm25 = group.Average(x => x.Pm25),
                    Pm1 = group.Average(x => x.Pm1),
                    Pm10 = group.Average(x => x.Pm10)
                })
                .ToList();

            return Result<List<GetSensorDataDto>>.Ok(daily);
        }

        var result = sensorData
            .GroupBy(x =>
            {
                var c = x.CreatedOn;
                int totalMinutes = c.Hour * 60 + c.Minute;
                int bucketStart = (totalMinutes / bucketMinutes) * bucketMinutes;

                return new DateTime(
                    c.Year,
                    c.Month,
                    c.Day,
                    bucketStart / 60,
                    bucketStart % 60,
                    0,
                    DateTimeKind.Utc);
            })
            .Select(group => new GetSensorDataDto
            {
                Id = group.First().Id,
                CreatedOn = group.Key,
                Temperature = group.Average(x => x.Temperature),
                Humidity = (int)Math.Round(group.Average(x => x.Humidity)),
                Pm25 = group.Average(x => x.Pm25),
                Pm1 = group.Average(x => x.Pm1),
                Pm10 = group.Average(x => x.Pm10)
            })
            .OrderBy(x => x.CreatedOn)
            .ToList();

        return Result<List<GetSensorDataDto>>.Ok(result);
    }

    public async Task<Result<List<GetSensorDataDto>>> GetLatestData()
    {
        DateTime endDate = DateTime.UtcNow;
        DateTime startDate = endDate.AddDays(-1);

        List<SensorData> sensorData = await sensorDataRepository.GetByQuery(query =>
         query.Where(x => x.CreatedOn >= startDate && x.CreatedOn <= endDate));

        List<GetSensorDataDto> result = sensorData.Select(x => new GetSensorDataDto
        {
            Id = x.Id,
            Pm1 = x.Pm1,
            Pm25 = x.Pm25,
            Pm10 = x.Pm10,
            Temperature = x.Temperature,
            Humidity = x.Humidity,
            CreatedOn = x.CreatedOn
        }).ToList();

        return Result<List<GetSensorDataDto>>.Ok(result);
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
