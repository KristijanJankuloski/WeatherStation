import { Pipe, PipeTransform } from '@angular/core';
import { GetSensorDataResponse } from '../models/responses/sensor';

@Pipe({
  name: 'minTempPipe',
})
export class MinTempPipePipe implements PipeTransform {

  transform(value: GetSensorDataResponse[]): unknown {
    return Math.min(...value.map(x => x.temperature)).toFixed(1);
  }

}
