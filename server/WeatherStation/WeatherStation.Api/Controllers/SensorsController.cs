using Microsoft.AspNetCore.Mvc;
using WeatherStation.Api.Controllers.Base;
using WeatherStation.Api.Dtos.SensorDatas;
using WeatherStation.Api.Dtos.Sensors;
using WeatherStation.Api.Services;
using WeatherStation.Api.Shared.Results;

namespace WeatherStation.Api.Controllers;

[Route("api/sensors")]
[ApiController]
public class SensorsController : BaseController
{
    private readonly ISensorService sensorService;

    public SensorsController(ISensorService sensorService)
    {
        this.sensorService = sensorService;
    }

    [HttpPost]
    public async Task<IActionResult> CreateSensor([FromBody] SensorCreateDto request)
    {
        try
        {
            Result<long> result = await sensorService.CreateSensor(request);
            return OkOrError(result);
        }
        catch(Exception ex)
        {
            return InternalServerError(ex);
        }
    }

    [HttpGet]
    public async Task<IActionResult> GetSensors(
        [FromQuery] int skip,
        [FromQuery] int take)
    {
        try
        {
            Result<List<GetSensorDto>> result = await sensorService.GetSensors(skip, take);
            return OkOrError<List<GetSensorDto>>(result);
        }
        catch (Exception ex)
        {
            return InternalServerError(ex);
        }
    }

    [HttpPost("{deviceId:long}/data")]
    public async Task<IActionResult> CreateData(
        [FromRoute] long deviceId,
        [FromQuery] string apiKey,
        [FromBody] CreateSensorDataDto request)
    {
        try
        {
            Result result = await sensorService.CreateSensorData(deviceId, apiKey, request);
            return OkOrError(result);
        }
        catch (Exception ex)
        {
            return InternalServerError(ex);
        }
    }

    [HttpGet("data")]
    public async Task<IActionResult> GetLatestData()
    {
        try
        {
            Result<List<GetSensorDataDto>> result = await sensorService.GetLatestData();
            return OkOrError(result);
        }
        catch (Exception ex)
        {
            return InternalServerError(ex);
        }
    }

    [HttpGet("data-history")]
    public async Task<IActionResult> GetHistoricalData([FromQuery] DateOnly start, [FromQuery] DateOnly end)
    {
        try
        {
            Result<List<GetSensorDataDto>> result = await sensorService.GetFromRange(start, end);
            return OkOrError(result);
        }
        catch (Exception ex)
        {
            return InternalServerError(ex);
        }
    }
}
