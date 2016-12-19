import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { RouterModule } from '@angular/router'
import { MaterialModule } from '@angular/material'

import { DocsComponent } from './docs.component'
import { BotStorageService } from 'core/bot-storage'

@NgModule({
  declarations: [ DocsComponent ],
  imports: [
    CommonModule,
    MaterialModule.forRoot(),
    RouterModule.forChild([
      {path: '', component: DocsComponent}
    ])
  ],
  providers: [ BotStorageService ]
})
export class DocsModule { }
