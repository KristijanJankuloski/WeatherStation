using WeatherStation.Api.Models.Base;

namespace WeatherStation.Api.Models;

public class SensorData : BaseEntity
{
    public decimal Pm1 { get; set; }

    public decimal Pm25 { get; set; }

    public decimal Pm10 { get; set; }

    public decimal Temperature { get; set; }

    public int Humidity { get; set; }

    public DateTime CreatedOn { get; set; }

    public long SensorId { get; set; }

    public virtual Sensor? Sensor { get; set; }
}
