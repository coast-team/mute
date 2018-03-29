import { Component, Injectable } from '@angular/core'

@Component({
  selector: 'mute-markdown-cheatsheet',
  templateUrl: './markdown-cheatsheet.component.html',
  styleUrls: ['./markdown-cheatsheet.component.scss'],
})
@Injectable()
export class MarkdownCheatsheetComponent {
  public headers: any[] = [
    { md: 'Header', s: '# Header', class: 'header-1 header-1::after' },
    { md: 'Header', s: '## Header', class: 'header-2 header-2::after' },
    { md: 'Header', s: '### Header', class: 'header-3' },
    { md: 'Header', s: '#### Header', class: 'header-4' },
    { md: 'Header', s: '##### Header', class: 'header-5' },
  ]
  public styles: any[] = [
    { md: 'Italic', s: '*Italic* _Italic_', class: 'italic' },
    { md: 'Strong', s: '**Strong** __Strong__', class: 'strong' },
    { md: 'Strikethrough', s: '~~Strikethrough~~', class: 'strikethrough' },
    { md: 'Quotation', s: '> Quotation', class: 'quotation quotation::before' },
  ]
  public numberedList: any[] = [{ md: '1. First item', s: '1. First item', class: 'list' }]
  public bulletedLists: any[] = [
    { md: '* First item', s: '* First item', class: 'list' },
    { md: '- First item', s: '- First item', class: 'list' },
    { md: '+ First item', s: '+ First item', class: 'list' },
  ]
  public checkList: any[] = [
    { md: '- [ ]', s: '- [ ] To do', class: 'check-list' },
    { md: '- [x]', s: '- [x] Done', class: 'check-list check-list-checked' },
  ]
  public inlineLinks: any[] = [
    { md: 'Link', s: '[Link](url)', class: 'url' },
    { md: 'Titled Link', s: '[Link](url "Title")', class: 'url' },
  ]
  public referencedLinks: any[] = [
    { md: 'Link[Reference]', s: '[Link][Reference]<br><em>Potential text</em><br>[Reference]: url', class: 'url' },
    { md: 'Link', s: '[Link]<br><em>Potential text</em><br>[Link]: url', class: 'url' },
  ]
  public inlineCode: any[] = [{ md: 'code', s: '`code`', class: 'inline-code' }]
  public blockCode: any[] = [
    { md: '```python', s: '```language', class: 'block-code' },
    { md: '     Your code', s: '      Your code' },
    { md: '```', s: '```', class: 'block-code' },
  ]
}
