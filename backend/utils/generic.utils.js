function firstDigit( number ) {
    let firstDigitString = "";
    if ( number < 0 ) {
        firstDigitString = String( number )[1];
    }
    else {
        firstDigitString = String( number )[0];
    }

    return Number( firstDigitString );
}

module.exports = {
    firstDigit
}