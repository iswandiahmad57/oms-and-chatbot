'use strict';

angular.module('myApp.pegawaiServices',[])

.factory('employe',function($http,config){
	var services={};

	services.addPegawai=(data)=>{
		return $http.post(config.apiUrl+'/employes/employe',data,{
			headers:{'Authorization':'Basic YWRtaW46MTIzNA=='}
		}).success(function(data){});	
	}

	services.get=(start=0,limit=1,search=null,sorting,keyword='nama')=>{
		return $http.get(config.apiUrl+'/employes/employe?start='+start+'&limit='+limit+'&search='+search+'&keyword='+keyword+'&sort='+sorting,{
			headers:{'Authorization':'Basic YWRtaW46MTIzNA=='}
		}).success(function(data){});	
	}

	services.getDetail=(id)=>{
		return $http.get(config.apiUrl+'/employes/employe_detail?employeID='+id,{
			headers:{'Authorization':'Basic YWRtaW46MTIzNA=='}
		}).success(function(data){});
	}

	services.delete=(id)=>{
		return $http.delete(config.apiUrl+'/employes/employe?employeID='+id,{
			headers:{'Authorization':'Basic YWRtaW46MTIzNA=='}
		}).success(function(data){});
	}

	services.deleteCollect=(data)=>{
		return $http.post(config.apiUrl+'/employes/employeCollect',data,{
			headers:{'Authorization':'Basic YWRtaW46MTIzNA=='}
		}).success(function(data){});
	}


	services.edit=(data)=>{
		return $http.put(config.apiUrl+'/employes/employe',data,{
			headers:{'Authorization':'Basic YWRtaW46MTIzNA=='}
		}).success(function(data){});
	}
	return services;

});