export interface Theme {
  name: string;
  properties: any;
}

export const DARK: Theme = {
  name: "Dark",
  properties: {
    "--primary-color": "#848fa4",
    "--primary-color-variant-light": "#b4bfd5",
    "--primary-color-variant-dark": "#576275",
    "--secondary-color": "#ffb74d",
    "--secondary-color-variant-light": "#ffe97d",
    "--secondary-color-variant-dark": "#ffa726",
    "--background-color": "#0f131a",
    "--surface-color": "#252E3F",
    "--error-color": "#ff7961",
    "--font-color-on-primary": "#000",
    "--font-color-on-secondary": "#000",
    "--font-color-on-background": "var( --primary-color )",
    "--font-color-on-surface": "var( --primary-color )",
    "--font-color-inverted": "#000",
    "--font-color-highlight": "#ffff",

    /* Element specific variables */
    "--background-image-color": "var( --primary-color )",
    "--background-blur": "15px",
    "--background-brightness": "25%",
    "--ligthbox-background-color": "rgba(0,0,0,.5)",
    "--header-background-color": "#252E3F99",
    "--footer-background-color": "#252E3F99",
    "--border-color": "var( --surface-color )",
    "--blog-entry-body-background-color": "#252E3FE6"
  }
};

export const BLOOD: Theme = {
  name: "BLOOD FOR THE BLOOD GOD",
  properties: {
    "--primary-color": "red",
    "--primary-color-variant-light": "red",
    "--primary-color-variant-dark": "red",
    "--secondary-color": "orange",
    "--secondary-color-variant-light": "orange",
    "--secondary-color-variant-dark": "orange",
    "--background-color": "black",
    "--surface-color": "grey",
    "--error-color": "purple",
    "--font-color-on-primary": "#000",
    "--font-color-on-secondary": "#000",
    "--font-color-on-background": "var( --primary-color )",
    "--font-color-on-surface": "var( --primary-color )",
    "--font-color-inverted": "#000",
    "--font-color-highlight": "#ffff",

    /* Element specific variables */
    "--background-image-color": "var( --primary-color )",
    "--background-blur": "15px",
    "--background-brightness": "25%",
    "--ligthbox-background-color": "rgba(0,0,0,.5)",
    "--header-background-color": "darkred",
    "--footer-background-color": "darkred",
    "--border-color": "var( --surface-color )",
    "--blog-entry-body-background-color": "#252E3FE6"
  }
};

export const DEFAULT_THEME = DARK;
