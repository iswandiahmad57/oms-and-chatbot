'use strict';

angular.module('myApp.customerServices',[])

.factory('customer',function($http,config){
	var services={};

	services.get=(start=0,limit=1,search=null,sorting,keyword='nama',type)=>{
		return $http.get(config.apiUrl+'/customers/customer?start='+start+'&limit='+limit+'&search='+search+'&keyword='+keyword+'&sort='+sorting+'&type='+type,{
			headers:{'Authorization':'Basic YWRtaW46MTIzNA=='}
		}).success(function(data){});	
	}
	services.getProduct=(start=0,limit=1,search=null,sorting,keyword='nama',jenis)=>{
		return $http.get(config.apiUrl+'/products/productSim?start='+start+'&limit='+limit+'&search='+search+'&keyword='+keyword+'&sort='+sorting+'&jenis='+jenis,{
			headers:{'Authorization':'Basic YWRtaW46MTIzNA=='}
		}).success(function(data){});	
	}
	services.getDetail=(id)=>{
		return $http.get(config.apiUrl+'/customers/customer_detail?customerID='+id,{
			headers:{'Authorization':'Basic YWRtaW46MTIzNA=='}
		}).success(function(data){});
	}
	services.invoiceHistory=(start=0,limit=1,id)=>{
		return $http.get(config.apiUrl+'/invoices/invoice_by_customer?start='+start+'&limit='+limit+'&customerID='+id,{
			headers:{'Authorization':'Basic YWRtaW46MTIzNA=='}
		}).success(function(data){});
	}

	services.getVariant=(id)=>{
		return $http.get(config.apiUrl+'/products/product_ByParent?productID='+id,{
			headers:{'Authorization':'Basic YWRtaW46MTIzNA=='}
		}).success(function(data){});
	}

	

	services.deleteCollect=(data)=>{
		return $http.post(config.apiUrl+'/customers/customerCollect',data,{
			headers:{'Authorization':'Basic YWRtaW46MTIzNA=='}
		}).success(function(data){});
	}

	services.delete=(id)=>{
		return $http.delete(config.apiUrl+'/customers/customer?customerID='+id,{
			headers:{'Authorization':'Basic YWRtaW46MTIzNA=='}
		}).success(function(data){});
	}


	services.add=(data)=>{
		console.log(data);
		return $http.post(config.apiUrl+'/customers/customer',data,{
			headers:{'Authorization':'Basic YWRtaW46MTIzNA=='}
		}).success(function(data){});
	}


	



	services.edit=(data)=>{
		return $http.put(config.apiUrl+'/customers/customer_edit',data,{
			headers:{'Authorization':'Basic YWRtaW46MTIzNA=='}
		}).success(function(data){});
	}
	return services;

});