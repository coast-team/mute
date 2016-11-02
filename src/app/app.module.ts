import { BrowserModule } from '@angular/platform-browser'
import { NgModule } from '@angular/core'
import { FormsModule } from '@angular/forms'
import { HttpModule } from '@angular/http'
import { MaterialModule } from '@angular/material'

import { AppComponent } from './app.component'
import { EditorComponent } from './editor/editor.component'
import { CoreModule } from './core/core.module'
import { LeftsideComponent } from './leftside/leftside.component'
import { RightsideComponent } from './rightside/rightside.component'

@NgModule({
  declarations: [
    AppComponent,
    EditorComponent,
    LeftsideComponent,
    RightsideComponent
  ],
  imports: [
    BrowserModule,
    CoreModule,
    FormsModule,
    HttpModule,
    MaterialModule.forRoot()
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
