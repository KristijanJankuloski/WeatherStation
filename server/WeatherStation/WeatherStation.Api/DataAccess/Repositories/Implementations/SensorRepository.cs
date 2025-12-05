using WeatherStation.Api.DataAccess.Contexts;
using WeatherStation.Api.DataAccess.Repositories.Base;
using WeatherStation.Api.Models;

namespace WeatherStation.Api.DataAccess.Repositories.Implementations;

public class SensorRepository : BaseRepository<Sensor>, ISensorRepository
{
    public SensorRepository(WeatherStationDbContext context) : base(context)
    {
    }
}
