/**
 * Created by Yusaira on 2/21/2015.
 */

parameter={
    length_ratio: Math.sqrt(1.5),
    width_ratio: 1/parameter.length_ratio,
    areaRatio: Math.sqrt(6)
};

calculator={
    getResolution : function(divisions){
        if( calculator.isPrime(divisions)) return 0;
        var square = divisions * divisions;


    },
    minSide: 4,
    isPrime: function(number){
        if (number<2) return false;
        var last = Math.floor( Math.sqrt(number))
        for (var i = 2; i < last; i++){
            if( number%i === 0) return false;
        }
        return true;
    }
};




