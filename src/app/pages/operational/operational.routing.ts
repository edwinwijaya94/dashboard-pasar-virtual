import { Routes, RouterModule } from '@angular/router';

import { OperationalComponent } from './operational.component';

const routes: Routes = [
  {
    path: '',
    component: OperationalComponent
  }
];

export const routing = RouterModule.forChild(routes);