import { Routes, RouterModule } from '@angular/router';

import { VirtualmarketComponent } from './virtualmarket.component';

const routes: Routes = [
  {
    path: '',
    component: VirtualmarketComponent
  }
];

export const routing = RouterModule.forChild(routes);