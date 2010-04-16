function Decimal(num) {
    if(this.constructor != Decimal) {
        return new Decimal(num);
    }

    if(num instanceof Decimal) {
	return num
    }

    this.internal = String(num);
    this.exp = this.get_exp();
    this.repr = this._get_repr();
}

Decimal.prototype._as_exp = function(exp) {
    var exp = exp + this.repr.exp;
    return parseInt(Decimal._format(this.repr.value, exp),10);
}

Decimal.prototype._get_repr = function() {
    var value = parseInt(this.internal.split('.').join(''), 0);

    return {'value':value.toString(), 'exp':this.exp};
}

Decimal.prototype.get_exp = function() {
    var decimal = this.internal.split('.')[1] || "";
    return -1 * decimal.length; 
}



Decimal.prototype.add = function(target) {
    target = Decimal(target);
    
    var ops = [this, target];
    ops.sort(function(x, y) {
	if(x.exp > y.exp) {
	    return -1;
	}
	if(x.exp < y.exp) {
	    return 1;
	}
	if(x.exp == y.exp) {
	    return 0;
	}
    });

    var tiniest = ops[1].exp;

    var fst = ops[0]._as_exp(Math.abs(tiniest));
    var snd = ops[1]._as_exp(Math.abs(tiniest));
    var calc = String(fst * 1 + snd * 1);

    return Decimal._format(calc, tiniest);
}

Decimal.prototype.mul = function(target) {
    target = Decimal(target);
    
    var ops = [this, target];
    ops.sort(function(x, y) {
	if(x.exp > y.exp) {
	    return -1;
	}
	if(x.exp < y.exp) {
	    return 1;
	}
	if(x.exp == y.exp) {
	    return 0;
	}
    });

    var tiniest = ops[1].exp;
    var greatest = ops[0].exp;

    var fst = ops[0].repr.value;
    var snd = ops[1]._as_exp(greatest);

    var calc = String(fst * snd);

    return Decimal._format(calc, greatest + tiniest);
}


Decimal.prototype.toString = function() {
    return this.internal;
}




Decimal._neg_exp = function(str, position) {
    position = Math.abs(position);
    var offset = position - str.length;
    var sep = '.'

    if(offset >= 0) {
	str = Decimal.__zero(offset) + str;
	sep = 0 + '.';
    }

    return str.substr(0, str.length - position) + sep + str.substr(-position)
}

Decimal._pos_exp = function(str, exp) {
    var zeros = Decimal.__zero(exp);
    return str + zeros;
}

Decimal._format = function(str, exp) {
    var method = exp >= 0 ? '_pos_exp' : '_neg_exp';
    return Decimal[method](str, exp);
}

Decimal.__zero = function(exp) {
    return new Array(exp + 1).join('0');
}


var assert = {
    log : function() {
	//FIX ME
	return typeof(console) != 'undefined' ? console.log : print;
    }(),
    tests : 0,
    failed : 0,
    equals : function(given, expected) {
	this.tests += 1;
	if(given != expected) {
	    this.failed += 1;
	    this.log('Failed: "' + given + '" does not equal "' + expected + '"')
	}
    },
    summary : function() {
	this.log()
	this.log(this.tests + ' tests, ' + this.failed + ' failed')
    }
}





// Static methods
assert.equals(Decimal._neg_exp('100135',-1), '10013.5')
assert.equals(Decimal._neg_exp('100135',-3), '100.135')
assert.equals(Decimal._neg_exp('100135',-4), '10.0135')
assert.equals(Decimal._neg_exp('100135',-5), '1.00135')
assert.equals(Decimal._neg_exp('100135',-6), '0.100135')
assert.equals(Decimal._neg_exp('100135',-9), '0.000100135')


assert.equals(Decimal._pos_exp('1013',0), '1013')
assert.equals(Decimal._pos_exp('1013',1), '10130')
assert.equals(Decimal._pos_exp('1013',3), '1013000')
assert.equals(Decimal._pos_exp('1013',4), '10130000')
assert.equals(Decimal._pos_exp('1013',5), '101300000')
assert.equals(Decimal._pos_exp('1013',6), '1013000000')
assert.equals(Decimal._pos_exp('1013',9), '1013000000000')

assert.equals(Decimal._format('1013',0), '1013')
assert.equals(Decimal._format('1013',1), '10130')
assert.equals(Decimal._format('1013',3), '1013000')
assert.equals(Decimal._format('1013',-1), '101.3')
assert.equals(Decimal._format('1013',-3), '1.013')
assert.equals(Decimal._format('1013',-5), '0.01013')


// Instanciation
assert.equals(Decimal(5) instanceof Decimal, true)
assert.equals(Decimal(5), '5')
assert.equals(Decimal('5'), '5')
assert.equals(Decimal(5.1), '5.1')
assert.equals(Decimal(Decimal(5.1)) instanceof Decimal, true)


// Private methods
assert.equals(Decimal('100.2')._as_exp(2), '10020')
assert.equals(Decimal('0.2')._as_exp(2), '20')
assert.equals(Decimal('0.2')._as_exp(3), '200')
assert.equals(Decimal('0.02')._as_exp(3), '20')

assert.equals(Decimal('0.02')._as_exp(-1), '0.002')
assert.equals(Decimal('0.02')._as_exp(-2), '0.0002')
assert.equals(Decimal('0.02')._as_exp(-3), '0.00002')


assert.equals(Decimal('100.2')._get_repr(2).value, '1002')
assert.equals(Decimal('100.2')._get_repr(2).exp, '-1')

assert.equals(Decimal('0.2')._get_repr(2).value, '2')
assert.equals(Decimal('0.2')._get_repr(2).exp, '-1')

assert.equals(Decimal('0.02')._get_repr(2).value, '2')
assert.equals(Decimal('0.02')._get_repr(2).exp, '-2')

assert.equals(Decimal('200')._get_repr(2).value, '200')
assert.equals(Decimal('200')._get_repr(2).exp, '1')


assert.equals(Decimal('2000000')._get_repr(2).value, '2000000')
assert.equals(Decimal('2000000')._get_repr(2).exp, '1')



// Addition
assert.equals(Decimal('100.2').add('1203.12'), '1303.32')
assert.equals(Decimal('1.2').add('1000'), '1001.2')
assert.equals(Decimal('1.245').add('1010'), '1011.245')
assert.equals(Decimal('5.1').add('1.901'), '7.001')
assert.equals(Decimal('1001.0').add('7.12'), '1008.12')

/*
// Multiplication
assert.equals(Decimal('50').mul('2.901'), '145.05')
assert.equals(Decimal('-50').mul('2.901'), '-145.05')
assert.equals(Decimal('-50').mul('-2.901'), '145.05')

assert.equals(Decimal('50').mul('2901'), '145050')
assert.equals(Decimal('-50').mul('2901'), '-145050')
assert.equals(Decimal('-50').mul('-2901'), '145050')

assert.equals(Decimal('1.125').mul('0.1201'), '0.1351125');
assert.equals(Decimal('01.125').mul('0.1201'), '0.1351125');
*/

assert.summary(); 