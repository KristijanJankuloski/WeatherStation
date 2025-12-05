namespace WeatherStation.Api.Dtos.Sensors;

public class CreateSensorDataDto
{
    public int Pm1 { get; set; }

    public int Pm25 { get; set; }

    public int Pm10 { get; set; }
}
