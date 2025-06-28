import { importProvidersFrom } from '@angular/core';
import { RouterModule } from '@angular/router';
import { routes } from './app.routes';

export const appConfig = {
  providers: [
    importProvidersFrom(RouterModule.forRoot(routes))
  ]
};
