'use strict';

angular.module('myApp.dashboardServices',[])

.factory('dashboard',function($http,config){
	var services={};

	services.getGrafik=(productID)=>{
		return $http.get(config.apiUrl+'/products/grafik_penjualan_produk?productID='+productID,{
			headers:{'Authorization':'Basic YWRtaW46MTIzNA=='}
		}).success(function(data){});	
	}

	services.getOrderDeadline=(day)=>{
		return $http.get(config.apiUrl+'/statistics/orderDeadline?day='+day,{
			headers:{'Authorization':'Basic YWRtaW46MTIzNA=='}
		}).success(function(data){});	
	}

	services.getInvoices=()=>{
		return $http.get(config.apiUrl+'/statistics/invoice',{
			headers:{'Authorization':'Basic YWRtaW46MTIzNA=='}
		}).success(function(data){});	
	}

	services.getInfo=()=>{
		return $http.get(config.apiUrl+'/statistics/order',{
			headers:{'Authorization':'Basic YWRtaW46MTIzNA=='}
		}).success(function(data){});	
	}
	services.getSetting=()=>{
		return $http.get(config.apiUrl+'/setting/setting',{
			headers:{'Authorization':'Basic YWRtaW46MTIzNA=='}
		}).success(function(data){});	
	}
	return services;

});