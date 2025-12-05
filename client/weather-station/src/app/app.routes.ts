import { Routes } from '@angular/router';
import { Dashboard } from '../feature/dashboard/dashboard';
import { Sensors } from '../feature/sensors/sensors';

export const routes: Routes = [
    { path: 'dashboard', loadComponent: () => Dashboard },
    { path: 'sensors', loadComponent: () => Sensors },
    { path: '', pathMatch: 'full', redirectTo: 'dashboard' }
];
