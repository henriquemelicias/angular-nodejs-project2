export class Alert {
  id!: string;
  type!: AlertType;
  message: string = '';
  isCloseable: boolean = false;
  isAutoClosed: boolean = false;
  isKeptAfterRouteChange: boolean = false;
  hasAnimationShake: boolean = true;
  isFaded!: boolean;

  constructor( init?: Partial<Alert> ) {
    Object.assign( this, init );
  }
}

export enum AlertType {
  Success,
  Error,
  Info,
  Warning
}

