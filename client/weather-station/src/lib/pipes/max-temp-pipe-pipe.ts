import { Pipe, PipeTransform } from '@angular/core';
import { GetSensorDataResponse } from '../models/responses/sensor';

@Pipe({
  name: 'maxTempPipe',
})
export class MaxTempPipePipe implements PipeTransform {

  transform(value: GetSensorDataResponse[]): unknown {
    return Math.max(...value.map(x => x.temperature)).toFixed(1);
  }

}
