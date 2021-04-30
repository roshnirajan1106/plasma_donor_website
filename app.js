const express = require('express')
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const ejs = require("ejs");
const app = express();
const https = require("https");
const qs = require("querystring");
const checksum_lib = require("./public/Paytm/checksum");
const config = require("./public/Paytm/config");
app.set('view engine', 'ejs');
var list = [];
var val = "";
var login_details;
var login_title = "";
//const socketio= require('socket.io')
//const nexmo= require('nexmo');
const nodemailer = require('nodemailer')
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static("public"));

const parseUrl = express.urlencoded({ extended: false });
const parseJson = express.json({ extended: false });

mongoose.connect("mongodb+srv://admin-roshni:qwertyuiop@cluster0.b4nis.mongodb.net/register", {
  useNewUrlParser: true,
  useUnifiedTopology: true
});
const donorSchema = new mongoose.Schema({
  name: String,
  phone: Number,
  email: String,
  bloodGroup: String,
  location: String,
  date: String,
  accepted: String,
  requested: Number,
  email_patient: String,
});
var patient_title = "We are doing our level best to find matching donors in your city. This form will only take you a minute to complete.Well take it from there and will alert you when we find a suitable match for your blood group.";
var patient_title1 = "                        Please Scroll down to see the result!";

var title = " Dear Donor,We’re truly grateful for your relentless service to humanity.We promise to get your plasma matched with a patient in need as early as possible. In the meanwhile, kindly fill in the details below so we can speed up the process of matching you to a patient."

const patientSchema = new mongoose.Schema({
  name: String,
  age: Number,
  phone: Number,
  email: String,
  bloodGroup: String,
  lab: String,
  doctor: String,
  location: String,

});

const Donor = mongoose.model("Donor", donorSchema);

const Patient = mongoose.model("Patient", patientSchema);





app.get("/", function(req, res) {

  // Donor.countDocuments({}, function(err, donors) {
  //   if (err) {
  //     console.log(err)
  //   } else {
  //     Patient.countDocuments({}, function(err1, patients) {
  //
  //       res.render('index', {
  //         count: donors,
  //         count1: patients
  //         count2:
  //       });
  //     })
  //   }
  // });
  Donor.countDocuments({}, function(err, donors) {
    if (err) {
      console.log(err)
    } else {
      Patient.countDocuments({}, function(err1, patients) {
        if (err1) {
          console.log(err1);
        } else {
          Donor.countDocuments({
            accepted: "yes"
          }, function(err, donor_aa) {
            res.render('index', {
              count: donors,
              count1: patients,
              count2: donor_aa,
            });
          });
        }
      });
    }

  });

});
app.get("/contribute", function(req, res) {
  res.sendFile(__dirname + "/contribute.html");
});
app.get("/request", function(req, res) {


});
app.get("/blog", function(req, res) {
  res.sendFile(__dirname + "/blog.html");
});
app.get("/about", function(req, res) {
  res.sendFile(__dirname + "/about.html");
});
app.get("/contact", function(req, res) {
  res.sendFile(__dirname + "/contact.html");
})
app.get("/faq", function(req, res) {
  res.sendFile(__dirname + "/faq.html");
})
app.get("/patient", function(req, res) {

  res.render("patient", {
    list: list,
    patient_title: patient_title
  });
});
app.get("/thank", function(req, res) {

  res.redirect("/");
})
app.get("/donor", function(req, res) {

  res.render("donor", {
    title: title
  });
});
app.post("/thank", function(req, res) {
  val = req.body.get_the_id;
  console.log(val);
  console.log(list[list.length - 1].email);
  Donor.updateOne({
    email: val
  }, {
    requested: 1,
    email_patient: list[list.length - 1].email
  }, function(err) {
    if (err)
      console.log(error);
    else
      console.log("Sucess!");
  })


  var transporter = nodemailer.createTransport({
    service: 'gmail',
    port: 465 || 587,
    auth: {
      user: 'roshnirajan8888@gmail.com',
      pass: 'guten@gmail1106'
    }
  });
  var message = 'Dear Donor! . Thank you for choosing out website to contribute towards humanity! \n In this tough times only certain people come forward ' +
    'and be a Hero .\n  A Reciptent has 3..ed your plasma !\n If you still wish to donate please contact at \n Email : ' +
    list[list.length - 1].email + ' \n Phone Number : ' + list[list.length - 1].phone +
    ' \n Please Login to accept the request ' +
    ' \n Thank you';

  var mailOptions = {
    from: 'roshnirajan8888@gmail.com',
    to: val,
    subject: 'Paitent Waiting for you!',
    text: message,
  };


  transporter.sendMail(mailOptions, function(error, info) {
    if (error) {
      console.log(error);
    } else {
      console.log('Email sent: ' + info.response);
    }
  });







  patient_title3 = "  Dear Patient we've informed donor to contact you! Be strong You can fight this :)"
  res.render("patient", {
    list: list,
    patient_title: patient_title3
  });
});
app.post("/donor", function(req, res) {
  console.log("hi!");
  var name = req.body.firstname;
  var age = req.body.age;
  var email = req.body.email;
  var location = req.body.location;
  var bloodGroup = req.body.bloodGroup;
  var gender = req.body.gender;
  var phone = req.body.phone;
  var was_covid = req.body.a;
  var is_anaemic = req.body.b;
  var was_inf = req.body.c;
  var covid_positive = req.body.d;
  var birthday = req.body.birthday;
  console.log(birthday);
  var covid_days = Number(req.body.e);


  var to_take = "";
  if (age > 18) {
    if (is_anaemic === "yes" || was_inf === "yes") {
      to_take = "no";
    } else {
      if (was_covid === "YES" || covid_positive === "YES") {
        console.log("here covid");
        if (covid_days > 14)
          to_take = "yes";
        else
          to_take = "no"
      } else {
        to_take = "yes";
      }
    }
  } else {
    to_take = "no";
  }

  if (to_take == "yes") {
    console.log("critea matching");
    const item = new Donor({
      name: name,
      phone: phone,
      email: email,
      bloodGroup: bloodGroup,
      location: location,
      date: birthday,
      accepted: "no",
      requested: 0,
      email_patient: "r",
    });
    item.save();
    title = "Dear donor , Thank you so much! . You meet our criteria . We will contact you once we found your match"

  } else {
    title = " Dear Donor , we Appreciate your initative but you dont meet our criterea to donate.Have a good day!"
    console.log("criteria not match");

  }
  res.render("donor", {
    title: title
  });

  //console.log(name +" " +covid_days+" " +covid_positive+" " +phone+" " +is_anaemic);


});
app.get("/loginL", function(req, res) {
  login_title = "";
  res.render("loginL", {
    login_title1: login_title
  });
});
app.post("/loginL", function(req, res) {
  var phone = req.body.phone;
  var birthday = req.body.birthday;
  console.log(birthday);
  Donor.find({
    phone: phone
  }, function(err, item) {
    console.log(item);
    // for(var i=0;i<item.length ;i++)
    // {
    if (item[0].date == birthday) {
      login_details = phone;
      Donor.find({
        phone: login_details
      }, function(err, item) {
        console.log("Inside!" + item);
        console.log(item[0].requested);
        if (item[0].requested === 0) {
          console.log("Inside No");
          var request_title = "No one has requested you yet!!";
          res.render('request', {
            request_title: request_title
          });
        } else {
          console.log("Inside Yes");
          var request_title = "Accept The request";
          res.render('request', {
            request_title: request_title
          });
        }

      });

    }
    // }
    else {
      login_title = "Password Incorrect . Don't forget to put '-' between mm,dd,yyyy";
      res.render("loginL", {
        login_title1: login_title
      });

    }

  });
});
app.post("/request", function(req, res) {
  var req_title = req.body.req_title;
  if (req_title === "No one has requested you yet!!")
    res.redirect("/");


  else {
    Donor.updateOne({
      phone: login_details
    }, {
      accepted: "yes"
    }, function(err) {
      if (err)
        console.log(err);
      else
        console.log("successssssssssss!");
    });




    Donor.find({
      phone: login_details
    }, function(req, item) {
      var transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: 'roshnirajan8888@gmail.com',
          pass: 'guten@gmail1106'
        }
      });
      var message = 'Accepted hooray!';

      var mailOptions = {
        from: 'roshnirajan8888@gmail.com',
        to: item[0].email_patient,
        subject: 'Paitent Waiting for you!',
        text: message,
      };


      transporter.sendMail(mailOptions, function(error, info) {
        if (error) {
          console.log(error);
        } else {
          console.log('Email sent: ' + info.response);
        }
      });


    });


    res.redirect("/");
  }
});
    app.post("/patient", function(req, res) {
      const firstname = req.body.firstname;
      const age = req.body.age;
      const email = req.body.email;

      const location = req.body.location;
      const bloodGroup = req.body.bloodGroup;
      const gender = req.body.gender;
      const phone = req.body.phone;
      const lab = req.body.a;
      const doctor = req.body.b;
      const item = new Patient({
        name: firstname,
        age: age,
        phone: phone,
        email: email,
        bloodGroup: bloodGroup,
        location: location,
        lab: lab,
        doctor: doctor
      });
      item.save();
      //var patient_item =[firstname,age,phone,email,bloodGroup,location,lab,doctor];
      console.log("hi");
      Donor.find({
        location: location,
        bloodGroup: bloodGroup
      }, function(err, flist) {
        //console.log(list);
        if (flist.length === 0) {
          patient_title2 = "Sorry Sir/Ma'am We don't have donors matching Your bloodGroup Please try again in 2-3 days";
          res.render("patient", {
            list: flist,
            patient_title: patient_title2
          });
        } else {
          flist.push(item);
          list = flist;
          console.log(flist);

          res.render("patient", {
            list: flist,
            patient_title: patient_title1
          });
        }
      });
    });
app.get("/donatation",function(req,res)
{
  res.sendFile(__dirname +"/donation.html");
});
app.get("/donation",function(req,res)
{
  res.sendFile(__dirname +"/donation.html");
});
app.get("/paytm", (req, res) => {
  res.sendFile(__dirname + "/paytm.html");
});
app.post("/paynow", [parseUrl, parseJson], (req, res) => {
    // Route for making payment

    var paymentDetails = {
      amount: req.body.amount,
    //  customerId: req.body.name,
      customerEmail: req.body.email,
      customerPhone: req.body.phone
  }
  if(!paymentDetails.amount ||  !paymentDetails.customerEmail || !paymentDetails.customerPhone) {
      res.status(400).send('Payment failed')
  } else {
      var params = {};
      params['MID'] = config.PaytmConfig.mid;
      params['WEBSITE'] = config.PaytmConfig.website;
      params['CHANNEL_ID'] = 'WEB';
      params['INDUSTRY_TYPE_ID'] = 'Retail';
      params['ORDER_ID'] = 'TEST_'  + new Date().getTime();
      params['CUST_ID'] = 'Customer001';
      params['TXN_AMOUNT'] = paymentDetails.amount;
      // port=process.env.PORT || 3000;
      params['CALLBACK_URL'] = 'http://localhost:3000/callback';
      params['EMAIL'] = paymentDetails.customerEmail;
      params['MOBILE_NO'] = paymentDetails.customerPhone;


      checksum_lib.genchecksum(params, config.PaytmConfig.key, function (err, checksum) {
          var txn_url = "https://securegw-stage.paytm.in/theia/processTransaction"; // for staging
          // var txn_url = "https://securegw.paytm.in/theia/processTransaction"; // for production

          var form_fields = "";
          for (var x in params) {
              form_fields += "<input type='hidden' name='" + x + "' value='" + params[x] + "' >";
          }
          form_fields += "<input type='hidden' name='CHECKSUMHASH' value='" + checksum + "' >";

          res.writeHead(200, { 'Content-Type': 'text/html' });
          res.write('<html><head><title>Merchant Checkout Page</title></head><body><center><h1>Please do not refresh this page...</h1></center><form method="post" action="' + txn_url + '" name="f1">' + form_fields + '</form><script type="text/javascript">document.f1.submit();</script></body></html>');
          res.end();
      });
  }
  });

  app.post("/callback", (req, res) => {
    // Route for verifiying payment

    var body = '';

    req.on('data', function (data) {
       body += data;
    });
      console.log(body);
     req.on('end', function () {
       var html = "";
       var post_data = qs.parse(body);

       // received params in callback
       console.log('Callback Response: ', post_data, "\n");

       console.log(1);

       // verify the checksum
       var checksumhash = post_data.CHECKSUMHASH;
       // delete post_data.CHECKSUMHASH;
       var result = checksum_lib.verifychecksum(post_data, config.PaytmConfig.key, checksumhash);
       console.log("Checksum Result => ", result, "\n");
       console.log(1);


       // Send Server-to-Server request to verify Order Status
       var params = {"MID": config.PaytmConfig.mid, "ORDERID": post_data.ORDERID};

       checksum_lib.genchecksum(params, config.PaytmConfig.key, function (err, checksum) {
         console.log(1);

         params.CHECKSUMHASH = checksum;
         post_data = 'JsonData='+JSON.stringify(params);

         var options = {
           hostname: 'securegw-stage.paytm.in', // for staging
           // hostname: 'securegw.paytm.in', // for production
           port: 443,
           path: '/merchant-status/getTxnStatus',
           method: 'POST',
           headers: {
             'Content-Type': 'application/x-www-form-urlencoded',
             'Content-Length': post_data.length
           }
         };
         console.log("setting up request");


         // Set up the request
         var response = "";
         var post_req = https.request(options, function(post_res) {
           post_res.on('data', function (chunk) {
             response += chunk;
           });

           post_res.on('end', function(){
             console.log('S2S Response: ', response, "\n");

             var _result = JSON.parse(response);
             console.log(_result.STATUS);
               if(_result.STATUS == 'TXN_SUCCESS') {
                   res.send('payment sucess')
               }else {
                   res.send('payment failed')
               }
             });
         });

         // post the data
         post_req.write(post_data);
         post_req.end();
        });
       });
  });
app.listen(process.env.PORT || 3000, function() {
  console.log("Up and running");
});
