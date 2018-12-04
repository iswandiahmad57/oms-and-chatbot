'use strict';

angular.module('myApp.orderServices',[])

.factory('order',function($http,config){
	var services={};

	services.get=(start=0,limit=1,search=null,sorting,keyword='nama',status=null,type,orderFrom)=>{
		return $http.get(config.apiUrl+'/orders/order?start='+start+'&limit='+limit+'&search='+search+'&keyword='+keyword+'&sort='+sorting+'&status='+status+'&type='+type+'&orderFrom='+orderFrom,{
			headers:{'Authorization':'Basic YWRtaW46MTIzNA=='}
		}).success(function(data){});	
	}
	services.getAllOrder=(start=0,limit=1,search=null,sorting,keyword=null)=>{
		return $http.get(config.apiUrl+'/orders/orderSim?start='+start+'&limit='+limit+'&search='+search+'&keyword='+keyword+'&sort='+sorting,{
			headers:{'Authorization':'Basic YWRtaW46MTIzNA=='}
		}).success(function(data){});	
	}
	services.getDetail=(id)=>{
		return $http.get(config.apiUrl+'/orders/order_detail?orderID='+id,{
			headers:{'Authorization':'Basic YWRtaW46MTIzNA=='}
		}).success(function(data){});
	}

	services.getOrderSimple=()=>{
		return $http.get(config.apiUrl+'/orders/order_simple',{
			headers:{'Authorization':'Basic YWRtaW46MTIzNA=='}
		}).success(function(data){});
	}
	services.cekStok=(id,qty,itemID=null)=>{
		return $http.get(config.apiUrl+'/orders/cekStok?productID='+id+'&qty='+qty+'&itemID='+itemID,{
			headers:{'Authorization':'Basic YWRtaW46MTIzNA=='}
		}).success(function(data){});
	}

	services.getItem=(id)=>{
		return $http.get(config.apiUrl+'/orders/order_item?orderID='+id,{
			headers:{'Authorization':'Basic YWRtaW46MTIzNA=='}
		}).success(function(data){});
	}

	services.changeStatus=(data)=>{
		return $http.put(config.apiUrl+'/orders/changeStatus',data,{
			headers:{'Authorization':'Basic YWRtaW46MTIzNA=='}
		}).success(function(data){});
	}

	



	services.delete_item=(id)=>{
		return $http.delete(config.apiUrl+'/orders/item?itemID='+id,{
			headers:{'Authorization':'Basic YWRtaW46MTIzNA=='}
		}).success(function(data){});
	}


	services.add=(data)=>{
		console.log(data);
		return $http.post(config.apiUrl+'/orders/order',data,{
			headers:{'Authorization':'Basic YWRtaW46MTIzNA=='}
		}).success(function(data){});
	}

	services.pengiriman=(data)=>{
		
		return $http.post(config.apiUrl+'/orders/pengiriman',data,{
			headers:{'Authorization':'Basic YWRtaW46MTIzNA=='}
		}).success(function(data){});
	}
	services.invoice=(data)=>{
		
		return $http.post(config.apiUrl+'/orders/invoice',data,{
			headers:{'Authorization':'Basic YWRtaW46MTIzNA=='}
		}).success(function(data){});
	}
	services.getShipment=(orderID)=>{
		return $http.get(config.apiUrl+'/orders/pengiriman?orderID='+orderID,{
			headers:{'Authorization':'Basic YWRtaW46MTIzNA=='}
		}).success(function(data){});
	}
	services.getInvoice=(orderID)=>{
		return $http.get(config.apiUrl+'/orders/invoice?orderID='+orderID,{
			headers:{'Authorization':'Basic YWRtaW46MTIzNA=='}
		}).success(function(data){});
	}
	



	services.edit=(data)=>{
		return $http.put(config.apiUrl+'/orders/order',data,{
			headers:{'Authorization':'Basic YWRtaW46MTIzNA=='}
		}).success(function(data){});
	}


	//send invoice and email by webhook url
	services.sendInvoiceMessenger=(messengerID,orderID)=>{
		return $http.get(config.webhookUrl+'/kirimInvoice?senderID='+messengerID+'&orderID='+orderID
		).success(function(data, status){}).error(function(data, status){
			console.log(status);
		});
	}

	//send notification pembaharuan status pesanan
	services.sendNotification=(messengerID,orderNumber,status)=>{
		return $http.get(config.webhookUrl+'/sendNotification?senderID='+messengerID+'&orderNumber='+orderNumber+'&orderStatus='+status
		).success(function(data){});
	}


	//send email 
	services.sendEmail=(email,orderID)=>{
		return $http.get(config.webhookUrl+'/sendingEmail?email='+email+'&orderID='+orderID
		).success(function(data, status){}).error(function(data,status){
		});
	}


	return services;

});