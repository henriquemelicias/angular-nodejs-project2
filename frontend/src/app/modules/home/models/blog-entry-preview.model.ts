export class BlogEntryPreview {
  id: string;
  title: string;
  img: string;
  imgAlt: string;
  date: string;
  summary: string;

  constructor( id: string, title: string, img: string, imgAlt: string, date: string, summary: string ) {
    this.id = id;
    this.title = title;
    this.img = img;
    this.imgAlt = imgAlt;
    this.date = date;
    this.summary = summary;
  }
}
