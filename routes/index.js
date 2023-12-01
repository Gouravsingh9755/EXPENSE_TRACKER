var express = require('express');
var router = express.Router();
const User = require("../models/userModel")
const passport = require("passport")
const localStrategy = require("passport-local")
const Expense = require("../models/expenseModel")

const {sendmail} = require("../utils/sendmail")

passport.use(new localStrategy(User.authenticate()))


/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', {admin:req.user});
});
/* GET home page. */



/* -----------------------signup---get---------------------- page. */
router.get('/signup', function(req, res, next) {
  res.render('signup', {admin:req.user});
});
router.post('/signup',async function(req, res, next) {

  try {

    await User.register(
      {username: req.body.username, email: req.body.email },
      req.body.password
    );
    res.redirect('/');

  } catch (error) {
    console.log(error);
    res.send(error);
  }
});
/* -----------------------signup------------------------- page. */

/* -----------------------signin------------------------- page. */
router.get('/signin', function(req, res, next) {
  res.render('signin', {admin:req.user});
});

router.post('/signin', 
  
  passport.authenticate("local",{
    successRedirect: "/profile",
    failureRedirect:"/",
    
  }),
  function (req, res, next) {}
);

/* -----------------------signin------------------------- page. */
/* -----------------------isloggedin--middlewhere----------------------- page. */

function isloggedin (req, res, next){
  if(req.isAuthenticated()){
    next()
  }else{
    res.redirect("/signin")
  }
}

/* -----------------------isloggedin--middlewhere----------------------- page. */

/* -----------------------profile------------------------- page. */

router.get('/profile', isloggedin, async function (req, res, next) {

  try {
    const {expenses} = await req.user.populate("expenses")

    console.log(req.user, expenses)

    res.render("profile", {admin: req.user, expenses})
    
  } catch (error) {
    console.log(error);
  }

});

/* -----------------------profile------------------------- page. */

/* -----------------------forget--------------------- page. */

router.get('/forget', function(req, res, next) {
  res.render('forget');
});

router.post('/sendmail', async function(req, res, next) {

  try {

    const user = await User.findOne({email:req.body.email})

    if(!user)return res.send ("user not found! <a herf= '/forget'> TRY AGAIN </a>")

    sendmail(user.email, user, res, req)

  } catch (error) {
    console.log(error);
  }

});

router.post('/forget/:id', async function(req, res, next) {

  try {
    const user = await User.findById(req.params.id) 

    if(!user)return res.send("user not found! <a herf= '/forget'> TRY AGAIN </a>")

    if(user.token == req.body.token){
      user.token = -1
      await user.setPassword(req.body.newpassword)
      await user.save()
      res.redirect("/")
    }

    else{
       user.token = -1
       await user.save()
       res.send("invalid token! <a herf= '/forget'> TRY AGAIN </a>")
    }

    
  } catch (error) {
    console.log(error);
  }

});




/* -----------------------forget--------------------- page. */



module.exports = router;
