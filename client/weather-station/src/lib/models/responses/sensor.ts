export interface GetSensorResponse {
    id: number;
    name: string;
    createdOn: Date;
}

export interface GetSensorDataResponse {
    id: number;
    pm1: number;
    pm25: number;
    pm10: number;
    temperature: number;
    humidity: number;
    createdOn: Date;
}
