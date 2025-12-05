using Microsoft.EntityFrameworkCore;
using WeatherStation.Api.DataAccess.Contexts;
using WeatherStation.Api.DataAccess.Repositories;
using WeatherStation.Api.DataAccess.Repositories.Implementations;
using WeatherStation.Api.Services;
using WeatherStation.Api.Services.Implementations;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
string? defaultDbConnection = builder.Configuration.GetConnectionString("CoreDatabase");
if (defaultDbConnection == null)
{
    throw new ArgumentNullException(nameof(defaultDbConnection));
}

builder.Services.AddDbContext<WeatherStationDbContext>(options => options.UseNpgsql(defaultDbConnection));

builder.Services.AddTransient<ISensorRepository, SensorRepository>();
builder.Services.AddTransient<ISensorDataRepository, SensorDataRepository>();

builder.Services.AddScoped<ISensorService, SensorService>();

builder.Services.AddControllers();
builder.Services.AddOpenApi();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
    app.UseSwaggerUI(options =>
    {
        options.SwaggerEndpoint("/openapi/v1.json", "Open API V1");
        options.RoutePrefix = string.Empty;
    });
}

app.UseAuthorization();

app.MapControllers();

app.Run();
