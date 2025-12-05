using Newtonsoft.Json;

namespace WeatherStation.Api.Dtos.SensorDatas;

public class GetSensorDataDto
{
    [JsonProperty("id")]
    public long Id { get; set; }

    [JsonProperty("pm1")]
    public decimal Pm1 { get; set; }

    [JsonProperty("pm25")]
    public decimal Pm25 { get; set; }

    [JsonProperty("pm10")]
    public decimal Pm10 { get; set; }

    [JsonProperty("temperature")]
    public decimal Temperature { get; set; }

    [JsonProperty("humidity")]
    public int Humidity { get; set; }

    [JsonProperty("createdOn")]
    public DateTime CreatedOn { get; set; }
}
