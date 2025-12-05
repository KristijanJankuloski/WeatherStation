namespace WeatherStation.Api.Dtos.Sensors;

public class GetSensorDto
{
    public long Id { get; set; }

    public string Name { get; set; } = string.Empty;

    public DateTime CreatedOn { get; set; }
}
