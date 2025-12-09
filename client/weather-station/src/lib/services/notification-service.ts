import { Injectable, signal } from '@angular/core';
import * as signalR from '@microsoft/signalr';
import { environment } from '../../environments/environment';
import { GetSensorDataResponse } from '../models/responses/sensor';

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  private hubConnection?: signalR.HubConnection;
  public latestData = signal<GetSensorDataResponse | undefined>(undefined);

  constructor() {
    this.startConnection();
    this.addMessageListener();
  }

  public startConnection() {
    if (this.hubConnection?.state === signalR.HubConnectionState.Connected) {
      return;
    }

    this.hubConnection = new signalR.HubConnectionBuilder()
    .withUrl(environment.signalHub)
    .build();

    this.hubConnection.start()
    .then(() => console.log('Connection started'))
    .catch(err => console.error(err));
  }

  public addMessageListener() {
    this.hubConnection!.on('Notification', (data: string) => {
      const obj: GetSensorDataResponse = JSON.parse(data);
      obj.createdOn = new Date(obj.createdOn);
      this.latestData.set(obj);
    });
  }
}
