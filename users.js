var express = require('express');
var router = express.Router();
var auth = require('../lib/auth.js');
var mysql = require('../lib/mysql.js');

var math = require('mathjs');
var fs = require('fs');
var path = require('path');

router.use(function(req, res, next) {
    var role = req.session.role;
    if (auth.isUserValidated(role)) {
        next();
    } else {
        res.redirect('/');
    }
});

router.get('/changePassword', function(req, res, next) {
    res.render('users/changepassword', {
        name: req.session.email
    })
});

router.post('/change_passeord', function(req, res, next) {
    var query = {
        sql: 'call usp_chengepassword_nr(?,?)',
        values: [req.session.email, req.body.newp]
    }
    mysql(query, function(e, r) {
        if (e) {
            console.log(e);
        } else {
            res.redirect('/users/logout');
        }
    });
});

router.get('/home', function(req, res, next) {
	var query = require('url').parse(req.url, true).query;
    var msg = query.msg;
	if(msg==undefined)
	{
		msg=0;
	}
	else
	{
		msg=msg;
	}
	var query={
		sql:'call usp_getpost()',
	};
	 mysql(query, function(err, r) {
        if (err) {
            console.log(err);
            res.redirect('/users/home');
        } else {
            
            res.render('users/home', {
				msg:msg,
				role:req.session.role,
				name: req.session.email,
				uid: req.session.uid,
                articles_data:r[0],
				comments_data:r[1],
				likes_data:r[2],
				user_likes_data:r[3],
				comment_likes:r[4],
				comment_likes_data:r[5]
            });
        }
    });
	
});

router.post('/newpost',function(req, res, next) {
	var subject=req.body.subject;
	var content=req.body.content;
	var query = {
        sql: 'call usp_addNewpost(?,?,?)',
        values: [req.session.uid, subject, content]
    }
    mysql(query, function(err, r) {
        if (err) {
            console.log(err);
            res.redirect('/users/home');
        } else {
             res.redirect('/users/home?msg=1');
        }
    });

});

router.post('/changeLikeStatus',function(req, res, next) {
	var uid=req.body.uid;
	var flag=req.body.flag;
	var aid=req.body.aid;
	var query = {
        sql: 'call usp_changeLikeStatus(?,?,?)',
        values: [uid, flag, aid]
    }
    mysql(query, function(err, r) {
        if (err) {
            console.log(err);
        } else {
            res.json(r[0]); 
        }
    });

});

router.post('/addNewComment',function(req, res, next) {
	var uid=req.body.uid;
	var comment=req.body.comment;
	var aid=req.body.aid;
	var query = {
        sql: 'call usp_addNewComment(?,?,?)',
        values: [uid, aid,comment]
    }
    mysql(query, function(err, r) {
        if (err) {
            console.log(err);
        } else {
            res.json(r[0]); 
        }
    });

});

router.post('/deleteComment',function(req, res, next) {
	var cid=req.body.cid;
	var query = {
        sql: 'call usp_deleteComment(?)',
        values: [cid]
    }
    mysql(query, function(err, r) {
        if (err) {
            console.log(err);
        } else {
            res.json(r); 
        }
    });

});

router.post('/editArticle',function(req, res, next) {
	var aid=req.body.aid;
	var query = {
        sql: 'call usp_editArticle(?)',
        values: [aid]
    }
    mysql(query, function(err, r) {
        if (err) {
            console.log(err);
        } else {
            res.json(r[0]); 
        }
    });

});

router.post('/editPost',function(req, res, next) {
	var eaid=req.body.eaid;
	var esubject=req.body.esubject;
	var econtent=req.body.econtent;
	var query = {
        sql: 'call usp_editPost(?,?,?,?)',
        values: [req.session.uid, esubject, econtent,eaid]
    }
    mysql(query, function(err, r) {
        if (err) {
            console.log(err);
            res.redirect('/users/home');
        } else {
             res.redirect('/users/home?msg=1');
        }
    });

});

router.post('/deleteArticle',function(req, res, next) {
	var aid=req.body.aid;
	var query = {
        sql: 'call usp_deleteArticle(?)',
        values: [aid]
    }
    mysql(query, function(err, r) {
        if (err) {
            console.log(err);
        } else {
            res.json(r); 
        }
    });

});


router.get('/logout', function(req, res, next) {
    req.session.destroy();
    res.redirect('/');
});

router.post('/changeCommentLikeStatus',function(req, res, next) {
    var uid=req.body.uid;
    var flag=req.body.flag;
    var aid=req.body.aid;
    var cid=req.body.cid;

    var query = {
        sql: 'call usp_changeCommentLikeStatus(?,?,?,?)',
        values: [uid, flag, aid,cid]
    }
    mysql(query, function(err, r) {
        if (err) {
            console.log(err);
        } else {
            res.json(r[0]); 
        }
    });

});



module.exports = router;