var express = require('express');
var router = express.Router();
var fs = require('fs');
var login = require('../lib/login.js');
var auth = require('../lib/auth.js');
var mailer = require('../lib/mailer.js');
var mailer_success = require('../lib/mailer_success.js');
var mysql = require('../lib/mysql.js');
var md5 = require('md5');

/* GET home page. */
router.get('/', function(req, res, next) {
  var role = req.session.role;
  var query = require('url').parse(req.url,true).query;
  var msg = query.msg;
  if ((role == 0 ||role==1) && auth.isUserValidated(role)) {
    res.redirect('/users/home');
  }else if(msg){
	res.render('index', {error: msg}); 
  } else {
    var error = req.session.error || (req.session.error = false);
    res.render('index', {error: error});
  }
});


router.post('/', function(req, res, next) {
  //console.log('Hi');
  login(req, res);
});

router.get('/forgot_password', function(req, res, next) {
  var query = require('url').parse(req.url,true).query;
  var msg = query.msg;
  if(msg == undefined){
    msg = 2;
	res.render('forget',{error:msg});
  }
  else if(msg==0)
  {
	res.render('forget',{error:msg});
  }
  else if(msg==1)
  {
	res.render('index',{error:2});
  }
  
});

router.get('/sign_up', function(req, res, next) {
  var query = require('url').parse(req.url,true).query;
  var msg = query.msg;
  if(msg == undefined){
    msg = 1;
	res.render('sign_up',{flag:msg});
  }
  else
  {
	res.render('sign_up',{flag:msg});
  }
  
});

router.post('/sign_up', function(req, res, next) {
	
	var unique_activation=md5(req.body.email);
 var query = {
    sql : 'call usp_addUser(?,?,?,?,?,?,?)',
    values : [req.body.email,req.body.firstname,req.body.lastname,req.body.mobile,req.body.password,0,unique_activation]
  }
  mysql(query,function(err,result){
    if(err){
      console.log(err);
    }
    else
    {
		if(result[0][0].last_id==-1)
		{
			res.redirect('/sign_up?msg=0');
		}
		else
		{
			mailer_success(req, res, "You Sucessfully Registered with us.\n Please Click the Below link to activate your account:  http://10.0.177.223:3000/activate?uni="+unique_activation);
			res.render('congrats');
		}
    }
  });
});

router.post('/forgot_password', function(req, res, next) {
  var query = {
    sql : 'call usp_forgetpassword_rs(?)',
    values : [req.body.email]
  }
  mysql(query,function(err,result){
    if(err){
      console.log(err);
    }
    else
    {
      var check = result[0];
      var finalresult=check[0].count;
      if( finalresult != 0){
        var password = util.generatePassword();
        mailer(req, res, password, '/', 'Please try with this new password : ');
        
      }
      else{
        res.redirect('/forgot_password?msg=0')
      }
    }
  });
  
});

router.get('/activate', function(req, res, next) {
	var query = require('url').parse(req.url,true).query;
	var uni = query.uni;
  var query = {
    sql : 'call usp_activateUser_rs(?)',
    values : [uni]
  }
  mysql(query,function(err,result){
    if(err){
      console.log(err);
    }
    else
    {
		if(result)
		{
			console.log('result[0][0].status',result[0][0].status);
			if(result[0][0].status==0)
			res.render('index', {error: '6'}); 
			else if(result[0][0].status==1)
			res.render('index', {error: '5'});
			else if(result[0][0].status==2)
			res.render('index', {error: '7'}); 
			
		}
    }
  });
  
});

module.exports = router;
