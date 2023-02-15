import { NgModule } from '@angular/core';
import { SharedModule } from '../shared/shared.module';
import { DemoComponent } from './demo/demo.component';
import { PagesRoutingModule } from './pages.routing.module';

@NgModule({
  declarations: [DemoComponent],
  imports: [PagesRoutingModule, SharedModule],
})
export class PagesModule {}
