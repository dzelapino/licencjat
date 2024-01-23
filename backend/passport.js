const passport = require('passport');
const User = require('./models/User');
const JwtStrategy = require('passport-jwt').Strategy;
const LocalStrategy  = require('passport-local').Strategy;
require("dotenv").config();

const secret = process.env.SECRET_KEY || "guest"
const cookieExtractor = req => {
    let token = null;
    if(req && req.cookies) {
        token = req.cookies["access_token"];
    }
    return token;
}

passport.use(new JwtStrategy({
    jwtFromRequest: cookieExtractor,
    secretOrKey: secret
}, (payload, done) => {
    console.log(payload.sub)
    User.findById({_id: payload.sub.id}, (err, user) => {
        if(err) return done(err, false)
        if(user) return done(null, user)
        else return done(null, false)
    })
}))


passport.use(new LocalStrategy((username, password, done) => {
    User.findOne({username}, (err, user) => {
        if(err) return done(err)
        if(!user) return done(null, false)
        user.comparePassword(password, done)
    })
}))