/**
 * Created by Nicholas_Wang on 2016/3/15.
 */

function nameTest(string){
    var reg = /^\w{3,20}$/;
    return reg.test(string);
}

function passwordTest(string){
    var reg1 = /[a-z]/;
    var reg2 = /[A-Z]/;
    var reg3 = /[0-9]/;
    var reg4 = /[a-zA-Z0-9]{6,}/;
    return reg1.test(string) && reg2.test(string) && reg3.test(string) && reg4.test(string);
}

exports.nameTest = nameTest;
exports.passwordTest = passwordTest;