'use strict';

angular.module('myApp.settingServices',[])

.factory('setting',function($http,config){
	var services={};

	services.get=()=>{
		return $http.get(config.apiUrl+'/setting/setting',{
			headers:{'Authorization':'Basic YWRtaW46MTIzNA=='}
		}).success(function(data){});	
	}


	services.send=(data)=>{

		return $http.post(config.apiUrl+'/setting/setting',data,{
			headers:{'Authorization':'Basic YWRtaW46MTIzNA=='}
		}).success(function(data){});
	}

	return services;

});