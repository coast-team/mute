import { MutePage } from './app.po';

describe('mute App', function() {
  let page: MutePage;

  beforeEach(() => {
    page = new MutePage();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});
