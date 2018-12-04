'use strict';
var salam=require('./intents/order_paper_bag.js');
var defaults=require('./intents/default_fallback_intent.js');
var terimakasih=require('./intents/thank-you.js');
var pengiriman=require('./intents/pengiriman.js');
var bank=require('./intents/bank.js');
const 
  bodyParser = require('body-parser'),
  crypto = require('crypto'),
  config = require('config'),
  express = require('express'),
  https = require('https'),  
  request = require('request'),
  nlp = require('apiai');
// Get content from file
 var fs = require('fs');

const web_services=require('./module/api_access_function.js');

var admin = require("firebase-admin");

var serviceAccount = require("./hdkrasi-firebase-adminsdk-fnk3k-f49de51b11.json");
var cheerio=require('cheerio');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://hdkrasi.firebaseio.com"
});






const INTENTS={
  'welcom-message':'getGreetings'
}
var app = express();



app.set('port', (process.env.PORT || 5000));
app.use(express.static(__dirname + '/public'));
app.use(bodyParser.json({ extended: false }));


// var http=require('http');
// var server = http.Server(app);

var server=app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));

  

});

 var io = require('socket.io').listen(server);

io.on('connection', function(socket){
  console.log(socket.connected);
  console.log("connect");

  //cek apakah ada notifikasi yang belum terkirim, jika terdapat maka
  io.on('reconnect', function() {

    //Avoid that buffered emits getting send again
    io.sendBuffer=[];
  });
});

io.on('disconnect',function(){
  console.log('disconnect');
})




// App Secret can be retrieved from the App Dashboard
const APP_SECRET = (process.env.MESSENGER_APP_SECRET) ? 
  process.env.MESSENGER_APP_SECRET :
  config.get('appSecret');

// Arbitrary value used to validate a webhook
const VALIDATION_TOKEN = (process.env.MESSENGER_VALIDATION_TOKEN) ?
  (process.env.MESSENGER_VALIDATION_TOKEN) :
  config.get('validationToken');

// Generate a page access token for your page from the App Dashboard
const PAGE_ACCESS_TOKEN = (process.env.MESSENGER_PAGE_ACCESS_TOKEN) ?
  (process.env.MESSENGER_PAGE_ACCESS_TOKEN) :
  config.get('pageAccessToken');

// URL where the app is running (include protocol). Used to point to scripts and 
// assets located at this address. 
const API_URL=(process.env.API_URL)?
  (process.env.API_URL):config.get('apiUrl');
const SERVER_URL = (process.env.SERVER_URL) ?
  (process.env.SERVER_URL) :
  config.get('serverURL');

if (!(APP_SECRET && VALIDATION_TOKEN && PAGE_ACCESS_TOKEN && SERVER_URL)) {
  console.error("Missing config values");
  process.exit(1);
}


// views is directory for all template files
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

app.get('/', function(request, response) {
  response.render('pages/index');

});

app.get('/try',function(request,response){
  // function doStuff() {
  //     console.log("asdfasdfadsf");
  // }
  // var myTimer = setTimeout(doStuff, 5000);
  // response.render('asdfasdf');

  io.emit('notif pembayaran',{"orderNumber":"02932093",'keterangan':'20000'});
  io.emit('notif people',"ahmad");



  response.sendFile(__dirname + '/index.html');
})

//scrapping harga tas kertas com
app.get('/scrapping',function(req,res){
    // var urls="http://hargataskertas.com/hargataskertas";
    // var formData={panjang:'20',lebar:'20',tinggi:'10',bahan:'1',warna:'5'};

    // request.post({url:urls, formData: formData}, function optionalCallback(err, httpResponse, body) {
    //   if (err) {
    //     return console.error('upload failed:', err);
    //   }
    //   res.send(httpResponse);
    // });
    var headers = {
        'User-Agent':       'Super Agent/0.0.1',
        'Content-Type':     'application/x-www-form-urlencoded'
    }

    // Configure the request
    var options = {
        url: 'http://hargataskertas.com/hargataskertas',
        method: 'POST',
        headers: headers,
        form: {'panjang':'30','lebar':'30','tinggi':'30','bahan':'5','warna':'5'}
    }

    // Start the request
    request(options, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            // Print out the response body


            var $ = cheerio.load(body);
          var dataHarga='';

            $('#pesan_form').filter(function(){
              var data = $(this);
              var title = data.children().first().text();
              console.log(title.search("Harga"));

              var indexHarga=title.search("Harga");
              var note=title.search("Note");


              var getHarga=title.substr(indexHarga+5,note);

              var harga=getHarga.match(/Rp [0-9]+.[0-9]+/g);
              console.log(harga);

              dataHarga=harga[0];
            })
            res.json(dataHarga);
            
        }
    })

})

//coba firebase cloud messaging
app.get('/tryToSendMessageToClient',function(req,res){
  // This registration token comes from the client FCM SDKs.
      var registrationToken = "bk3RNwTe3H0:CI2k_HHwgIpoDKCIZvvDMExUdFQ3P1...";

      // See the "Defining the message payload" section below for details
      // on how to define a message payload.
      var payload = {
        data: {
          score: "850",
          time: "2:45"
        }
      };

      // Send a message to the device corresponding to the provided
      // registration token.
      admin.messaging().sendToDevice(registrationToken, payload)
        .then(function(response) {
          // See the MessagingDevicesResponse reference documentation for
          // the contents of response.
          console.log("Successfully sent message:", response);
        })
        .catch(function(error) {
          console.log("Error sending message:", error);
        });

})
app.get('/customerDetail',function(req,res){
  var messengerID=req.query.messengerID;
     var auth = "Basic " + new Buffer('admin' + ":" + '1234').toString("base64");

 
    var options = {
      url: config.get('apiUrl')+'/customers/customer_services?messengerID='+messengerID,
      headers: {
        "Authorization" : auth,
        "content-type":"application/json"
      }
      // form:parameter
    };


    request.get(options, function(error,response,body){
      if (!error && response.statusCode == 200) {
        var info = JSON.parse(body);
        console.log("coba",body);

        //dummy data
        // console.log(info);
      
        res.json(info);
     
      }else{
          
        res.json({"status":"nothing"});
      }
    });
});

app.get('/customerDetailEmail',function(req,res){
  var email=req.query.email;
     var auth = "Basic " + new Buffer('admin' + ":" + '1234').toString("base64");

 
    var options = {
      url: config.get('apiUrl')+'/customers/customer_servicesEmail?email='+email,
      headers: {
        "Authorization" : auth,
        "content-type":"application/json"
      }
      // form:parameter
    };


    request.get(options, function(error,response,body){
      if (!error && response.statusCode == 200) {
        var info = JSON.parse(body);
        console.log("coba",body);

        //dummy data
        // console.log(info);
      
        res.json(info);
     
      }else{
          
        res.json({"status":"nothing"});
      }
    });
})

app.post('/sendProfile',function(req,res){
  var forms=req.body;
     var auth = "Basic " + new Buffer('admin' + ":" + '1234').toString("base64");

 
    var options = {
      url: config.get('apiUrl')+'/customers/customer_services',
      headers: {
        "Authorization" : auth,
        "content-type":"application/json"
      },
      form:forms
    };


    request.post(options, function(error,response,body){
      if (!error && response.statusCode == 200) {
        var info = JSON.parse(body);
        
        if(info.status==="Success"){
          io.emit('notif people',"ahmad");
        }
        res.json(info);
     
      }else{  
    
          
        res.json({"status":"nothing"});
      }
    });
 
})
// app.get('/try',function(request,response){
// const app = nlp("ee4b10fce9a845419f72802b05ac8257");
//  var responses = app.textRequest("hai", {
//       sessionId: 'test_session'
//   });


//   responses.on('response',(responsed)=>{
//     let aiText = responsed.result.fulfillment.speech;
//     console.log(responsed);
//       response.send(aiText);
//   })

//   responses.on('error',(error)=>{
//     console.log(error);
//   })

//   responses.end();



//  console.log(request);
// })

// app.post('/try',callback);

// function callback(request,response){
//  console.log(request);
//  response.send("haii");
// }


app.post('/ai', (req, res) => {
  console.log('*** Webhook for api.ai query ***');
  console.log(req.body.result);

  let msg="hai";
  if (req.body.result.metadata.intentName === 'welcom-message') {
        return res.json({
          speech: msg,
          displayText: msg,
          source: 'welcom-message'
        });

  }else if(req.body.result.metadata.intentName=== 'tanya_pengiriman'){
    let msgs=pengiriman.getWord();
    return res.json({
      speech:msgs,
      displayText:msgs,
      source:'tanya_pengiriman'
    })
  }
  // else if(req.body.result.metadata.intentName==='cek_order yes'){
  //  return res.json({
  //     speech:'Aloha',
  //     displayText:'Aloha',
  //     source:'tanya_pengiriman',
  //     followupEvent: {
  //         name: 'nomor_order',
  //         data: {
  //            cek_order:'cek order yes'
  //         }
  //      }

  //   })
  // }

});
//1858555797503703


//for chatbot only
app.get('/kirimInvoice',(req,res)=>{
  var senderID=req.query['senderID'];

  var orderID=req.query['orderID'];

  console.log(senderID);
  var auth = "Basic " + new Buffer('admin' + ":" + '1234').toString("base64");
  // var parameter={'category':'paper_bag','panjang':'10','lebar':'20','tinggi':'10','cetak':'full_color'};

  //ubah ke order id
  // "68badc50f5cf261eead1ba4a86eb957d"
  web_services.getInvoice(orderID,function(data){

    sendTextMessage(senderID,"Hai ini invoice Anda dengan nomor pesanan: "+data.data.orderNumber);
    setTimeout(function di(){
        sendInvoiceMessage(senderID,data);
    },2000);
    setTimeout(function di(){
        sendTextMessage(senderID,"Silahkan mengkonfirmasi pembayaran dengan format 'konfirmasi pembayaran #nomorPesanan #jumlahTransfer'");
    },3000);
  
  });
  
  res.status(200).send({status:"oke"});
})

app.get('/sendNotification',(req,res)=>{
  var senderID=req.query['senderID'];

  var orderNumber=req.query['orderNumber'];
  var status=req.query['orderStatus'];
  sendTextMessage(senderID,"Hai, pesanan dengan nomor "+orderNumber+" berstatus: "+status);
  //kirim notifikasi tem pplate generic
  res.status(200).send({status:"oke"});

})

//let's rock to webhok :)
/*
 * Use your own validation token. Check that the token used in the Webhook 
 * setup is the same token used here.
 *
 */
app.get('/webhook', function(req, res) {
  if (req.query['hub.mode'] === 'subscribe' &&
      req.query['hub.verify_token'] === VALIDATION_TOKEN) {
    console.log("Validating webhook");
    res.status(200).send(req.query['hub.challenge']);
  } else {
    console.error("Failed validation. Make sure the validation tokens match.");
    res.sendStatus(403);          
  }  
});

var mailer=require('./mailer1.js');
app.get('/sendingEmail',function(req,res){

      // var locals = {
      //   email: 'ahmad.iswandi1703@gmail.com',
      //   subject: 'Password reset',
      //   name: 'Forgetful User',
      //   resetUrl: 'http;//localhost:3000/password_rest/000000000001|afdaevdae353',
      //   views: {
      //     options: {
      //       extension: 'ejs' // <---- HERE
      //     }
      //   }
      // };
      // mailer.sendOne('password_reset', locals, function (err, responseStatus, html, text) {
      // res.send(err)
      //   console.log(err);

      // });
    var orderID=req.query['orderID'];
    var email=req.query['email'];

    web_services.getInvoice(orderID,function(data){
      if(data!=null){
        mailer.sendPasswordReset(email, data.data, function (err, responseStatus, html, text) {
          if(!err){
             res.status(200).send({status:"oke"});
          }else{
             res.status(401).send({status:"gagal"});
          }
          
            // console.log(err);

        });
      }
    })


})

/*
 * All callbacks for Messenger are POST-ed. They will be sent to the same
 * webhook. Be sure to subscribe your app to your page to receive callbacks
 * for your page. 
 * https://developers.facebook.com/docs/messenger-platform/product-overview/setup#subscribe_app
 *
         if (messagingEvent.optin) {
          receivedAuthentication(messagingEvent);
        } else if (messagingEvent.message) {
          receivedMessage(messagingEvent);
        } else if (messagingEvent.delivery) {
          receivedDeliveryConfirmation(messagingEvent);
        } else if (messagingEvent.postback) {
          receivedPostback(messagingEvent);
        } else if (messagingEvent.read) {
          receivedMessageRead(messagingEvent);
        } else if (messagingEvent.account_linking) {
          receivedAccountLink(messagingEvent);
        }
 */
app.post('/webhook', function (req, res) {
  var data = req.body;

  // Make sure this is a page subscription
  if (data.object == 'page') {
    data.entry.forEach(function(pageEntry) {
      var pageID = pageEntry.id;
      var timeOfEvent = pageEntry.time;
      pageEntry.messaging.forEach(function(messagingEvent) {
        if (messagingEvent.optin) {
          receivedAuthentication(messagingEvent);
        } else if (messagingEvent.message) {
          receivedMessage(messagingEvent);
        } else if (messagingEvent.postback) {
          receivedPostback(messagingEvent);
        } else if (messagingEvent.read) {
          receivedMessageRead(messagingEvent);
        } else {
          console.log("Webhook received unknown messagingEvent: ", messagingEvent);
        }
        
      });
    });

    res.sendStatus(200);
  }
});


// app.post('/tries',function(req,res){
//  var identify=req.body.identify;
//  var json={"hai":"hai"};
//  console.log(identify[0]['name']);

//  identify.forEach(function(value){
//    console.log(value.name);
//  })


//  res.status(200).send(json);
//  console.log(identify);
// })
/*
 * This path is used for account linking. The account linking call-to-action
 * (sendAccountLinking) is pointed to this URL. 
 * 
 */


app.get('/authorize', function(req, res) {
  var accountLinkingToken = req.query.account_linking_token;
  var redirectURI = req.query.redirect_uri;

  // Authorization Code should be generated per user by the developer. This will 
  // be passed to the Account Linking callback.
  var authCode = "1234567890";

  // Redirect users to this URI on successful login
  var redirectURISuccess = redirectURI + "&authorization_code=" + authCode;

  res.render('authorize', {
    accountLinkingToken: accountLinkingToken,
    redirectURI: redirectURI,
    redirectURISuccess: redirectURISuccess
  });
});

/* fungsi ini digunakan untuk melakukan transaksi ke layanan apiai yang mengirimkan textrequest /query 
 * ke layanan apiai , dimana query tersebut diambil dari text yang diambil dari messenger yang dikirimakan oleh customer
 */

// function sendMessage(messagingEvent){
//   const app = nlp("05d144b084f14427b822f9f1d0dcb9cc");
//   let sender = messagingEvent.sender.id;
//   let text = messagingEvent.message.text;
 
//   var apiai = app.textRequest(text, {
//       sessionId: 'test_session'
//   });


//   apiai.on('response',(response)=>{
//     let aiText = response.result.fulfillment.speech;
//     let intent= response.result.metadata.intentName;
//     if(intent==="welcom-message"){

//     }
 
//   })

//   apiai.on('error',(error)=>{
//     console.log(error);
//   })

//   apiai.end();



// }



app.get('/to',function(req,res){
  // res.send(salam.getGreetings());
 
  // res.send(salam.getGreetings());
  // var auth = "Basic " + new Buffer('admin' + ":" + '1234').toString("base64");
  // var parameter={'category':'paper_bag','panjang':'10','lebar':'20','tinggi':'10','cetak':'full_color'};

  // web_services.getProdukData("68badc50f5cf261eead1ba4a86eb957d",function(data){
  //   // console.log("coba nih data",data);
  //   console.log(data);
  //   res.send(data);
  // });

      // var parts = "adsfasdfasf/20323".split("/");
      // res.send(parts);
      // console.log(parts[0]);
      // console.log(parts[1]);
      // if(parts[0]==="adsfasdfasf" && parts[1]!=''){
      //   console.log("okeee");
      // }else{
      //   console.log("fa;senderID");
      // }
      // if(parts.length!=0){
      //   console.log(parts[parts.length-1],parts.length);
      // }else{
      //   console.log(parts.length);
      // }
          // fs.readFile('./config/keranjang.json',{encoding: 'utf8'},function(err,data) {
          //   var data= JSON.parse(data);
          //    data.data.push({ 'senderID':"dfas",'productID':"sdfasdf",'qty':"",'uniqueID':"uniqueID"});
          //   var string = JSON.stringify(data,null,'\t');

          //   fs.writeFile('./config/keranjang.json',string,function(err) {
          //     if(err) return console.error(err);
          //     console.log('done');
          //   })  
          // })
            // fs.readFile('./config/keranjang.json',{encoding: 'utf8'},function(err,data) {
            //   var datas= JSON.parse(data);
        
            //   var i=0;
            //   for (var dataIndex in datas.data) {

            //      if (datas.data[dataIndex].uniqueID === 232323) {
        
            //         datas.data.splice(dataIndex,1);
            //      }

            //      i++;
            //   }
    
             
            //   var string = JSON.stringify(datas,null,'\t');
            //   fs.writeFile('./config/keranjang.json',string,function(err) {
            //     if(err) return console.error(err);
            //     console.log('done');
            //   })  
            // })
            // var collectData={"productID":"","messengerID":"","jumlahPesanan":""};
            // fs.readFile('./config/keranjang.json',{encoding: 'utf8'},function(err,data) {
            //   var datas=JSON.parse(data);

            //   for(var dataIndex in datas.data){
            //     collectData.productID="dfasdfasf";
            //     if (datas.data[dataIndex].uniqueID === 232323) {
            //       // console.log("asdfa");
            //       collectData={"productID":datas.data[dataIndex].productID,"messengerID":"sdaksfd","jumlahPesanan":"2323"};
            //     }
                
            //   }
            //   sendData(collectData,function(status,statement){
            //     if(status){
            //       console.log(status);

            //     }else{
            //      console.log(false);
            //     }
            //   })
            // })
            // var pro={'productID':'a845c7a11c87354548ba7476b6c2f7a9'};

            // getProdukDetail(pro,function(data){
            //   console.log(data[0].productID);
            // })

           
            // res.send("ok");
            // res.send("don");

            // web_services.cekOrder('201710120',function(data,status){
            //   if(status){
             
            //     res.send(data.orderStatus);
            //   }else{
            //     res.send("false");
            //   }
            // })

           // var collectData={"productID":"99b4b00210c8000cffffe0cecc7b400a","messengerID":"zero","jumlahPesanan":"1000"};

           // web_services.sendData(collectData,function(status,data){
           //  if(status){
           //    console.log(data)
           //    res.send(data);
           //  }else{
           //    res.send("data");
           //  }
           // })
            // fs.readFile('./config/keranjang.json',{encoding: 'utf8'},function(err,data) {
            //   var datas= JSON.parse(data);
            //   console.log("ini data ku",datas);
        
            //   var i=0;
             
            //   var productID="";
            //   for (var dataIndex in datas.data) {
            //      if (datas.data[dataIndex].uniqueID == 232323) {
            //         datas.data[dataIndex].qty = "sdfasd";
            //         productID=datas.data[dataIndex].productID;
            //         console.log("============="+datas.data[dataIndex].uniqueID);
            //         console.log("============="+datas.data[dataIndex].productID);
            //      }


            //      i++;
            //   }
    
            //  res.send("dsafadsfasdf");
            // })
            res.send(bank.getWord("Bank Mandiri"));

})





/*
 * Verify that the callback came from Facebook. Using the App Secret from 
 * the App Dashboard, we can verify the signature that is sent with each 
 * callback in the x-hub-signature field, located in the header.
 *
 * https://developers.facebook.com/docs/graph-api/webhooks#setup
 *
 */
function verifyRequestSignature(req, res, buf) {
  var signature = req.headers["x-hub-signature"];

  if (!signature) {
    // For testing, let's log an error. In production, you should throw an 
    // error.
    console.error("Couldn't validate the signature.");
  } else {
    var elements = signature.split('=');
    var method = elements[0];
    var signatureHash = elements[1];

    var expectedHash = crypto.createHmac('sha1', APP_SECRET)
                        .update(buf)
                        .digest('hex');

    if (signatureHash != expectedHash) {
      throw new Error("Couldn't validate the request signature.");
    }
  }
}

/*
 * Authorization Event
 *
 * The value for 'optin.ref' is defined in the entry point. For the "Send to 
 * Messenger" plugin, it is the 'data-ref' field. Read more at 
 * https://developers.facebook.com/docs/messenger-platform/webhook-reference/authentication
 *
 */
function receivedAuthentication(event) {
  var senderID = event.sender.id;
  var recipientID = event.recipient.id;
  var timeOfAuth = event.timestamp;

  // The 'ref' field is set in the 'Send to Messenger' plugin, in the 'data-ref'
  // The developer can set this to an arbitrary value to associate the 
  // authentication callback with the 'Send to Messenger' click event. This is
  // a way to do account linking when the user clicks the 'Send to Messenger' 
  // plugin.
  var passThroughParam = event.optin.ref;

  console.log("Received authentication for user %d and page %d with pass " +
    "through param '%s' at %d", senderID, recipientID, passThroughParam, 
    timeOfAuth);

  // When an authentication is received, we'll send a message back to the sender
  // to let them know it was successful.
  sendTextMessage(senderID, "Authentication successful");
}

/*
 * Message Event
 *
 * This event is called when a message is sent to your page. The 'message' 
 * object format can vary depending on the kind of message that was received.
 * Read more at https://developers.facebook.com/docs/messenger-platform/webhook-reference/message-received
 *
 * For this example, we're going to echo any text that we get. If we get some 
 * special keywords ('button', 'generic', 'receipt'), then we'll send back
 * examples of those bubbles to illustrate the special message bubbles we've 
 * created. If we receive a message with an attachment (image, video, audio), 
 * then we'll simply confirm that we've received the attachment.
 * 
 */
function nl_send(messengerText, senderID){
        const app = nlp("ee4b10fce9a845419f72802b05ac8257");
        var apiai = app.textRequest(messengerText, {
            sessionId: 'test_session'
        });

        apiai.on('response',(responsed)=>{
          let aiText = responsed.result.fulfillment.speech;
          let intent= responsed.result.metadata.intentName;
          let action=responsed.result.action;

          if(intent==="welcom-message"){
            console.log("sender IDIDIDID",senderID);
            sendButtonMessage(senderID);
          }else if(intent==='cek_order' || intent==='cek_order - yes' || intent==='cek_order - no'){


            if(intent==='cek_order'){
              if(responsed.result.parameters.number!='' && action==='cek'){
                var orderNumber=responsed.result.parameters.number;
               
                web_services.cekOrder(orderNumber,function(data,status){
                  if(status){

                    sendTextMessage(senderID,"Pesananan dengan nomor ini: "+orderNumber+"\nberstatus : "+data.orderStatus);

                    
                  }else{
                    //maaf kami tidak dapat mendapatkan data anda
                    sendTextMessage(senderID,"Maaf kami tidak dapat menemukan informasi mengenai nomor order tersebut");
                    setTimeout(function di(){
                      sendTextMessage(senderID,"Manfaatkan menu di bawah ini untuk membantu Anda ;)");
                    },2000);
                    setTimeout(function di(){
                      sendButtonMenu(senderID);
                    },2000);

                  }
                })
                //cek order
              }else{
                sendTextMessage(senderID,aiText);
                // nl_send('cek order yes',senderID);
              }
            }else if(intent==='cek_order - yes'){
              if(responsed.result.parameters.numbers!='' ){
                var orderNumber=responsed.result.parameters.numbers;
                web_services.cekOrder(orderNumber,function(data,status){
                  if(status){

                    sendTextMessage(senderID,"Pesanan dengan nomor ini: "+orderNumber+"\nberstatus : "+data.orderStatus);

                    
                  }else{
                    //maaf kami tidak dapat mendapatkan data anda
                    sendTextMessage(senderID,"Maaf kami tidak dapat menemukan informasi mengenai nomor order tersebut");

                  }
                })
              }else if(responsed.result.parameters.number!='' && responsed.result.parameters.numbers==''){
                var orderNumber=responsed.result.parameters.number;
                web_services.cekOrder(orderNumber,function(data,status){
                  if(status){

                    sendTextMessage(senderID,"Pesanan dengan nomor ini: "+orderNumber+"\nberstatus : "+data.orderStatus);
                  }else{
                    //maaf kami tidak dapat mendapatkan data anda
                    sendTextMessage(senderID,"Maaf kami tidak dapat menemukan informasi mengenai nomor order tersebut");
                  }
                })
              }else{
                sendTextMessage(senderID,aiText);
              }

            }else{
              sendTextMessage(senderID,aiText);
            }



          }else if(intent==='order'){
            sendTextMessage(senderID,aiText);
            setTimeout(function di(){
              sendTextMessage(senderID,"Hai, Kami memiliki beragam produk yang dapat anda pesan diantaranya adalah: \n" 
                +"1. Paper Bag.\n"
                +"Silahkan klik tombol cepat di bawah ini untuk memulai memesan produk, atau anda dapat mengetikkannya");
            })

            setTimeout(function di(){
              sendQuickReplyProduk(senderID);
            },2000);
          }else if(intent==='order_paper_bag_yes'){
            if(responsed.result.parameters.paper_type!='' && responsed.result.parameters.panjang!='' && responsed.result.parameters.lebar!='' && responsed.result.parameters.tinggi!='' && responsed.result.parameters.warna!='' ){
              //get data from server with function
              var data={"jenisKertas":responsed.result.parameters.paper_type,
                        "panjang":responsed.result.parameters.panjang,
                        "lebar":responsed.result.parameters.lebar,
                        "tinggi":responsed.result.parameters.tinggi,
                        "warna":responsed.result.parameters.warna};
              sendTextMessage(senderID,"Mungkin ini produk yang Anda cari");
              if(data.warna==="satu warna"){
                data.warna="One Colour";
              }

              if(data.warna==="full colour"){
                data.warna="Full Colour";
              }

              console.log("============",data);
              setTimeout(function(){
                sendTypingOn(senderID)
              },2000);
              web_services.getProdukData(data,function(datas){
                sendTypingOff(senderID);

                if(datas.status!="Error"){
                  var myTimer=setTimeout(function di(){
                     sendGenericMessage(senderID,datas)
                  },2000);
                }else{
                  sendTextMessage(senderID,"Maaf telah terjadi kesalahan di server kami, silahkan coba beberapa saat lagi");
                }

               
              });
            }else if(responsed.result.parameters.paper_type==''){
              sendTextMessage(senderID,aiText);

                var myTimer = setTimeout(function di(){
                  sendQuickReplyPaperType(senderID)
                }, 2000);
            }else if(responsed.result.parameters.warna=='' && responsed.result.parameters.panjang!='' && responsed.result.parameters.lebar!='' && responsed.result.parameters.tinggi!=''){
               sendTextMessage(senderID,aiText);
                var myTimer = setTimeout(function di(){
                  sendQuickReplyWarna(senderID)
                }, 2000);
            }else{
              sendTextMessage(senderID,aiText);
            }

          }else if(intent==='order-paper-bag-yes-jumlah'){
            var uniqueID=responsed.result.parameters.uniqueID;
            var jumlahPesanan=responsed.result.parameters.number;

            if(jumlahPesanan < 100){
              sendTextMessage(senderID,'Minimal order adalah 100, silahkan hubungi Customer Service kami untuk pemesanan di bawah minimal order')
            }else{
              fs.readFile('./config/keranjang.json',{encoding: 'utf8'},function(err,data) {
                var datas= JSON.parse(data);
                console.log("ini data ku",datas);
                var i=0;
                var productID="";
                for (var dataIndex in datas.data) {
                   if (datas.data[dataIndex].uniqueID == uniqueID) {
                      datas.data[dataIndex].qty = jumlahPesanan;
                      productID=datas.data[dataIndex].productID;
                      console.log("============="+datas.data[dataIndex].uniqueID);
                      console.log("============="+datas.data[dataIndex].productID);
                   }


                   i++;
                }
               
                var string = JSON.stringify(datas,null,'\t');
                fs.writeFile('./config/keranjang.json',string,function(err) {
                  if(err) return console.error(err);
                  console.log('done');
                })  
                var pro={'productID':productID};
                web_services.getProdukDetail(productID,function(produks){
                  console.log(produks);

                  if(produks.status!="Error"){
                     sendTextMessage(senderID,"Anda akan memesan sebanyak:"+ jumlahPesanan+"\n produk "+produks.data.nama);

                      setTimeout(function di(){
                        sendQuickReplyKonfirmasi(senderID);
                      },1000)
                   }else{
                     sendTextMessage(senderID,"Maaf telah terjadi kesalahan, silahkan coba lagi nanti!");
                   }
                 
    
                })
              })
            }

            //simpan pesanan
            //tampilkan detail order an dalam bentuk template generic
            


  
            // setTimeout(function id(){
            //   sendTextMessage(senderID,aiText);
            // },2000);

            


          }else if(intent==='order-paper-bag-yes-cancel'){
            // var uniqueID=responsed.result.parameters.uniqueID;

  
            // fs.readFile('./config/keranjang.json',{encoding: 'utf8'},function(err,data) {
            //   var datas= JSON.parse(data);
        
            //   var i=0;
            //   for (var dataIndex in datas.data) {

            //      if (datas.data[dataIndex].uniqueID === uniqueID) {
        
            //         datas.data.splice(dataIndex,1);
            //      }

            //      i++;
            //   }
    
            //   var string = JSON.stringify(datas,null,'\t');
            //   fs.writeFile('./config/keranjang.json',string,function(err) {
            //     if(err) return console.error(err);
            //     console.log('done');
            //   })  
            // })
            //hapus data keranjang
              // sendTextMessage(senderID,"Baik Pesanan anda kami batalkan");
              setTimeout(function di(){
                sendButtonMessage(senderID);
              },2000);

          }else if(intent==='order-paper-bag-yes-yes'){
            var uniqueID=responsed.result.parameters.uniqueID;
            var jumlahPesanan=responsed.result.parameters.number;

            //save data to database through api 
            var collectData={"productID":"","messengerID":"","jumlahPesanan":""};
            fs.readFile('./config/keranjang.json',{encoding: 'utf8'},function(err,data) {
              var datas=JSON.parse(data);

              for(var dataIndex in datas.data){
                // collectData.productID="dfasdfasf";
                if (datas.data[dataIndex].uniqueID == uniqueID) {
                  console.log("asdfa");
                  collectData={"productID":datas.data[dataIndex].productID,"messengerID":senderID,"jumlahPesanan":jumlahPesanan};
                }
                
              }


              // setTimeout(function di(){
              //    sendTextMessage(senderID,'Baik kami akan memproses pesanan anda :)');
              // },2000);


              web_services.sendData(collectData,function(status,statement){
                if(status){
                  io.emit('notif order',"ahmad");
                  //detail order nomor order;
                  setTimeout(function di(){
                     sendTextMessage(senderID,'Terimakasih telah bertransaksi dengan kami, sebentar lagi kami akan memproses pesanan Anda di HDKreasi :)');
                  },1000);
                  console.log("ddd--------------------------------",statement.data.orderNumber);
                  let orderNumber=statement.data.orderNumber;
              
                     let msg="Selamat, Pesanan Anda telah tersimpan."+
                            "\nHarap mengingat dan mencatat nomor pesanan Anda ini"+ "\n\n"
                            "\n Nomor Pesanan : "+orderNumber.toString();
                      setTimeout(function di(){
                         sendTextMessage(senderID,msg+statement.data.orderNumber);
                      },3000);

                    //hapus data keranjang
                    fs.readFile('./config/keranjang.json',{encoding: 'utf8'},function(err,data) {
                      var datas= JSON.parse(data);
                
                      var i=0;
                      for (var dataIndex in datas.data) {

                         if (datas.data[dataIndex].uniqueID == uniqueID) {
                
                            datas.data.splice(dataIndex,1);
                         }

                         i++;
                      }
            
                      var string = JSON.stringify(datas,null,'\t');
                      fs.writeFile('./config/keranjang.json',string,function(err) {
                        if(err) return console.error(err);
                        console.log('done');
                      })  
                    })
                    //hapus data keranjang  

                }else{
                  sendTextMessage(senderID,"Maaf telah terjadi sesuatu di server kami, kami tidak dapat memproses pesanan Anda. Silahkan coba beberapa saat lagi \n",senderID);
                }
              })
               
            })

          }else if(intent==='thank-you'){
            sendTextMessage(senderID,terimakasih.getWord());

            setTimeout(function di(){
              sendButtonMessage(senderID);
            },2000);
            

          }else if(intent==="konfirmasi_pembayaran"){
            var nomorPesanane=responsed.result.parameters.number;
            var jumlah=responsed.result.parameters.jumlah;
            if(nomorPesanane!='' && jumlah!=''){
                
              //save data to database;
              var dataku={'orderNumber':nomorPesanane,'keterangan':jumlah};
                 web_services.cekOrder(nomorPesanane,function(data,status){
                  if(status){
                    //cek nomor order annya
                    web_services.sendKonfirmasiPembayaran(dataku,function(result,code){
                      //lakukan konfirmasi pembayaran disini, beri notifikasi ke client
                      console.log(result);
                      if(result && code==='oke'){
                          io.emit('notif pembayaran',dataku);
                         sendTextMessage(senderID,"Kami akan melakukan pengecekan pembayaran Anda, terimakasih");
                      }else if(code==='no invoice'){
                           sendTextMessage(senderID,"Maaf, invoice belum diterbitkan. Silahkan cek status pesanan anda.");
                      }else{
                          sendTextMessage(senderID,"Telah terjadi error, silahkan coba lagi");
                      }
                    })
                  }else{
                    //maaf kami tidak dapat mendapatkan data anda
                    sendTextMessage(senderID,"Maaf kami tidak dapat menemukan informasi mengenai nomor order tersebut");
                    setTimeout(function di(){
                      sendTextMessage(senderID,"Manfaatkan menu di bawah ini untuk membantu Anda ;)");
                    },2000);
                    setTimeout(function di(){
                      sendButtonMenu(senderID);
                    },2000);

                  }
                })




            }else{

              sendTextMessage(senderID,aiText);
            }
          }


          else if(intent==='Default Fallback Intent'){
            sendTextMessage(senderID,defaults.getAnswer());


            setTimeout(function di(){
              sendTextMessage(senderID,"Manfaatkan menu di bawah ini untuk membantu Anda ;)");
            },2000);
            setTimeout(function di(){
              sendButtonMenu(senderID);
            },2000);
            

            
          }else if(intent==='tanya_produk_lain'){

            sendTextMessage(senderID,"Hai, Kami memiliki beragam produk yang dapat anda pesan diantaranya adalah: \n" 
              +"1. Paper Bag.\n"
              +"Silahkan klik tombol cepat di bawah ini untuk memulai memesan produk, atau anda dapat mengetikkannya");
            setTimeout(function di(){
              sendQuickReplyProduk(senderID);
            },2000);
          }else if(intent==='batal_intent'){
            sendTextMessage(senderID,defaults.getAnswer());


            setTimeout(function di(){
              sendTextMessage(senderID,"Manfaatkan menu di bawah ini untuk membantu Anda ;)");
            },2000);
            setTimeout(function di(){
              sendButtonMenu(senderID);
            },2000);
          }else if(intent==='Tanya_bank'){
            var banks=responsed.result.parameters.bank;
            if(banks){
              //jawab 
              sendTextMessage(senderID, "Nomor Rekening "+ banks +" Kami:"+bank.getWord(banks))
            }else{
              sendTextMessage(senderID, "Kami memiliki beberapa bank untuk melakukan transaksi pembayaran." );

              setTimeout(function(){
                sendQuickReplyBank(senderID);

              },2000);
              
            }
          }
          else{
             sendTextMessage(senderID,aiText);
          }
          // this.messageText=aiText;
          console.log(responsed)
          // sendTextMessage(senderID, aiText);
  
       
        })

        apiai.on('error',(error)=>{
          console.log(error);
        })
        
        apiai.end();
}



function receivedMessage(event) {
  var senderID = event.sender.id;
  var recipientID = event.recipient.id;
  var timeOfMessage = event.timestamp;
  var message = event.message;

  console.log("Received message for user %d and page %d at %d with message:", 
    senderID, recipientID, timeOfMessage);
  console.log(JSON.stringify(message));

  var isEcho = message.is_echo;
  var messageId = message.mid;
  var appId = message.app_id;
  var metadata = message.metadata;

  // You may get a text or attachment but not both
  var messageText = message.text;
  var messageAttachments = message.attachments;
  var quickReply = message.quick_reply;



  if (isEcho) {
    // Just logging message echoes to console
    console.log("Received echo for message %s and app %d with metadata %s", 
      messageId, appId, metadata);
    return;
  } else if (quickReply) {
    var quickReplyPayload = quickReply.payload;
    console.log("Quick reply for message %s with payload %s",
      messageId, quickReplyPayload);



       if(quickReplyPayload==="KONFIRMASI"){
        web_services.cekCustomer(senderID,function id(info,any){
          if(any){
            nl_send("lanjutkan",senderID);
          }else{

            sendTextMessage(senderID,"Maaf Kami belum menemukan data Anda di database kami, Anda harus mengisi data diri terlebih dahulu.\n"+"Silahkan tekan tombol di bawah ini untuk mengisi data diri atau di dalam menu?");
            setTimeout(function di(){
                  sendButtonSettingMenu(senderID);
            }, 2000);

            setTimeout(function di(){
              sendQuickReplyKonfirmasi(senderID);
            },2000)
          }
        });
      }else if(quickReplyPayload==="CANCEL"){
        sendTextMessage(senderID,"Baik, pesanan Anda kami batalkan");
        nl_send("batalkan pesanan",senderID);
      }else{
         nl_send(quickReplyPayload,senderID);
      }


      return;

  }

  if (messageText) {

    // If we receive a text message, check to see if it matches any special
    // keywords and send back the corresponding example. Otherwise, just echo
    // the text we received.
    switch (messageText) {
      case 'image':
        sendImageMessage(senderID);
        break;

      case 'gif':
        sendGifMessage(senderID);
        break;

      case 'audio':
        sendAudioMessage(senderID);
        break;

      case 'video':
        sendVideoMessage(senderID);
        break;

      case 'file':
        sendFileMessage(senderID);
        break;

      case 'button':
        sendButtonMessage(senderID);
        break;

      case 'generic':
        sendGenericMessage(senderID);
        break;

      case 'receipt':
        sendReceiptMessage(senderID);
        break;

      case 'quick reply':
        sendQuickReply(senderID);
        break;        

      case 'read receipt':
        sendReadReceipt(senderID);
        break;        

      case 'typing on':
        sendTypingOn(senderID);
        break;        

      case 'typing off':
        sendTypingOff(senderID);
        break;        

      case 'account linking':
        sendAccountLinking(senderID);
        break;

      default:
       nl_send(messageText.replace(/\./g, ''),senderID);


        
    }
  } else if (messageAttachments) {
    sendTextMessage(senderID, messageAttachments);
  }
}


/*
 * Delivery Confirmation Event
 *
 * This event is sent to confirm the delivery of a message. Read more about 
 * these fields at https://developers.facebook.com/docs/messenger-platform/webhook-reference/message-delivered
 *
 */
function receivedDeliveryConfirmation(event) {
  var senderID = event.sender.id;
  var recipientID = event.recipient.id;
  var delivery = event.delivery;
  var messageIDs = delivery.mids;
  var watermark = delivery.watermark;
  var sequenceNumber = delivery.seq;

  if (messageIDs) {
    messageIDs.forEach(function(messageID) {
      console.log("Received delivery confirmation for message ID: %s", 
        messageID);
    });
  }

  console.log("All message before %d were delivered.", watermark);
}


/*
 * Postback Event
 *
 * This event is called when a postback is tapped on a Structured Message. 
 * postback yang diterima adalah welcomin message ()
 * https://developers.facebook.com/docs/messenger-platform/webhook-reference/postback-received
 * 
 */


function receivedPostback(event) {
  var senderID = event.sender.id;
  var recipientID = event.recipient.id;
  var timeOfPostback = event.timestamp;

  var payload=event.postback.payload;
  var msg="";      

  var parts = payload.split("/");

      if(parts[0]==="Beli" && parts[1]!=''){

        //simpan ke dalam keranjang beli
        //setelah 
        //cek apakah member baru atau tidak

              var productID=parts[parts.length-1];
            var uniqueID = Math.floor(Math.random()*1000);
          fs.readFile('./config/keranjang.json',{encoding: 'utf8'},function(err,data) {

            var data= JSON.parse(data);
             data.data.push({ 'senderID':senderID,'productID':productID,'qty':"",'uniqueID':uniqueID});
            var string = JSON.stringify(data,null,'\t');

            fs.writeFile('./config/keranjang.json',string,function(err) {
              if(err) return console.error(err);
              
            })  
          })
        web_services.cekCustomer(senderID,function id(info,any){
          if(any){
            nl_send("uniqueID "+uniqueID,senderID);
            sendTextMessage(senderID,"Berapakah jumlah paper bag yang akan Anda pesan?");
          }else{

            nl_send("uniqueID "+uniqueID,senderID);
            sendTextMessage(senderID,"Maaf Kami belum menemukan data Anda di database kami, kami memerlukan data Anda. Anda harus mengisi data diri terlebih dahulu.\n"+"Silahkan tekan tombol di bawah ini untuk mengisi data diri atau dari menu kami? :) ");
            setTimeout(function di(){
                  sendButtonSettingMenu(senderID);
            }, 2000);
            // setTimeout(function di(){
            //       sendTextMessage(senderID,"Berapa jumlah pesanan yang anda inginkan?");
            // }, 1000);
          }
        });
        

      }else if (payload==="Menu"){ 

  //setiap kali ada postback yang payload nya berisi GET_STARTED_PAYLOAD ataupun BANTUAN maka default isi msg nya berupa bantuan
    // msg="Hallo , saya bisa membantu kamu untuk menemukan produk kami ,coba ketikkan apa saja, seperti:"+ 
    //       "\n 1. saya mau pesan paper bag. "+
    //       "\n 2. saya ingin order undangan."+
    //       "\n 3. cek order saya"+ 
    //       "\n 4. info harga "+
    //       "\n 5. saya minta rekomendasi produk";
          // sendTextMessage(senderID, msg);
          sendTextMessage(senderID,":) ini adalah menu yang dapat Anda gunakan");
          sendButtonMenu(senderID);
  }else if(payload==="PRODUK"){
    nl_send('saya mau pesan',senderID);
    // sendTextMessage(senderID, "Postback called");
  }else if(payload==="CEK"){
        nl_send("cek order",senderID);

        // const app = nlp("ee4b10fce9a845419f72802b05ac8257");

        // var apiai = app.textRequest("cek order", {
        //     sessionId: 'test_session'
        // });

        // apiai.on('response',(responsed)=>{
        //   let aiText = responsed.result.fulfillment.speech;
        //   let intent= responsed.result.metadata.intentName;

        //   if(intent==='cek_order'){


        //     console.log(responsed);
        //     console.log("dsdd",responsed.result.parameters.number);
        //     var orderNumber=responsed.result.parameters.number;
        //     if(responsed.result.parameters.number!=''){
        //         web_services.cekOrder(orderNumber,function(data,status){
        //           if(status){

        //             sendTextMessage(senderID,"Pesananan dengan nomor ini: "+orderNumber+"\nberstatus : "+data.orderStatus);

                    
        //           }else{
        //             //maaf kami tidak dapat mendapatkan data anda
        //             sendTextMessage(senderID,"Maaf kami tidak dapat menemukan informasi mengenai nomor order tersebut");
        //             setTimeout(function di(){
        //               sendTextMessage(senderID,"Manfaatkan menu dibawah ini untuk membantu Anda ;)");
        //             },2000);
        //             setTimeout(function di(){
        //               sendButtonMenu(senderID);
        //             },2000);

        //           }
        //         })
        //       //cek order

             
        //     }else{
        //        sendTextMessage(senderID,aiText);
        //     }
        

        //   }
        //   console.log(responsed)
        //   // sendTextMessage(senderID, aiText);
        // })

        // apiai.on('error',(error)=>{
        //   console.log(error);
        // })
        
        // apiai.end();
     
  }else if(payload==="BANTUAN"){

  }else if(payload==="GET_STARTED_PAYLOAD"){

    sendButtonMessage(senderID);
  }else if(payload==="PEMBAYARAN"){

  }




  // The 'payload' param is a developer-defined field which is set in a postback 
  // button for Structured Messages. 

  console.log("Received postback for user %d and page %d with payload '%s' " + 
    "at %d", senderID, recipientID, payload, timeOfPostback);

  // When a postback is called, we'll send a message back to the sender to 
  // let them know it was successful()
  
}

/*
 * Message Read Event
 *
 * This event is called when a previously-sent message has been read.
 * https://developers.facebook.com/docs/messenger-platform/webhook-reference/message-read
 * 
 */
function receivedMessageRead(event) {
  var senderID = event.sender.id;
  var recipientID = event.recipient.id;

  // All messages before watermark (a timestamp) or sequence have been seen.
  var watermark = event.read.watermark;
  var sequenceNumber = event.read.seq;

  console.log("Received message read event for watermark %d and sequence " +
    "number %d", watermark, sequenceNumber);
}

/*
 * Account Link Event
 *
 * This event is called when the Link Account or UnLink Account action has been
 * tapped.
 * https://developers.facebook.com/docs/messenger-platform/webhook-reference/account-linking
 * 
 */
function receivedAccountLink(event) {
  var senderID = event.sender.id;
  var recipientID = event.recipient.id;

  var status = event.account_linking.status;
  var authCode = event.account_linking.authorization_code;

  console.log("Received account link event with for user %d with status %s " +
    "and auth code %s ", senderID, status, authCode);
}

/*
 * Send an image using the Send API.
 *
 */
function sendImageMessage(recipientId) {
  var messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      attachment: {
        type: "image",
        payload: {
          url: SERVER_URL + "/assets/rift.png"
        }
      }
    }
  };

  callSendAPI(messageData);
}

/*
 * Send a Gif using the Send API.
 *
 */
function sendGifMessage(recipientId) {
  var messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      attachment: {
        type: "image",
        payload: {
          url: SERVER_URL + "/assets/instagram_logo.gif"
        }
      }
    }
  };

  callSendAPI(messageData);
}

/*
 * Send audio using the Send API.
 *
 */
function sendAudioMessage(recipientId) {
  var messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      attachment: {
        type: "audio",
        payload: {
          url: SERVER_URL + "/assets/sample.mp3"
        }
      }
    }
  };

  callSendAPI(messageData);
}

/*
 * Send a video using the Send API.
 *
 */
function sendVideoMessage(recipientId) {
  var messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      attachment: {
        type: "video",
        payload: {
          url: SERVER_URL + "/assets/allofus480.mov"
        }
      }
    }
  };

  callSendAPI(messageData);
}

/*
 * Send a file using the Send API.
 *
 */
function sendFileMessage(recipientId) {
  var messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      attachment: {
        type: "file",
        payload: {
          url: SERVER_URL + "/assets/test.txt"
        }
      }
    }
  };

  callSendAPI(messageData);
}

/*
 * Send a text message using the Send API.
 *
 */
function sendTextMessage(recipientId, messageText) {
  var messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      text: messageText,
      metadata: "DEVELOPER_DEFINED_METADATA"
    }
  };

  callSendAPI(messageData);
}





/*
 * Send a message with Quick Reply buttons.
 *
 */
function sendQuickReply(recipientId) {
  var messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      text: "What's your favorite movie genre?",
      quick_replies: [
        {
          "content_type":"text",
          "title":"Action",
          "payload":"DEVELOPER_DEFINED_PAYLOAD_FOR_PICKING_ACTION"
        },
        {
          "content_type":"text",
          "title":"Comedy",
          "payload":"DEVELOPER_DEFINED_PAYLOAD_FOR_PICKING_COMEDY"
        },
        {
          "content_type":"text",
          "title":"Drama",
          "payload":"DEVELOPER_DEFINED_PAYLOAD_FOR_PICKING_DRAMA"
        }
      ]
    }
  };

  callSendAPI(messageData);
}
function sendQuickReplyBank(recipientId) {
  var messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      text: "Silahkan pilih salah satu bank di bawah ini.",
      quick_replies: [
        {
          "content_type":"text",
          "title":"Mandiri",
          "payload":"Bank Mandiri"
        },
        {
          "content_type":"text",
          "title":"BCA",
          "payload":"Bank BCA"
        },
        {
          "content_type":"text",
          "title":"BNI",
          "payload":"Bank BNI"
        }
      ]
    }
  };

  callSendAPI(messageData);
}

function sendQuickReplyProduk(recipientId) {
  var messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      text: "Pilih",
      quick_replies: [
        {
          "content_type":"text",
          "title":"Paper Bag",
          "payload":"Pesan Paper Bag"
        }
      ]
    }
  };

  callSendAPI(messageData);
}
function sendQuickReplyKonfirmasi(recipientId) {
  var messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      text: "Apakah Anda ingin melanjutkan pesanan ini?",
      quick_replies: [
        {
          "content_type":"text",
          "title":"Iya, lanjutkan",
          "payload":"KONFIRMASI"
        },{
          "content_type":"text",
          "title":"Batalkan",
          "payload":"CANCEL"
        }
      ]
    }
  };

  callSendAPI(messageData);
}
function sendQuickReplyPaperType(recipientId) {
  var messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      text: "pilih jenis kertas yang Anda inginkan di bawah ini?",
      quick_replies: [
        {
          "content_type":"text",
          "title":"Art Paper",
          "payload":"Art Paper"
        },
        {
          "content_type":"text",
          "title":"Craft Cokelat",
          "payload":"Craft Cokelat"
        },
        {
          "content_type":"text",
          "title":"Craft Putih",
          "payload":"Craft Putih"
        }
      ]
    }
  };

  callSendAPI(messageData);
}
function sendQuickReplyWarna(recipientId) {
  var messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      text: "pilih warna yang Anda inginkan, dengan klik pilihan di bawah ini?",
      quick_replies: [
        {
          "content_type":"text",
          "title":"Full colour",
          "payload":"Full colour"
        },
        {
          "content_type":"text",
          "title":"Satu Warna",
          "payload":"Satu Warna"
        }
      ]
    }
  };

  callSendAPI(messageData);
}

/*
 * Send a read receipt to indicate the message has been read
 *
 */
function sendReadReceipt(recipientId) {
  console.log("Sending a read receipt to mark message as seen");

  var messageData = {
    recipient: {
      id: recipientId
    },
    sender_action: "mark_seen"
  };

  callSendAPI(messageData);
}

/*
 * Turn typing indicator on
 *
 */
function sendTypingOn(recipientId) {
  console.log("Turning typing indicator on");

  var messageData = {
    recipient: {
      id: recipientId
    },
    sender_action: "typing_on"
  };

  callSendAPI(messageData);
}

/*
 * Turn typing indicator off
 *
 */
function sendTypingOff(recipientId) {
  console.log("Turning typing indicator off");

  var messageData = {
    recipient: {
      id: recipientId
    },
    sender_action: "typing_off"
  };

  callSendAPI(messageData);
}

/*
 * Send a message with the account linking call-to-action
 *
 */
function sendAccountLinking(recipientId) {
  var messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      attachment: {
        type: "template",
        payload: {
          template_type: "button",
          text: "Welcome. Link your account.",
          buttons:[{
            type: "account_link",
            url: SERVER_URL + "/authorize"
          }]
        }
      }
    }
  };  

  callSendAPI(messageData);
}
/*
 * Send a button message using the Send API. (fungsi untuk melakukan pengiriman generic template berupa menu)
 *
 */
function sendButtonMessage(recipientId) {
   let msg="Hallo, saya hdkreasi bot."+
          "\nSaya robot chat yang dapat membantu Anda, coba ketikkan apa saja, seperti:"+ 
          "\n 1. Saya ingin pesan paper bag. "+
          "\n 2. Saya ingin order tas kertas."+
          "\n 3. Cek pesanan saya."+
          "\n 4. Saya mau konfirmasi pembayaran."+
          "\n "+
          "\nAnda dapat menanyakan sesuatu dengan mengetikkan pesan atau menggunakan tombol menu di bawah ini.";
  
  var messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      attachment: {
        type: "template",
        payload: {
          template_type: "button",
          text: msg,
          buttons:[ {
            type: "postback",
            title: "MENU",
            payload: "Menu"
          }]
        }
      }
    }
  };  

  callSendAPI(messageData);
}

function sendNotifMessage(recipientId,messageText){

  
  var messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      text: messageText,
      metadata: "DEVELOPER_DEFINED_METADATA"
    }
  };

  callSendAPI(messageData);
}
function sendButtonMenu(recipientId) {
  
  var messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      attachment: {
        type: "template",
        payload: {
          template_type: "button",
          text: "Menu",
          buttons:[ {
            type: "postback",
            title: "Pesan Produk",
            payload: "PRODUK"
          },{
            type: "postback",
            title: "Cek Pesanan",
            payload: "CEK"
          },{
            type: "web_url",
            url: "https://arcane-mesa-75663.herokuapp.com/",
            title: "Setting Profile",
            webview_height_ratio:"full",
            messenger_extensions: "true"
          }]
        }
      }
    }
  };  

  callSendAPI(messageData);
}
function sendButtonSettingMenu(receipentID){
    var messageData = {
    recipient: {
      id: receipentID
    },
    message: {
      attachment: {
        type: "template",
        payload: {
          template_type: "button",
          text: "Klik tombol di bawah ini untuk mengatur profile anda",
          buttons:[ {
            type: "web_url",
            url: "https://arcane-mesa-75663.herokuapp.com/",
            title: "Setting Profile",
            webview_height_ratio:"full",
            messenger_extensions: "true"
          }]
        }
      }
    }
  };  

  callSendAPI(messageData);
}

/* fungsi untuk menampilkan pesan berupa teks pembuka*/

/*fungsi untuk melakukan pengiriman generic template message berupa konfirmasi pembayaran
 *
 */

/*
 * Send a receipt message using the Send API. (fungsi untuk melakukan pengiriman generic template message berupa invoice)
 *
 */
function sendReceiptMessage(recipientId) {
  // Generate a random receipt ID as the API requires a unique ID
  var receiptId = "order" + Math.floor(Math.random()*1000);

  var messageData = {
    recipient: {
      id: recipientId
    },
    message:{
      attachment: {
        type: "template",
        payload: {
          template_type: "receipt",
          recipient_name: "Peter Chang",
          order_number: receiptId,
          currency: "USD",
          payment_method: "Visa 1234",        
          timestamp: "1428444852", 
          elements: [{
            title: "Oculus Rift",
            subtitle: "Includes: headset, sensor, remote",
            quantity: 1,
            price: 599.00,
            currency: "USD",
            image_url: SERVER_URL + "/assets/riftsq.png"
          }, {
            title: "Samsung Gear VR",
            subtitle: "Frost White",
            quantity: 1,
            price: 99.99,
            currency: "USD",
            image_url: SERVER_URL + "/assets/gearvrsq.png"
          }],
          address: {
            street_1: "1 Hacker Way",
            street_2: "",
            city: "Menlo Park",
            postal_code: "94025",
            state: "CA",
            country: "US"
          },
          summary: {
            subtotal: 698.99,
            shipping_cost: 20.00,
            total_tax: 57.67,
            total_cost: 626.66
          },
          adjustments: [{
            name: "New Customer Discount",
            amount: -50
          }, {
            name: "$100 Off Coupon",
            amount: -100
          }]
        }
      }
    }
  };

  callSendAPI(messageData);
}

function sendInvoiceMessage(recipientId,datas) {
  // Generate a random receipt ID as the API requires a unique ID
  // var receiptId = "order" + Math.floor(Math.random()*1000);

  var messageData = {
    recipient: {
      id: recipientId
    },
    message:{
      attachment: {
        type: "template",
        payload: {
          template_type: "receipt",
          recipient_name: datas.data.customerName,
          order_number: datas.data.orderNumber,
          currency: "IDR",
          payment_method: 'Bank tujuan transfer dapat anda tanyakan di chatbot',        
          timestamp: "1428444852", 
          elements: [],
          address: {
  

            street_1: datas.data.address,
            street_2: ".",
            city: ".",
            postal_code: ".",
            state: ".",
            country: "Indonesia"
          },
          summary: {
            subtotal:'',
            shipping_cost: 0,
            total_tax: 0,
            total_cost: 0
          },
          adjustments: []
          //   name: "New Customer Discount",
          //   amount: -50
          // }, {
          //   name: "$100 Off Coupon",
          //   amount: -100
          // }]
        }
      }
    }
  };

  var subTotal=0;
  datas.data.item.forEach(function(item){
    var total=parseFloat(item.itemTotal);
    subTotal=subTotal+total;
        messageData.message.attachment.payload.elements.push(
        {
            title: item.namaProduk,
            subtitle: "",
            quantity: item.itemQty,
            price: item.itemUnitPrice,
            currency: "IDR",
            image_url: API_URL + "/uploads/produk/"+item.image
        });

  })
  messageData.message.attachment.payload.summary.subtotal=subTotal;
   messageData.message.attachment.payload.summary.total_cost=subTotal;


  callSendAPI(messageData);
}
function sendOrderDetailMessage(recipientId,datas) {
  // Generate a random receipt ID as the API requires a unique ID
  // var receiptId = "order" + Math.floor(Math.random()*1000);
  var itemQty=parseFloat(datas.harga);
  var jmlPesanan=parseFloat(datas.jumlahPesanan);
  var subTotal=itemQty * jmlPesanan;
  var messageData = {
    recipient: {
      id: recipientId
    },
    message:{
      attachment: {
        type: "template",
        payload: {
          template_type: "receipt",
          recipient_name: "",
          order_number: "",
          currency: "USD",
          payment_method: "",        
          timestamp: "1428444852", 
          elements: [],
          address: {
            street_1: ""
          },
          summary: {
            subtotal:''
          },
          adjustments: []
          //   name: "New Customer Discount",
          //   amount: -50
          // }, {
          //   name: "$100 Off Coupon",
          //   amount: -100
          // }]
        }
      }
    }
  };


        messageData.message.attachment.payload.elements.push(
        {
            title: datas[0].namaProduk,
            subtitle: "",
            quantity: datas[0].jumlahPesanan,
            price: datas[0].itemUnitPrice,
            currency: "USD",
            image_url: API_URL + "/assets/produk/"+datas[0].image
        });



  callSendAPI(messageData);
}
 /*
 * Send a Structured Message (Generic Message type) using the Send API.(fungsi untuk melakukan pengiriman generic template message berupa produk yang di ambil dari sistem management order)
 *
 */
function sendGenericMessage(recipientId,datas) {
  var messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      attachment: {
        type: "template",
        payload: {
          template_type: "generic",
          elements: []
          
        }
      }
    }
  };  


  var i=0;
  datas.data.forEach(function(item){
    console.log(item.nama);
      messageData.message.attachment.payload.elements.push({
            title: item.nama,
            subtitle:"Harga:Rp."+item.harga+"\n Ukuran P="+item.length+" L="+item.width+" T="+item.height,
            item_url: "",               
            image_url: API_URL + "/uploads/produk/"+item.image,
            buttons: [{
              type: "web_url",
              url: item.url,
              title: "Open Web Url"
            }, {
              type: "postback",
              title: "Beli produk ini",
              payload: "Beli/"+item.productID,
            }],
      });

    i+=1;
  })

  // console.log(messageData.message.attachment.payload.elements);
  callSendAPI(messageData);
}

/*
 * Call the Send API. The message data goes in the body. If successful, we'll 
 * get the message id in a response 
 *
 */
function callSendAPI(messageData) {
  request({
    uri: 'https://graph.facebook.com/v2.6/me/messages',
    qs: { access_token: PAGE_ACCESS_TOKEN },
    method: 'POST',
    json: messageData

  }, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      var recipientId = body.recipient_id;
      var messageId = body.message_id;

      if (messageId) {
        console.log("Successfully sent message with id %s to recipient %s", 
          messageId, recipientId);
      } else {
      console.log("Successfully called Send API for recipient %s", 
        recipientId);
      }
    } else {
      console.error("Failed calling Send API", response.statusCode, response.statusMessage, body.error);
    }
  });  
}


// var server = require('http').createServer(app);
// var io=require('socket.io')(server);


// // var handleClient = function (socket) {
// //     // we've got a client connection
// //     socket.emit("tweet", {user: "nodesource", text: "Hello, world!"});
// // };

// // io.on("connection", handleClient);
// io.on('connection', function(socket){
//   console.log('a user connected');
//   socket.on('chat message', function(msg){
//     console.log('message: ' + msg);
//   });
// });

// var http = https.Server(app);
// var io = require('socket.io')(http);

// io.on('connection', function(socket){
//   console.log("connect");
//   socket.on('chat message', function(msg){
//     io.emit('chat message', msg);
//   });
// });