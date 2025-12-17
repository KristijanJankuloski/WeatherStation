import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { CreateSensorRequest } from '../models/requests/sensor';
import { GetSensorDataResponse, GetSensorResponse } from '../models/responses/sensor';
import { environment } from '../../environments/environment';
import { map } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private readonly http = inject(HttpClient);

  public createSensor(req: CreateSensorRequest) {
    return this.http.post(`${environment.apiBase}/sensors`, req);
  }

  public getSensors(skip: number, take: number) {
    return this.http.get<GetSensorResponse[]>(`${environment.apiBase}/sensors?skip=${skip}&take=${take}`);
  }

  public getLatestSenorData() {
    return this.http.get<GetSensorDataResponse[]>(`${environment.apiBase}/sensors/data`).pipe(
      map(data => data.map(x => ({...x, createdOn: new Date(x.createdOn)})))
    );
  }

  public getFromRange(start: Date, end: Date, roundTime: number) {
    console.log(start);
    console.log(this.toDateOnly(start))
    return this.http.get<GetSensorDataResponse[]>(`${environment.apiBase}/sensors/data-history?start=${this.toDateOnly(start)}&end=${this.toDateOnly(end)}&roundTime=${this.toTimeOnly(roundTime)}`)
      .pipe(map(data => data.map(x => ({...x, createdOn: new Date(x.createdOn)}))));
  }

  private toDateOnly(date: Date): string {
    return new Intl.DateTimeFormat('en-CA').format(date);
  }

  private toTimeOnly(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}
}
