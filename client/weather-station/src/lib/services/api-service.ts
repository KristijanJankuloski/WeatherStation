import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { CreateSensorRequest } from '../models/requests/sensor';
import { GetSensorDataResponse, GetSensorResponse } from '../models/responses/sensor';
import { environment } from '../../environments/environment';

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
    return this.http.get<GetSensorDataResponse[]>(`${environment.apiBase}/sensors/data`);
  }
}
