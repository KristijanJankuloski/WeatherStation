using WeatherStation.Api.DataAccess.Contexts;
using WeatherStation.Api.DataAccess.Repositories.Base;
using WeatherStation.Api.Models;

namespace WeatherStation.Api.DataAccess.Repositories.Implementations;

public class SensorDataRepository : BaseRepository<SensorData>, ISensorDataRepository
{
    public SensorDataRepository(WeatherStationDbContext context) : base(context)
    {
    }
}
