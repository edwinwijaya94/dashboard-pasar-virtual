import { Routes, RouterModule } from '@angular/router';

import { FareManagerComponent } from './fare-manager.component';

const routes: Routes = [
  {
    path: '',
    component: FareManagerComponent
  }
];

export const routing = RouterModule.forChild(routes);