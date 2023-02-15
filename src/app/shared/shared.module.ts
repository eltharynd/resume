import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { FormsModule, ReactiveFormsModule } from '@angular/forms'
import { NotFoundComponent } from './components/404.component'
import { SharedMaterialModule } from './material.module'
import { FormControlErrorsPipe } from './pipes/formcontrol-error.pipe'

const declarations: any[] = [NotFoundComponent, FormControlErrorsPipe]
const imports: any[] = [CommonModule, FormsModule, ReactiveFormsModule]

@NgModule({
  declarations: [...declarations],
  imports: [...imports, SharedMaterialModule],
  exports: [...imports, ...declarations, SharedMaterialModule],
})
export class SharedModule {}
