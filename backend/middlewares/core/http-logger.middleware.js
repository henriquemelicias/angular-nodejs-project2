const morgan = require( 'morgan' )
const json = require( 'morgan-json' )
const date = require('date-and-time')

const morganFormat = json( {
    method: ':method',
    url: ':url',
    status: ':status',
    contentLength: ':res[content-length]',
    responseTime: ':response-time ms',
    user: ':user-agent'
}, {} )

const logger = require( '#services/logger.service' )
const httpLogger = morgan( morganFormat, {
    stream: {
        write: ( message ) => {
            const {
                method,
                url,
                status,
                contentLength,
                responseTime,
                user
            } = JSON.parse( message )

            logger.http( '%o', {
                time: date.format( new Date(), 'YYYY-MM-DD HH:m:s' ),
                method,
                url,
                status: Number( status ),
                contentLength,
                responseTime: responseTime,
                user
            } )
        }
    }
} )

module.exports = httpLogger