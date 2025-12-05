import { Routes } from '@angular/router';
import { Dashboard } from '../feature/dashboard/dashboard';

export const routes: Routes = [
    { path: 'dashboard', loadComponent: () => Dashboard },
    { path: '', pathMatch: 'full', redirectTo: 'dashboard' }
];
