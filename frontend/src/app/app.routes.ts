import { Routes } from '@angular/router';
import { designExistsGuard } from './core/guards/design-exists.guard';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    loadComponent: () => import('./features/home/home.component').then((m) => m.HomeComponent),
  },
  {
    path: 'designs/:slug',
    canActivate: [designExistsGuard],
    loadComponent: () =>
      import('./features/design-page/design-page.component').then((m) => m.DesignPageComponent),
  },
  {
    path: 'not-found',
    loadComponent: () =>
      import('./features/not-found/not-found.component').then((m) => m.NotFoundComponent),
  },
  { path: '**', redirectTo: 'not-found' },
];
