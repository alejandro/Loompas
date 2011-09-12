var url = require("url");
var express = require("express");
var https = require("https");
var server = express.createServer();

function getContent(options, callback) {
	var req = https.request(options, function(res) {
		var body = "";
		res.on('data', function (chunk) {
			body += chunk;
		});

		res.on('end', function() {
			callback(body);
		});
	});

	req.end();
}
var appId = "TU_APP_ID";
    var appSecret = "TU_APP_SECRET_ID";
    var myUrl = "http://localhost:3000/fbauth";

	var code;

server.get("/fbauth", function(req, res) {
	code = url.parse(req.url, true).query.code;

    if(!code) {
        var dialogUrl = "http://www.facebook.com/dialog/oauth?client_id=" + appId + "&redirect_uri=" + myUrl + "&scope=email,read_stream"; // Permisos para acceder a los datos
        res.redirect(dialogUrl);
		return;
    }

    var tokenUrl = {
		host: "graph.facebook.com",
		method: "GET",
		path: "/oauth/access_token?client_id=" + appId + "&redirect_uri=" + myUrl + "&client_secret=" + appSecret + "&code=" + code
	}

    getContent(tokenUrl, function(token) {
		var graphUrl = {
			host: "graph.facebook.com",
			method: "GET",
			path: "/me?" + token
		};

		getContent(graphUrl, function(user) {
			user = (user) ? JSON.parse(user) : {}; 
			var photo = user.id;		
			photo = "http://graph.facebook.com/" + photo + "/picture";
			res.send("Hello <a href='" + user.link + "'>" + user.name + "</a><br /><img src='" + photo + "' title='Este eres tu'><br /><p>Quieres ver tus 'Wall Post'?<a href='/wallpost'>[aqui]</a></p><br /><p></p>");
			console.log("El Usuario: " + user.name + " se ha Logeado" )
		})
		
	});
});
server.get("/", function(req, res){
	console.log("Still Alive")
});
server.get("/wallpost", function(req,res){
	myURL = "http://localhost:3000/wallpost";
	if(!code) {
        var dialogUrl = "http://www.facebook.com/dialog/oauth?client_id=" + appId + "&redirect_uri=" + myUrl + "&scope=email,read_stream";
        res.redirect(dialogUrl);
		return;
    }


    var tokenUrl = {
		host: "graph.facebook.com",
		method: "GET",
		path: "/oauth/access_token?client_id=" + appId + "&redirect_uri=" + myUrl + "&client_secret=" + appSecret + "&code=" + code
	}

    getContent(tokenUrl, function(token) {
		var graphUrl = {
			host: "graph.facebook.com",
			method: "GET",
			path: "/me/feed?" + token
		};

		getContent(graphUrl, function(user) {
			user = (user) ? JSON.parse(user) : {}; 
			if (!user.error) {
				res.send(" <p>loading...</p><br /><p>" + token + "</p>");
				var id = user.id;
				for (id in user) {
					res.send("<p>" + user.name + " wrote: </p><br /><p>" + user.message + "</p>\n");	
				}
				//user.forEach(user.id, function(){
				//	res.send("<p>" + user.from.name + " wrote: </p><br /><p>" + user.message + "</p>");
				//	req.end();
				// });
				
				console.log("Post cargados..." )
			} else {
				res.send("Ups! \n Actualice por favore");
				console.log("ERROR tratando de obtener wall posts!");
				req.end();
			}
			
		})
		
	});
});
server.listen(3000);
console.log("Servidor en http://localhost:" + server.address().port);
