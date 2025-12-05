using WeatherStation.Api.Models.Base;

namespace WeatherStation.Api.Models;

public class SensorData : BaseEntity
{
    public int Pm1 { get; set; }

    public int Pm25 { get; set; }

    public int Pm10 { get; set; }

    public DateTime CreatedOn { get; set; }

    public long SensorId { get; set; }

    public virtual Sensor? Sensor { get; set; }
}
