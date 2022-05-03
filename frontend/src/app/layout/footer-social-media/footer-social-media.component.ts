import { Component } from '@angular/core';

class SocialMedia {
  link: string;
  user: any;

  constructor( link: string, user: string ) {
    this.link = link;
    this.user = user;
  }
}

@Component( {
  selector: 'app-footer-social-media',
  templateUrl: './footer-social-media.component.html',
  styleUrls: [ './footer-social-media.component.css' ]
} )
export class FooterSocialMediaComponent {

  youtubeLink: string = "https://www.youtube.com/";
  twitterLink: string = "https://twitter.com/";
  linkedInLink: string = "";
  mediumLink: string = "https://medium.com/";

  youtube: SocialMedia = new SocialMedia( "watch?v=dQw4w9WgXcQ", "Rick Astley" );
  twitter: SocialMedia = new SocialMedia( "everydaycows?lang=en", "@EveryDayCows" );
  linkedIn: SocialMedia = new SocialMedia( "https://2.bp.blogspot.com/-BjEdnSBfVdM/W5foVhMqlwI/AAAAAAAAB0Y/03AuKw4hKrIBh0ZkjOimKPsTPlaUEY7lQCLcBGAs/s1600/unemployed-man-isolated-white-background-young-adult-looking-job-holding-sign-i-need-job-64960582.jpg", "depression" );
}
