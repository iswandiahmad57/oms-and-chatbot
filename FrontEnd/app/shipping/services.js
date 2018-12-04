'use strict';

angular.module('myApp.shippingServices',[])

.factory('shipping',function($http,config){
	var services={};

	services.get=(start=0,limit=1,search=null,sorting,keyword=null,itemByMonth,itemByStatus)=>{
		return $http.get(config.apiUrl+'/shipping/shipping?start='+start+'&limit='+limit+'&search='+search+'&keyword='+keyword+'&sort='+sorting+'&itemByMonth='+itemByMonth+'&itemByStatus='+itemByStatus,{
			headers:{'Authorization':'Basic YWRtaW46MTIzNA=='}
		}).success(function(data){});	
	}

	services.changeStatus=(status,id)=>{
		var data={'status':status,'id':id};
		return $http.put(config.apiUrl+'/shipping/changeStatus',data,{
			headers:{'Authorization':'Basic YWRtaW46MTIzNA=='}
		}).success(function(data){});
	}

	services.getDetail=(id)=>{
		return $http.get(config.apiUrl+'/shipping/shippingDetail?id='+id,{
			headers:{'Authorization':'Basic YWRtaW46MTIzNA=='}
		}).success(function(data){});
	}

	services.edit=(data)=>{
		return $http.put(config.apiUrl+'/shipping/shipping',data,{
			headers:{'Authorization':'Basic YWRtaW46MTIzNA=='}
		}).success(function(data){});
	}

	services.delete=(id)=>{
		return $http.delete(config.apiUrl+'/shipping/shipping?shippingID='+id,{
			headers:{'Authorization':'Basic YWRtaW46MTIzNA=='}
		}).success(function(data){});
	}

	return services;

});