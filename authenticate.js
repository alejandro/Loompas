Site.prototype.authenticated = function(req, res, next) {
    if (req.session.oauth) {
        req.session.oauth.verifier = req.query.oauth_verifier;
        var oauth = req.session.oauth;
 
        oa.getOAuthAccessToken(oauth.token, oauth.token_secret, oauth.verifier,
                function(error, oauth_access_token, oauth_access_token_secret, results) {
                    if (error) new Error(error);
                    req.session.user = {name:results.screen_name};
                    res.redirect("/");
                }
                );
    } else {
        next(new Error('No OAuth se guardo información de la session. Como llegaste aqui?'));
    }
};
 
Site.prototype.authenticate = function(req, res) {
    var sys = require('sys');
    var OAuth = require('oauth').OAuth;
    oa = new OAuth("https://api.twitter.com/oauth/request_token",
            "https://api.twitter.com/oauth/access_token",
            consumer_key, consumer_secret,
            "1.0A", host + "/authenticated", "HMAC-SHA1");
    req.session.oauth = oa;
 
    oa.getOAuthRequestToken(function(error, oauth_token, oauth_token_secret, results) {
        if (error) new Error(error.data);
        else {
            req.session.oauth.token = oauth_token;
            req.session.oauth.token_secret = oauth_token_secret;
            res.redirect('https://api.twitter.com/oauth/authenticate?oauth_token=' + oauth_token);
        }
    });
};