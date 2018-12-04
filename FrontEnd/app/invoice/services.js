'use strict';

angular.module('myApp.invoiceServices',[])

.factory('invoice',function($http,config){
	var services={};

	services.get=(start=0,limit=1,search=null,sorting,keyword=null,itemByMonth,itemByStatus)=>{
		return $http.get(config.apiUrl+'/invoices/invoice?start='+start+'&limit='+limit+'&search='+search+'&keyword='+keyword+'&sort='+sorting+'&itemByMonth='+itemByMonth+'&itemByStatus='+itemByStatus,{
			headers:{'Authorization':'Basic YWRtaW46MTIzNA=='}
		}).success(function(data){});	
	}
	services.detail=(invoiceNumber)=>{
		return $http.get(config.apiUrl+'/invoices/detail?invoiceNumber='+invoiceNumber,{
			headers:{'Authorization':'Basic YWRtaW46MTIzNA=='}
		}).success(function(data){});	
	}

	services.changeStatus=(status,id)=>{
		var data={'status':status,'invoiceNumber':id};
		return $http.put(config.apiUrl+'/invoices/changeStatus',data,{
			headers:{'Authorization':'Basic YWRtaW46MTIzNA=='}
		}).success(function(data){});
	}
	services.delete=(id)=>{
		return $http.delete(config.apiUrl+'/invoices/invoice?invoiceNumber='+id,{
			headers:{'Authorization':'Basic YWRtaW46MTIzNA=='}
		}).success(function(data){});
	}

	services.getKonfirmasi=()=>{
		return $http.get(config.apiUrl+'/invoices/konfirmasi',{
			headers:{'Authorization':'Basic YWRtaW46MTIzNA=='}
		}).success(function(data){});	
	}
	services.sendNotification=(messengerID,orderNumber,status)=>{
		return $http.get(config.webhookUrl+'/sendNotification?senderID='+messengerID+'&orderNumber='+orderNumber+'&orderStatus='+status
		).success(function(data){});
	}
	return services;

});