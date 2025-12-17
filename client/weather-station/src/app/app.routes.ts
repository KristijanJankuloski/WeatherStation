import { Routes } from '@angular/router';
import { Dashboard } from '../feature/dashboard/dashboard';
import { Sensors } from '../feature/sensors/sensors';
import { History } from '../feature/history/history';

export const routes: Routes = [
    { path: 'dashboard', loadComponent: () => Dashboard },
    { path: 'sensors', loadComponent: () => Sensors },
    { path: 'history', loadComponent: () => History },
    { path: '', pathMatch: 'full', redirectTo: 'dashboard' }
];
