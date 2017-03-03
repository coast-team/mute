import { Injectable }             from '@angular/core'
import { Router, Resolve, RouterStateSnapshot,
         ActivatedRouteSnapshot } from '@angular/router'

import { LocalStorageService } from '../core/storage/local-storage/local-storage.service'
import { UiService } from '../core/ui/ui.service'
import { File } from '../core/File'
import { Doc } from '../core/Doc'

@Injectable()
export class DocResolverService implements Resolve<string> {

  constructor (
    private router: Router,
    private ui: UiService,
    private localStorage: LocalStorageService
  ) {}

  resolve (route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise<string> {
    const urlKey = route.params['key']
    return new Promise((resolve, reject) => {
      const activeFile = this.ui.activeFile
      if (!activeFile.isDoc()) {
        log.warn('Edit a document, but the active file is not a document, thus navigate to home: ', activeFile)
        this.router.navigate([''])
      } else {
        let doc = activeFile as Doc
        if (urlKey === doc.id) {
          this.localStorage.get(doc.id)
            .then((localDoc: Doc) => {
              if (localDoc === null) {
                localDoc.save()
              }
              resolve(doc)
            })
        } else {
          this.localStorage.get(urlKey)
            .then((localDoc: Doc) => {
              if (localDoc === null) {
                doc = this.localStorage.createDoc(urlKey)
                this.ui.setActiveFile(doc)
              } else {
                this.ui.setActiveFile(doc)
              }
              resolve(doc)
            })
        }
      }
    })

    // let id = route.params['id']
    // return this.cs.getCrisis(id).then(crisis => {
    //   if (crisis) {
    //     return crisis;
    //   } else { // id not found
    //     this.router.navigate(['/crisis-center']);
    //     return null;
    //   }
    // });
  }
}
