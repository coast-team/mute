import { BrowserModule } from '@angular/platform-browser'
import { NgModule } from '@angular/core'
import { FormsModule } from '@angular/forms'
import { HttpModule } from '@angular/http'
import { MaterialModule } from '@angular/material'
import { RouterModule } from '@angular/router'

import { AppComponent } from './app.component'
import { EditorComponent } from './editor/editor.component'
import { CoreModule } from './core/core.module'
import { LeftsideComponent } from './leftside/leftside.component'
import { RightsideComponent } from './rightside/rightside.component'
import { DocComponent } from './doc/doc.component';
import { DocsComponent } from './docs/docs.component'

@NgModule({
  declarations: [
    AppComponent,
    EditorComponent,
    LeftsideComponent,
    RightsideComponent,
    DocComponent,
    DocsComponent
  ],
  imports: [
    BrowserModule,
    CoreModule,
    FormsModule,
    HttpModule,
    MaterialModule.forRoot(),
    RouterModule.forRoot([
      {path: ':docTitle', component: DocComponent},
      {path: '', component: DocsComponent}
    ])
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
