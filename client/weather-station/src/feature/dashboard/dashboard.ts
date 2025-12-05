import { CommonModule } from '@angular/common';
import { Component, computed, effect, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { NotificationService } from '../../lib/services/notification-service';
import { GetSensorDataResponse } from '../../lib/models/responses/sensor';
import { ApiService } from '../../lib/services/api-service';
import { CardModule } from 'primeng/card';
import { ChartModule } from 'primeng/chart';
import { ProgressBarModule } from 'primeng/progressbar';
import { aqiCategoryClassNames, aqiCategoryNames, calculateAqiFromMinutes } from '../../lib/helpers/calculate-aqi';

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, ButtonModule, CardModule, ChartModule, ProgressBarModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard implements OnInit, OnDestroy {
  private readonly notificationService = inject(NotificationService);
  private readonly apiService = inject(ApiService);

  public aqiCategoryName = aqiCategoryNames;
  public aqiCategoryClass = aqiCategoryClassNames;
  public sensorData = signal<GetSensorDataResponse[]>([]);
  public latestData = computed(() => this.sensorData().at(-1));
  public data = computed<any>(() => {
    const currentData = this.sensorData();
    return {
      labels: currentData.map(x =>{
        const date = new Date(x.createdOn);
        return `${date.getHours()}:${date.getMinutes()}`;
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
        // return `${date.getHours()}:${date.getMinutes()}`;
        return '';
      } ),
      datasets: [
        {
          label: 'Humidity',
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
        return '';
        // return `${date.getHours()}:${date.getMinutes()}`;
      } ),
      datasets: [
        {
          label: 'Temperature',
          data: currentData.map(x => x.temperature),
          fill: false
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
          min: Math.min(...currentData) - 5,
          max: Math.max(...currentData) + 5
        }
      }
    }
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
}
