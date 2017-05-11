import { PictureTablePage } from './app.po';

describe('picture-table App', function() {
  let page: PictureTablePage;

  beforeEach(() => {
    page = new PictureTablePage();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});
