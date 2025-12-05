using Microsoft.EntityFrameworkCore;
using WeatherStation.Api.Models;

namespace WeatherStation.Api.DataAccess.Contexts;

public class WeatherStationDbContext : DbContext
{
    public WeatherStationDbContext(DbContextOptions<WeatherStationDbContext> options) : base(options) {}

    public DbSet<Sensor> Sensors { get; set; }

    public DbSet<SensorData> SensorData { get; set; }

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);
    }
}
