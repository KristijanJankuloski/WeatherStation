import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { TableModule } from 'primeng/table';
import { GetSensorResponse } from '../../lib/models/responses/sensor';
import { ApiService } from '../../lib/services/api-service';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { switchMap } from 'rxjs';

@Component({
  selector: 'app-sensors',
  imports: [
    CommonModule,
    TableModule,
    CardModule,
    ButtonModule,
    DialogModule,
    InputTextModule,
    ReactiveFormsModule
  ],
  templateUrl: './sensors.html',
  styleUrl: './sensors.css',
})
export class Sensors implements OnInit {
  private readonly apiService = inject(ApiService);

  public sensors = signal<GetSensorResponse[]>([]);
  public dialogVisible = false;
  public sensorNameForm!: FormControl;

  public ngOnInit(): void {
    this.apiService.getSensors(0, 20).subscribe({
      next: data => {
        this.sensors.set([...data]);
      }
    });

    this.sensorNameForm = new FormControl('', [Validators.required]);
  }

  public openAddSensorDialog(): void {
    this.dialogVisible = true;
  }

  public submitCreateForm(): void {
    this.apiService.createSensor({name: this.sensorNameForm.value})
    .pipe(
      switchMap(() => {
        this.dialogVisible = false;
        this.sensorNameForm.reset();
        return this.apiService.getSensors(0, 20);
      })
    )
    .subscribe({
      next: (data) => {
        this.sensors.set([...data]);
      }
    });
  }
}
