using WeatherStation.Api.Models.Base;

namespace WeatherStation.Api.Models;

public class Sensor : BaseEntity
{
    public DateTime CreatedOn { get; set; }

    public string Name { get; set; } = string.Empty;

    public ICollection<SensorData> SensorData { get; set; } = [];
}
