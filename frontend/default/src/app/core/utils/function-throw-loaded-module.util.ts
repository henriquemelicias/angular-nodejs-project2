/**
 * Do not allow a module to be loaded if it is already loaded. Throw an error.
 *
 * @param parentModule module parent.
 * @param moduleName module name.
 */
export function throwIfAlreadyLoaded( parentModule: any, moduleName: string ) {
  if ( parentModule ) {
    throw new Error(
      `${ moduleName } has already been loaded. Import ${ moduleName } modules in the AppModule only.`
    );
  }
}
