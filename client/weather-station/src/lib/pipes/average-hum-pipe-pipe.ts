import { Pipe, PipeTransform } from '@angular/core';
import { GetSensorDataResponse } from '../models/responses/sensor';

@Pipe({
  name: 'averageHumPipe',
})
export class AverageHumPipePipe implements PipeTransform {

  transform(value: GetSensorDataResponse[]): unknown {
    let average = value.map(x => x.humidity).reduce((a,b) => a + b) / value.length
    return average.toFixed(1);
  }

}
