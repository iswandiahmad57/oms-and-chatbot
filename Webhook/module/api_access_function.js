
var auth = "Basic " + new Buffer('admin' + ":" + '1234').toString("base64");

const config = require('config');
const request= require('request');

exports.getInvoice=function(orderID,fn){
	var options = {
	  url: config.get('apiUrl')+'/orders/invoice_services?orderID='+orderID,
	  headers: {
	    "Authorization" : auth,
	    "content-type":"application/json"
	  }
	  // form:parameter
	};

    request.get(options, function(error,response,body){
      if (!error && response.statusCode == 200) {
        var info = JSON.parse(body);
        // console.log("coba",info);

        //dummy data
        // console.log(info);
      
        return fn(info);
     
      }else{
          
        return fn(null);
      }
    });
}
exports.sendKonfirmasiPembayaran=function(data,fn){

  var options = {
    url: config.get('apiUrl')+'/invoices/konfirmasi_pembayaran',
    headers: {
      "Authorization" : auth,
      "content-type":"application/json"
    },
    form:data
  };

    request.post(options, function(error,response,body){

      if (!error && response.statusCode == 200) {
        var info = JSON.parse(body);

        // console.log("coba",info);

        //dummy data
        // console.log(info);
        if(info.status==='Success'){
          return fn(true,'oke');
        }else if(info.status==='Error invoice'){
          return fn(false,'no invoice')
        }else{
          return fn(false,'o')
        }
      
        
     
      }else{
          
        return fn(false,'error');
      }
    });
}


//modul untuk mendapatkan data sesuai dengan parameter yang di inputkan oleh user

exports.getProdukData=function(parameter,fn){

    var options = {
      url: config.get('apiUrl')+'/products/produk_service',
      headers: {
        "Authorization" : auth,
        "content-type":"application/json"
      },
      form:parameter
    };


    request.post(options, function(error,response,body){
      console.log(error,"-----------------");
  
      if (!error && response.statusCode == 200) {
        var info = JSON.parse(body);
        // console.log("coba",info);

        //dummy data
        var dummy={"status":"Success","data":[{"productID":"4406a43c9eddea0a5810092ed856fb1b","no":"23","sku":"ppbg-dstr-01","nama":"paper bag distro","supplierID":"9","desc":"paper bag untuk keperluan distro anda","width":"20","height":"20","weight":"20","length":"20","categoryID":"41","jenis":"Single","image":"47d2d2c06ea70f1ab9c93011db30c6eb.png","harga":"2000","productParentID":null,"readystock":"Y","stok":"200","leftInHand":null},{"productID":"99b4b00210c8000cffffe0cecc7b400a","no":"24","sku":"ppbg-ksmtk-01","nama":"paper bag kosmetik","supplierID":null,"desc":"paper bag untuk kosmetik","width":"20","height":"20","weight":"20","length":"20","categoryID":null,"jenis":"Single","image":"e1175508e63ef3ab8eaedc4fc2a71be0.jpg","harga":"2000","productParentID":null,"readystock":"N","stok":null,"leftInHand":null},{"productID":"a845c7a11c87354548ba7476b6c2f7a9","no":"18","sku":"ppbg-smn-01","nama":"paper bag seminar","supplierID":"9","desc":"paper bag yang digunakan untuk seminar","width":"200","height":"200","weight":"20","length":"50","categoryID":"41","jenis":"Single","image":"47d2d2c06ea70f1ab9c93011db30c6eb.png","harga":"200","productParentID":null,"readystock":"Y","stok":"200","leftInHand":null}]};
        return fn(info);
     
      }else{
          var dummy={"status":"Error","data":[{"productID":"4406a43c9eddea0a5810092ed856fb1b","no":"23","sku":"ppbg-dstr-01","nama":"paper bag distro","supplierID":"9","desc":"paper bag untuk keperluan distro anda","width":"20","height":"20","weight":"20","length":"20","categoryID":"41","jenis":"Single","image":"47d2d2c06ea70f1ab9c93011db30c6eb.png","harga":"2000","productParentID":null,"readystock":"Y","stok":"200","leftInHand":null},{"productID":"99b4b00210c8000cffffe0cecc7b400a","no":"24","sku":"ppbg-ksmtk-01","nama":"paper bag kosmetik","supplierID":null,"desc":"paper bag untuk kosmetik","width":"20","height":"20","weight":"20","length":"20","categoryID":null,"jenis":"Single","image":"e1175508e63ef3ab8eaedc4fc2a71be0.jpg","harga":"2000","productParentID":null,"readystock":"N","stok":null,"leftInHand":null},{"productID":"a845c7a11c87354548ba7476b6c2f7a9","no":"18","sku":"ppbg-smn-01","nama":"paper bag seminar","supplierID":"9","desc":"paper bag yang digunakan untuk seminar","width":"200","height":"200","weight":"20","length":"50","categoryID":"41","jenis":"Single","image":"47d2d2c06ea70f1ab9c93011db30c6eb.png","harga":"200","productParentID":null,"readystock":"Y","stok":"200","leftInHand":null}]};
        return fn(dummy);
      }
    });

    
}


//untuk mendapatkan detail produk sesuai denga parameter yag di inputkan
exports.getProdukDetail=function(parameter,fn){

 
    var options = {
      url: config.get('apiUrl')+'/products/produk_detail?productID='+parameter,
      headers: {
        "Authorization" : auth,
        "content-type":"application/json"
      }
    };
    console.log(options.url);

    request.get(options, function(error,response,body){
      console.log(body);
      // console.log(response);
      if (!error && response.statusCode == 200) {
        var info = JSON.parse(body);
        // console.log("coba",info);

        //dummy data
        var dummy={"status":"Success","data":[{"productID":"4406a43c9eddea0a5810092ed856fb1b","no":"23","sku":"ppbg-dstr-01","nama":"paper bag distro","supplierID":"9","desc":"paper bag untuk keperluan distro anda","width":"20","height":"20","weight":"20","length":"20","categoryID":"41","jenis":"Single","image":"47d2d2c06ea70f1ab9c93011db30c6eb.png","harga":"2000","productParentID":null,"readystock":"Y","stok":"200","leftInHand":null}]};
        return fn(info);
     
      }else{
           var dummy={"status":"Error","data":[]};
        return fn(dummy);
      }
    });
}

exports.get_order=function(orderID){
    var options = {
      url: config.get('apiUrl')+'/customers/allCust',
      headers: {
        "Authorization" : auth
      }
    };

    request(options, function(error,response,body){
      if (!error && response.statusCode == 200) {
        var info = JSON.parse(body);
        console.log("coba",info['data'][0].customerName);

        for(var key in info['data']){
          for (var en in info['data'][key]){
            console.log(info['data'][key][en]);
          }
          
        }
     
      }
    });

}


exports.sendData=function(collectData,fn){
    var auth = "Basic " + new Buffer('admin' + ":" + '1234').toString("base64");
    var options = {
      url: config.get('apiUrl')+'/orders/order_services',
      headers: {
        "Authorization" : auth
      },
      form:collectData
    };

    request.post(options, function(error,response,body){
      console.log(response);

      if (!error && response.statusCode == 200) {
        var info = JSON.parse(body);

       

        // for(var key in info['data']){
        //   for (var en in info['data'][key]){
        //     console.log(info['data'][key][en]);
        //   }
          
        // }

        console.log("-------------=============",info);
        return fn(true,info);
     
      }else{
        var info={"status":"Error","data":{}}
        return fn(false,info);
      }
    });
}

exports.cekCustomer=function(messengerID, fn){
    var parameter={'messengerID':messengerID};
    var options = {
      url: config.get('apiUrl')+'/customers/customer_services?messengerID='+messengerID,
      headers: {
        "Authorization" : auth,
        "content-type":"application/json"
      }
    };



    request.get(options, function(error,response,body){

      if (!error && response.statusCode == 200) {

        var info = JSON.parse(body);
        console.log(info);
        if(info.status==="Success"){
          return fn(info.data,true);
        }else{
          return fn(null,false);
        }
        
     
      }else{
         return fn(null,false); 
      }
    });


    // //dummtt
    // return fn(null,true);
}

exports.cekOrder=function(orderNumber,fn){
    var options = {
      url: config.get('apiUrl')+'/orders/cek_order?orderNumber='+orderNumber,
      headers: {
        "Authorization" : auth
      }
    };

    request(options, function(error,response,body){
      if (!error && response.statusCode == 200) {
        var info = JSON.parse(body);

        if(info.status==="Success"){
        	return fn(info.data,true);
        }else{
        	return fn(null,false);
        }
     
      }else{

      	return fn(null,false);
      }
    });
}