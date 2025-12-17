import { CommonModule, DatePipe } from '@angular/common';
import { Component, computed, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ChartModule } from 'primeng/chart';
import { DatePicker } from 'primeng/datepicker';
import { ApiService } from '../../lib/services/api-service';
import { of, Subscription, switchMap } from 'rxjs';
import { GetSensorDataResponse } from '../../lib/models/responses/sensor';
import { CardModule } from 'primeng/card';
import { Select } from 'primeng/select';

@Component({
  selector: 'app-history',
  imports: [
    CommonModule,
    ChartModule,
    CardModule,
    DatePicker,
    ReactiveFormsModule,
    Select
  ],
  templateUrl: './history.html',
  styleUrl: './history.css',
  providers: [
    DatePipe
  ]
})
export class History implements OnInit, OnDestroy {
  private readonly green500 = '#22c45f';
  private readonly yellow400 = '#fbcd15';
  private readonly amber500 = '#f59e0b';
  private readonly orange500 = '#f97217';
  private readonly red700 = '#b91c1c';
  private readonly orange500t50 = 'rgba(249, 113, 23, 0.5)';

  private readonly apiService = inject(ApiService);
  private readonly datePipe = inject(DatePipe);

  public dateFromGroup = new FormGroup({
    range: new FormControl<Date[]>([]),
    period: new FormControl(60)
  });
  private dateRangeForm$?: Subscription;
  public periodOptions = [
    { name: '1 min', value: 1 },
    { name: '2 min', value: 2 },
    { name: '5 min', value: 5 },
    { name: '10 min', value: 10 },
    { name: '30 min', value: 30 },
    { name: '1 h', value: 60 },
    { name: '2 h', value: 120 },
    { name: '4 h', value: 240 },
    { name: '1 ден', value: 0 }
  ]

  public data = signal<GetSensorDataResponse[]>([]);

    public pm25 = computed(() => {
    const currentData = this.data();

    const barColors = currentData.map(data => {
      if (data.pm25 < 16) {
        return this.green500;
      }
      else if (data.pm25 < 30) {
        return this.yellow400;
      }
      else if (data.pm25 < 60) {
        return this.amber500;
      }
      else if (data.pm25 < 80) {
        return this.orange500;
      }

      return this.red700;
    });

    return {
      labels: currentData.map(x => this.getDayAndHourText(x.createdOn)),
      datasets: [
        {
          label: 'Pm 2.5 μg/m³ средна вредност',
          data: currentData.map(x => x.pm25),
          backgroundColor: barColors,
          borderColor: barColors
        }
      ]
    };
  });

  public pm10 = computed(() => {
    const currentData = this.data();

    const barColors = currentData.map(data => {
      if (data.pm10 < 40) {
        return this.green500;
      }
      else if (data.pm10 < 70) {
        return this.yellow400;
      }
      else if (data.pm10 < 100) {
        return this.amber500;
      }
      else if (data.pm10 < 150) {
        return this.orange500;
      }

      return this.red700;
    });

    return {
      labels: currentData.map(x => this.getDayAndHourText(x.createdOn)),
      datasets: [
        {
          label: 'Pm 10 μg/m³ средна вредност',
          data: currentData.map(x => x.pm10),
          backgroundColor: barColors,
          borderColor: barColors
        }
      ]
    };
  });

  public temperature = computed<any>(() => {
    const currentData = this.data();

    return {
      labels: currentData.map(x => this.getDayAndHourText(x.createdOn)),
      datasets: [
        {
          label: 'Температура',
          data: currentData.map(x => x.temperature),
          borderColor: this.orange500,
          backgroundColor: this.orange500t50,
          fill: false
        }
      ]
    }
  });

  public humidity = computed<any>(() => {
    const currentData = this.data();

    return {
      labels: currentData.map(x => this.getDayAndHourText(x.createdOn)),
      datasets: [
        {
          label: 'Влажност',
          data: currentData.map(x => x.humidity),
          fill: false
        }
      ]
    }
  });

  public ngOnInit(): void {
    this.dateRangeForm$ = this.dateFromGroup.valueChanges.pipe(
      switchMap(value => {
        if (!value || !value.range || !value.range[0] || !value.range[1]) {
          return of([]);
        }

        return this.apiService.getFromRange(value.range[0], value.range[1], value.period ?? 60);
      })
    )
    .subscribe(value => {
      this.data.set([...value]);
    });
  }

  public ngOnDestroy(): void {
    this.dateRangeForm$?.unsubscribe();
  }

  private getDayAndHourText(date: Date) : string {
    return this.datePipe.transform(date, 'dd.MM - HH:mm') ?? '';
  }
}
