/**
 * Created by olyjosh on 29/06/2017.
 */

var sender = 'smtps://ahmad.iswandi1703%40gmail.com'   // The emailto use in sending the email
//(Change the @ symbol to %40 or do a url encoding )
var password = 'A_ku@#_(inta'  // password of the email to use

var nodeMailer = require("nodemailer");
var emailTemplates = require('email-templates');

var path = require('path');
var config = require('./configg.js');
var templatesDir = path.resolve(__dirname, '.', 'views/email');
var transporter = nodeMailer.createTransport({
  service:"Gmail",
    tls: {
        rejectUnauthorized: false
    },
  auth: {
    user: config.mailer.auth.user,
    pass: config.mailer.auth.pass
  }
});

// create template based sender function
// assumes text.{ext} and html.{ext} in template/directory
var sendResetPasswordLink = transporter;
exports.sendPasswordReset = function (email, data,fn) {
    // transporter.template
  emailTemplates(templatesDir, function (err, template) {

      var locals = {
        email: 'ahmad.iswandi1703@gmail.com',
        subject: 'Invoice',
        name: 'Forgetful User',
        resetUrl: 'http;//localhost:3000/password_rest/000000000001|afdaevdae353',
        names: "name",
        username: "username",
        token: "tokenUrl",
        data:data,
        views: {
          options: {
            extension: 'ejs' // <---- HERE
          }
        }
      };
    // Send a single email
    template("password_reset", locals,function (err, html, text) {
      // if (err) {
      //   //console.log(err);
      //   return fn(err);
      // }
      // console.log(html);
      // // if we are testing don't send out an email instead return
      // // success and the html and txt strings for inspection
      // if (process.env.NODE_ENV === 'test') {
      //   return fn(null, '250 2.0.0 OK 1350452502 s5sm19782310obo.10', html, text);
      // }
    
      transporter.sendMail({
        from: config.mailer.defaultFromAddress,
        to: email,
        subject: "Invoice",
        html: html,
        // generateTextFromHTML: true,
        text: text
      }, function (err, responseStatus) {
        console.log(err);
        if (err) {
          return fn(err);
        }
        return fn(null, responseStatus.message, html, text);
      });
    });
  });

};