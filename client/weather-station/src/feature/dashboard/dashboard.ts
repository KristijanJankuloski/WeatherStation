import { CommonModule, DatePipe } from '@angular/common';
import { Component, computed, effect, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { NotificationService } from '../../lib/services/notification-service';
import { GetSensorDataResponse } from '../../lib/models/responses/sensor';
import { ApiService } from '../../lib/services/api-service';
import { CardModule } from 'primeng/card';
import { ChartModule } from 'primeng/chart';
import { ProgressBarModule } from 'primeng/progressbar';
import { aqiCategoryClassNames, aqiCategoryNames, calculateAqiFromMinutes } from '../../lib/helpers/calculate-aqi';
import { AverageHumPipePipe } from '../../lib/pipes/average-hum-pipe-pipe';
import { MaxTempPipePipe } from '../../lib/pipes/max-temp-pipe-pipe';
import { MinTempPipePipe } from '../../lib/pipes/min-temp-pipe-pipe';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  imports: [
    CommonModule,
    ButtonModule,
    CardModule,
    ChartModule,
    ProgressBarModule,
    AverageHumPipePipe,
    MaxTempPipePipe,
    MinTempPipePipe,
    RouterLink
  ],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
  providers: [
    DatePipe
  ]
})
export class Dashboard implements OnInit, OnDestroy {
  private readonly notificationService = inject(NotificationService);
  private readonly apiService = inject(ApiService);
  private readonly datePipe = inject(DatePipe);

  private readonly green500 = '#22c45f';
  private readonly yellow400 = '#fbcd15';
  private readonly amber500 = '#f59e0b';
  private readonly orange500 = '#f97217';
  private readonly orange500t50 = 'rgba(249, 113, 23, 0.5)';
  private readonly red700 = '#b91c1c';

  public aqiCategoryName = aqiCategoryNames;
  public aqiCategoryClass = aqiCategoryClassNames;
  public sensorData = signal<GetSensorDataResponse[]>([]);
  public latestData = computed(() => this.sensorData().at(-1));
  public data = computed<any>(() => {
    const currentData = this.sensorData();
    return {
      labels: currentData.map(x =>{
        const date = new Date(x.createdOn);
        return this.datePipe.transform(date, 'HH:mm');
      } ),
      datasets: [
        {
          label: 'PM 2.5',
          data: currentData.map(x => x.pm25),
          fill: false
        },
        {
          label: 'PM 10',
          data: currentData.map(x => x.pm10),
          fill: false
        },
        {
          label: 'PM 1',
          data: currentData.map(x => x.pm1),
          fill: false
        }
      ]
    };
  });
  public humidityData = computed<any>(() => {
    const currentData = this.sensorData();
    return {
      labels: currentData.map(x =>{
        const date = new Date(x.createdOn);
        return this.datePipe.transform(date, 'HH:mm');
      } ),
      datasets: [
        {
          label: 'Влажност',
          data: currentData.map(x => x.humidity),
          fill: false
        }
      ]
    }
  });
  public temperatureData = computed<any>(() => {
    const currentData = this.sensorData();
    return {
      labels: currentData.map(x =>{
        const date = new Date(x.createdOn);
        return this.datePipe.transform(date, 'HH:mm');
      } ),
      datasets: [
        {
          label: 'Температура',
          data: currentData.map(x => x.temperature),
          fill: false,
          borderColor: this.orange500,
          backgroundColor: this.orange500t50
        }
      ]
    }
  });
  public pm2Aqi = computed(() => {
    const currentData = this.sensorData();
    if (currentData.length > 10) {
      const aqi = calculateAqiFromMinutes(currentData.map(x => x.pm25), 'pm25');

      return aqi;
    }

    return undefined;
  });
  public pm10Aqi = computed(() => {
    const currentData = this.sensorData();
    if (currentData.length > 10) {
      const aqi = calculateAqiFromMinutes(currentData.map(x => x.pm10), 'pm10');

      return aqi;
    }

    return undefined;
  });

  public pm25hourlyAverage = computed(() => {
    const currentData = this.sensorData();
    let datasetData = [];

    const hourlyGroups: Record<string, number[]> = {};

    for (const item of currentData) {
      const date = item.createdOn;
      const hourKey = this.getDayOfWeekAndHourText(date);

      if (!hourlyGroups[hourKey]) {
        hourlyGroups[hourKey] = [];
      }
      hourlyGroups[hourKey].push(item.pm25);
    }

    datasetData = Object.entries(hourlyGroups).map(([hour, values]) => {
        const avg =
          values.reduce((sum, v) => sum + v, 0) / values.length;

        return {
          hour,
          average: +avg.toFixed(1)
        };
      });

    const barColors = datasetData.map(data => {
      if (data.average < 16) {
        return this.green500;
      }
      else if (data.average < 30) {
        return this.yellow400;
      }
      else if (data.average < 60) {
        return this.amber500;
      }
      else if (data.average < 80) {
        return this.orange500;
      }

      return this.red700;
    });

    return {
      labels: datasetData.map(x => x.hour),
      datasets: [
        {
          label: 'Pm 2.5 μg/m³ средна вредност',
          data: datasetData.map(x => x.average),
          backgroundColor: barColors,
          borderColor: barColors
        }
      ]
    };
  });

  public pm10hourlyAverage = computed(() => {
    const currentData = this.sensorData();
    let datasetData = [];

    const hourlyGroups: Record<string, number[]> = {};

    for (const item of currentData) {
      const date = item.createdOn;
      const hourKey = this.getDayOfWeekAndHourText(date);

      if (!hourlyGroups[hourKey]) {
        hourlyGroups[hourKey] = [];
      }
      hourlyGroups[hourKey].push(item.pm10);
    }

    datasetData = Object.entries(hourlyGroups).map(([hour, values]) => {
        const avg =
          values.reduce((sum, v) => sum + v, 0) / values.length;

        return {
          hour,
          average: +avg.toFixed(1)
        };
      });

    const barColors = datasetData.map(data => {
      if (data.average < 40) {
        return this.green500;
      }
      else if (data.average < 70) {
        return this.yellow400;
      }
      else if (data.average < 100) {
        return this.amber500;
      }
      else if (data.average < 150) {
        return this.orange500;
      }

      return this.red700;
    });

    return {
      labels: datasetData.map(x => x.hour),
      datasets: [
        {
          label: 'Pm 10 μg/m³ средна вредност',
          data: datasetData.map(x => x.average),
          backgroundColor: barColors,
          borderColor: barColors
        }
      ]
    };
  });

  public option = {
    scales: {
      y: {
        min: 0
      }
    }
  }

  public percentageOptions = {
    scales: {
      y: {
        min: 0,
        max: 100
      }
    }
  }

  public temperatureOptions = computed(() => {
    const currentData = this.sensorData().map(x => x.temperature);
    return {
      scales: {
        y: {
          min: Math.ceil(Math.min(...currentData) - 5),
          max: Math.floor(Math.max(...currentData) + 5)
        }
      }
    };
  });

  private readonly latestDataEffect = effect(() => {
    const newData = this.notificationService.latestData();

    if (!newData)
      return;

    if (this.sensorData().some(x => x.id === newData.id))
      return;

    this.sensorData.update(list => {
      if (list.length > 0) {
        list.shift();
      }

      return [...list, newData];
    });
  });

  public ngOnInit(): void {
    this.apiService.getLatestSenorData().subscribe({
      next: data => this.sensorData.set(data)
    })
  }

  public ngOnDestroy(): void {
  }

  private getDayOfWeekAndHourText(day: Date): string {
    const dayOfWeek = day.getDay();
    if (dayOfWeek === 1) {
      return `пон ${day.getHours()}ч`;
    }

    if (dayOfWeek === 2) {
      return `вто ${day.getHours()}ч`;
    }

    if (dayOfWeek === 3) {
      return `сре ${day.getHours()}ч`;
    }

    if (dayOfWeek === 4) {
      return `чет ${day.getHours()}ч`;
    }

    if (dayOfWeek === 5) {
      return `пет ${day.getHours()}ч`;
    }
    if (dayOfWeek === 6) {
      return `саб ${day.getHours()}ч`;
    }

    if (dayOfWeek === 0) {
      return `нед ${day.getHours()}ч`;
    }

    return `${dayOfWeek} ${day.getHours()}ч`;
  }
}
