# WeatherStation

A self-hosted air quality and weather monitoring system. A Raspberry Pi style sensor unit reads particulate matter, temperature, and humidity data and pushes it to a .NET API, which stores it in PostgreSQL and streams live updates to an Angular dashboard over SignalR.

## Architecture

```
sensor/main.py  --HTTP POST-->  WeatherStation.Api  --EF Core-->  PostgreSQL
                                       |
                                       +--SignalR--> weather-station (Angular SPA)
```

The API and the compiled Angular app are deployed as a single unit: the API serves the SPA's static files from `wwwroot` and falls back to `index.html`, so both the REST/SignalR endpoints and the UI are reachable from the same origin.

## Components

### Sensor (`sensor/`)

A single Python script (`main.py`) intended to run on a Raspberry Pi.

- Reads PM1.0, PM2.5, and PM10 from a Plantower style particulate sensor over UART (`/dev/serial0`, 9600 baud), validating the frame checksum.
- Reads temperature and humidity from a DHT11 sensor on GPIO pin D4, using `adafruit_dht`.
- Every 60 seconds, POSTs a JSON payload (`pm1`, `pm25`, `pm10`, `temperature`, `humidity`) to the URL in the `WEATHER_API_ENDPOINT` environment variable.

Required packages: `pyserial`, `requests`, `adafruit-circuitpython-dht`, `adafruit-blinka`.

### Server (`server/WeatherStation`)

An ASP.NET Core Web API (`WeatherStation.Api`, targeting .NET 10) built with EF Core against PostgreSQL.

- **Controllers**: `SensorsController` exposes `POST /api/sensors` (register a sensor), `GET /api/sensors` (paginated list), `POST /api/sensors/{deviceId}/data?apiKey=...` (ingest a reading, protected by a shared API key), `GET /api/sensors/data` (latest readings from the last 24 hours), and `GET /api/sensors/data-history` (historical data bucketed by a configurable time interval).
- **Real-time**: `NotificationHub` (SignalR, mapped at `/notificationhub`) broadcasts every new reading to connected clients via the `Notification` event.
- **Data access**: `WeatherStationDbContext` (EF Core, Npgsql) with `Sensor` and `SensorData` entities, migrations applied automatically on startup.
- **Configuration**: `ApiKey` (shared secret for sensor ingestion) and `ConnectionStrings:CoreDatabase` (Postgres connection string) are read from `appsettings.json`. The Development config file in this repo contains real local development values, so treat it as sensitive and do not reuse those values outside a local environment.

### Client (`client/weather-station`)

An Angular 21 single page app using PrimeNG for UI components and Chart.js for visualizations.

- **Dashboard**: live view of the latest readings, updated in real time via SignalR, with PM1/PM2.5/PM10, temperature, and humidity charts, plus a computed EPA AQI (NowCast algorithm) for PM2.5 and PM10.
- **Sensors**: a table of registered sensors with a dialog to register new ones.
- **History**: a date range and interval picker for exploring historical, aggregated sensor data.

Note that dashboard labels and AQI categories are in Macedonian.

## Getting started

### Prerequisites

- .NET 10 SDK
- Node.js and npm (npm 11.1.0 is pinned via `packageManager`)
- PostgreSQL
- Python 3 with the packages listed above, if running the sensor unit

### Running the server

```
cd server/WeatherStation/WeatherStation.Api
dotnet run
```

Set `ApiKey` and `ConnectionStrings:CoreDatabase` in `appsettings.Development.json` or via environment variables before running. By default the dev server listens on `http://localhost:5121`. Database migrations are applied automatically at startup.

### Running the client

```
cd client/weather-station
npm install
npm start
```

This starts the Angular dev server at `http://localhost:4200`. In development it talks to the API and SignalR hub configured in `src/environments/environment.development.ts`. Use `npm run build` to produce a production build, and `npm test` to run the unit tests (Vitest).

### Running the sensor script

```
cd sensor
python -m venv .venv
.venv/Scripts/activate  # or source .venv/bin/activate on Linux
pip install pyserial requests adafruit-circuitpython-dht adafruit-blinka
WEATHER_API_ENDPOINT="https://your-api-host/api/sensors/{deviceId}/data?apiKey=your-api-key" python main.py
```

## Known gaps

- No CI/CD workflows or Dockerfiles exist yet.
- The sensor script has no `requirements.txt`.

## License

MIT, see [LICENSE](LICENSE).
