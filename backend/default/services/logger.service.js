const appConfig = require( '../configs/app.config' );
const fs = require( "fs" );
const util = require( "util" );
const path = require( "path" );
const async = require( "async" );

const logHttp = require( 'debug' )( 'http' );
const logInfo = require( 'debug' )( 'info' );
const logDebug = require( 'debug' )( 'debug' );
const logError = require( 'debug' )( 'error' );
const logWarn = require( 'debug' )( 'warning' );

const DATE_FORMAT = (new Date()).toUTCString().replaceAll( " ", "-" ).replace( "-", "" );
const FILE_LOG_PATH = "./logs/" + DATE_FORMAT + "." + appConfig.NODE_ENV + ".log";

function removeOldestFiles( directory, numberFilesToKeep, callback ) {
    // Guards
    if ( typeof directory !== 'string' ) throw new TypeError( "Argument directory is not a string." );
    if ( typeof numberFilesToKeep !== 'number' ) throw new TypeError( "Argument numberFilesToKeep is not a number." );
    if ( numberFilesToKeep < 0 ) throw new TypeError( "Argument numberFilesToKeep is negative." );

    if ( !callback ) callback = function ( err, removeFiles ) {
    };

    // Read directory.
    fs.readdir( directory, ( err, files ) => {
        if ( err ) return callback( err );

        // Get file names string with path.
        const fileNamesMap = files.map( ( fileName ) => path.join( directory, fileName ) );

        async.map(
            fileNamesMap,
            function ( fileName, callback ) { // check if files are not directories and when they were created
                fs.stat( fileName, function ( err, stat ) {
                    if ( err ) return callback( err );

                    callback( null, {
                        name: fileName,
                        isFile: stat.isFile(),
                        time: stat.ctime
                    } );
                } );
            },
            function ( err, files ) {
                if ( err ) return callback( err );

                // Filter out the directories
                files = files.filter( file => file.isFile );

                // Sort by the time of creation.
                files = files.sort( ( file1, file2 ) => { return file1.birthtime < file2.birthtime? 1 : -1 } );

                // Leave files to be removed on the list.
                files = files.slice( numberFilesToKeep );

                async.map(
                    files,
                    function ( file, callback ) { // Remove files.
                        fs.unlink( file.name, function ( err ) {
                            if ( err ) return callback( err );

                            callback( null, "DELETED " + file.name );
                        } );
                    },
                    function ( err, removedFiles ) { // Return removed files names.
                        if ( err ) return callback( err );

                        callback( null, removedFiles );
                    } );
            } );
    } );
}

const setCallerInfo = function ( req, callerClass, callerFunction ) {
    req.loggerCallerClass = callerClass;
    req.loggerCallerFunction = callerFunction;

    return callerInfo( callerClass, callerFunction );
}

const callerInfo = function ( ...args ) {
    return args.map( a => {

        let result = 'Unknown';
        if ( typeof a === 'string' ) {
            result = a;
        }
        else if ( a.name ) {
            result = a.name;
        }
        else if ( Object.getPrototypeOf( a ).constructor.name ) {
            result = Object.getPrototypeOf( a ).constructor.name;
        }

        return result;
    } ).join( '.' );
}

const loggerFn = async ( caller, ...args ) => {
    let callerString = '';
    if ( caller ) {
        callerString = caller + ' ->';
    }

    process.stderr.write( util.format( callerString, ...args ) + '\n' );
    let data = util.format( callerString, args.join() );
    data = data.replace( /[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g, '' );
    fs.appendFileSync( FILE_LOG_PATH, data + "\n" );
}

logHttp.log = loggerFn;
logInfo.log = loggerFn;
logDebug.log = loggerFn;
logError.log = loggerFn;
logWarn.log = loggerFn;

// Remove oldest files.
removeOldestFiles( "./logs", Number( appConfig.LOG_FILES_MAX_NUMBER ), function ( err, filesRemoved ) {
    if ( err ) {
        logError( callerInfo( 'LoggerService', removeOldestFiles ), err );
        return;
    }

    if ( filesRemoved.length > 0 ) {
        filesRemoved = filesRemoved.map( f => ' '.repeat( 'info'.length + 3 ) + f );
        let logMessage = "Maximum number of previous log files (" +
            appConfig.LOG_FILES_MAX_NUMBER +
            ") has been reached. Old log files deleted: \n" +
            filesRemoved.join( '\n' );
        logInfo( callerInfo( 'LoggerService', removeOldestFiles ), logMessage );
    }
} )

module.exports = {
    http: logHttp,
    info: logInfo,
    debug: logDebug,
    error: logError,
    warn: logWarn,
    setCallerInfo,
    callerInfo
}