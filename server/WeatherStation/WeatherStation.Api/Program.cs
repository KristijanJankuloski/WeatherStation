using Microsoft.EntityFrameworkCore;
using WeatherStation.Api.DataAccess.Contexts;
using WeatherStation.Api.DataAccess.Repositories;
using WeatherStation.Api.DataAccess.Repositories.Implementations;
using WeatherStation.Api.Hubs;
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
builder.Services.AddSignalR();

var app = builder.Build();

// Configure the HTTP request pipeline.
app.UseCors(async options =>
{
    options.AllowAnyHeader();
    options.AllowAnyMethod();
    options.SetIsOriginAllowed((host) => true);
    options.AllowCredentials();
});
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
    //app.UseSwaggerUI(options =>
    //{
    //    options.SwaggerEndpoint("/openapi/v1.json", "Open API V1");
    //});
}
app.UseStaticFiles();
app.UseDefaultFiles();

app.UseAuthorization();

app.MapControllers();
app.MapHub<NotificationHub>("/notificationhub");
app.MapFallbackToFile("index.html");

using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<WeatherStationDbContext>();
    db.Database.Migrate();
}

app.Run();
