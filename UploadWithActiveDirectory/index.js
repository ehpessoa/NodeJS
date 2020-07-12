// define libraries
var express = require('express')
var bodyParser = require("body-parser");
var expressLayouts = require('express-ejs-layouts');
var activedirectory = require('activedirectory')
var path = require('path');
var log = require('log-to-file');
var multer = require('multer');

// create app and define layouts
var app = express()
var authenticated = false;
var givenName = "unknown";
var fileUploaded = "filename";

app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.set('layout extractScripts', true)
app.set('layout extractStyles', true)

var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, __dirname + '/public');
    },
    filename: function (req, file, cb) {
		fileUploaded = file.originalname;
		cb(null, file.originalname);
    }
});
var upload = multer({
    storage: storage
});

// redirect depending on user status
app.get('/', function (req, res) { 

	if ( !authenticated ) {
		res.render('login', {status: 'no'});
	} else {
		res.render('upload', {status: givenName});
	}		
})

// process the upload of file
app.post('/upload', upload.single('upload'), (req, res, next) => {

	if ( !authenticated ) {
		res.render('login', {status: 'no'});
	} else {
		var file = req.protocol + '://' + req.hostname + ':3000' + '/' + fileUploaded;
		res.render('sucess', {status: file});
	}
});

// process the authetication
app.post('/',function(req, res){

	var sAMAccountName=req.body.user;
	var userPrincipalName = sAMAccountName + "@ehpessoa.com";
	var password=req.body.pass;	
	var posted=false;
	
	// Authenticate the user into Active Diretory
	var config = {
		url: "ldap://ehpessoa.com",
		baseDN: "DC=ehpessoa,DC=com",
		username: userPrincipalName,
		password: password }
	var ad = new activedirectory(config);
	
	// Find attributes of autheticated user
	ad.findUser(sAMAccountName, function(err, user) {
	
		// Make sure the request won't be re-posted
		if (posted)
			return;  
		else posted=true;	
		
		if (err) {
			log(sAMAccountName + ': error authenticating the user!');
			res.render('error', {status: "no"});	
		} else {		
			var usr=JSON.parse(JSON.stringify(user));
			authenticated = true;
			givenName = usr.givenName;
			log('user logged into system: display name, ' + usr.displayName + ', email ' + usr.mail);			
			log('redirecting to upload page');
			res.render('upload', {status: givenName});
		}
		
	});
});

// Start Server
app.listen(3000, function () {
  console.log('app listening on port 3000!');
  log('app started at port 3000');
});

