'use strict';

angular.module('myApp.productServices',[])

.factory('product',function($http,config){
	var services={};

	services.get=(start=0,limit=1,search=null,sorting,keyword='nama',jenis)=>{
		return $http.get(config.apiUrl+'/products/product?start='+start+'&limit='+limit+'&search='+search+'&keyword='+keyword+'&sort='+sorting+'&jenis='+jenis,{
			headers:{'Authorization':'Basic YWRtaW46MTIzNA=='}
		}).success(function(data){});	
	}

	services.getSimple=()=>{
		return $http.get(config.apiUrl+'/products/productSimple',{
			headers:{'Authorization':'Basic YWRtaW46MTIzNA=='}
		}).success(function(data){});	
	}
	services.getProduct=(start=0,limit=1,search=null,sorting,keyword='nama',jenis)=>{
		return $http.get(config.apiUrl+'/products/productSim?start='+start+'&limit='+limit+'&search='+search+'&keyword='+keyword+'&sort='+sorting+'&jenis='+jenis,{
			headers:{'Authorization':'Basic YWRtaW46MTIzNA=='}
		}).success(function(data){});	
	}
	services.getDetail=(id)=>{
		return $http.get(config.apiUrl+'/products/product_by?productID='+id,{
			headers:{'Authorization':'Basic YWRtaW46MTIzNA=='}
		}).success(function(data){});
	}
	services.getVariant=(id)=>{
		return $http.get(config.apiUrl+'/products/product_ByParent?productID='+id,{
			headers:{'Authorization':'Basic YWRtaW46MTIzNA=='}
		}).success(function(data){});
	}

	

	services.deleteCollect=(data)=>{
		return $http.post(config.apiUrl+'/products/productCollect',data,{
			headers:{'Authorization':'Basic YWRtaW46MTIzNA=='}
		}).success(function(data){});
	}

	services.delete=(id)=>{
		return $http.delete(config.apiUrl+'/products/product?productID='+id,{
			headers:{'Authorization':'Basic YWRtaW46MTIzNA=='}
		}).success(function(data){});
	}


	services.add=(data)=>{
		console.log(data);
		return $http.post(config.apiUrl+'/products/product_single',data,{
			headers:{'Authorization':'Basic YWRtaW46MTIzNA=='}
		}).success(function(data){});
	}
	services.addVariant=(data)=>{
		console.log(data);
		return $http.post(config.apiUrl+'/products/product_variant',data,{
			headers:{'Authorization':'Basic YWRtaW46MTIzNA=='}
		}).success(function(data){});
	}
	

	services.addCategory=(data)=>{
		console.log(data);
		return $http.post(config.apiUrl+'/products/category',data,{
			headers:{'Authorization':'Basic YWRtaW46MTIzNA=='}
		}).success(function(data){});
	}
	services.addSupplier=(data)=>{
		console.log(data);
		return $http.post(config.apiUrl+'/products/supplier',data,{
			headers:{'Authorization':'Basic YWRtaW46MTIzNA=='}
		}).success(function(data){});
	}

	services.getCategory=()=>{
		return $http.get(config.apiUrl+'/products/category',{
			headers:{'Authorization':'Basic YWRtaW46MTIzNA=='}
		}).success(function(data){});		
	}
	services.deleteCategory=(id)=>{
		return $http.delete(config.apiUrl+'/products/category?categoryID='+id,{
			headers:{'Authorization':'Basic YWRtaW46MTIzNA=='}
		}).success(function(data){});
	}
	services.edit=(data)=>{
		return $http.post(config.apiUrl+'/products/product_edit',data,{
			headers:{'Authorization':'Basic YWRtaW46MTIzNA=='}
		}).success(function(data){});
	}

	services.getGrafik=(productID)=>{
		return $http.get(config.apiUrl+'/products/grafik_penjualan_produk?productID='+productID,{
			headers:{'Authorization':'Basic YWRtaW46MTIzNA=='}
		}).success(function(data){});	
	}

	services.getSuppliers=()=>{
		return $http.get(config.apiUrl+'/products/supplier',{
			headers:{'Authorization':'Basic YWRtaW46MTIzNA=='}
		}).success(function(data){});		
	}
	services.getSupplierID=(id)=>{
		return $http.get(config.apiUrl+'/products/supplierID?id='+id,{
			headers:{'Authorization':'Basic YWRtaW46MTIzNA=='}
		}).success(function(data){});		
	}
	services.deleteSupplier=(id)=>{
		return $http.delete(config.apiUrl+'/products/supplier?id='+id,{
			headers:{'Authorization':'Basic YWRtaW46MTIzNA=='}
		}).success(function(data){});
	}

	services.editSupplier=(data,id)=>{
		return $http.put(config.apiUrl+'/products/supplier?id='+id,data,{
			headers:{'Authorization':'Basic YWRtaW46MTIzNA=='}
		}).success(function(data){});
	}
	return services;

});