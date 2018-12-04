'use strict';

angular.module('myApp.view1', ['ui.router','angularUtils.directives.dirPagination','ngTable'])

.config(['$stateProvider', function($stateProvider) {
  // $routeProvider.when('/view1', {
  //   templateUrl: 'view1/view1.html',
  //   controller: 'View1Ctrl'
  // });
  $stateProvider

        // HOME STATES AND NESTED VIEWS ========================================
        .state('view1', {
            url: '/view1',
		    views: {

		        // the main template will be placed here (relatively named)
		        '': { templateUrl: 'view1/view1.html',controller: 'View1Ctrl' },


		        // main sidebar diletakkan di setiap module angularjs 
		        'main-sidebar@view1': { 
		            templateUrl: '../app/template/layout/sidebar1.html',
		            
		        },
		        'secondary-sidebar@view1':{
		        	templateUrl:'view1/view/action-button.html',
		        	controller:'ActionController'
		        }
		    },
            data:{
                  authorizedRoles: ["Pegawai"]
            },resolve:{

                //cek koneksi terlebih dahulu
                cekConnection:function($q){
                    return $q.resolve();
                }
            }
        }).state('productDetail',{
            url:'/productDetail/:productID',
            views: {
                '':{templateUrl:'view1/productDetail.html',controller:'ProductDetailCtrl'},
                // main sidebar diletakkan di setiap module angularjs 
                'main-sidebar@productDetail': { 
                    templateUrl: '../app/template/layout/sidebar1.html',
                    
                },
                'productSide@productDetail':{
                    templateUrl:'view1/view/productSide.html',
                    controller:'productSideCtrl',
                }
            },
            data:{
                  authorizedRoles: ["Pegawai"]
            },resolve:{

                //cek koneksi terlebih dahulu
                cekConnection:function($q){
                    return $q.resolve();
                }
            }
        });
}])
.directive('grafikBar',function(){
    return {
        restrict: 'C',
        link: function (scope, elem, attrs) {
            // directive is called once for each chart
            var myChart = echarts.init(elem[0]);

            // listen to option changes
            if (attrs.eoption) {
                scope.$watch(attrs['eoption'], function() {

                    var option = scope.$eval(attrs.eoption);
                    console.log(option);
                    if (angular.isObject(option)) {
                        myChart.setOption(option);
                    }
                }, true); // deep watch
            }
        }
    }
})
.directive('ngThumb', ['$window', function($window) {
        var helper = {
            support: !!($window.FileReader && $window.CanvasRenderingContext2D),
            isFile: function(item) {
                return angular.isObject(item) && item instanceof $window.File;
            },
            isImage: function(file) {
                var type =  '|' + file.type.slice(file.type.lastIndexOf('/') + 1) + '|';
                return '|jpg|png|jpeg|bmp|gif|'.indexOf(type) !== -1;
            }
        };

        return {
            restrict: 'A',
            template: '<canvas/>',
            link: function(scope, element, attributes) {
                if (!helper.support) return;

                var params = scope.$eval(attributes.ngThumb);

                if (!helper.isFile(params.file)) return;
                if (!helper.isImage(params.file)) return;

                var canvas = element.find('canvas');
                var reader = new FileReader();

                reader.onload = onLoadFile;
                reader.readAsDataURL(params.file);

                function onLoadFile(event) {
                    var img = new Image();
                    img.onload = onLoadImage;
                    img.src = event.target.result;
                }

                function onLoadImage() {
                    var width = params.width || this.width / this.height * params.height;
                    var height = params.height || this.height / this.width * params.width;
                    canvas.attr({ width: width, height: height });
                    canvas[0].getContext('2d').drawImage(this, 0, 0, width, height);
                }
            }
        };
}])
.controller('View1Ctrl', ['$http','$scope','config','product','FileUploader','SweetAlert','DTOptionsBuilder','DTColumnBuilder','$q',function($http,$scope,config,product,FileUploader,SweetAlert,DTOptionsBuilder,DTColumnBuilder,$q) {

	$scope.pageName='';

    $scope.url='http://localhost/hdkreasi';
	$scope.breadcrumb='';
    $scope.form={'productID':'','sku':'','nama':'','desc':'','readystock':'','stok':'','categoryID':'','supplierID':'','image':'','harga':'','width':'','height':'','length':'','weight':'','warna':'','JenisKertas':''};
    $scope.newForm={};
    $scope.formVariant=[{'id':'1'}];
    $scope.variants={};




	var vm=this;
	vm.product=[];
	vm.pageno=1;
	vm.total_count=0;
	vm.sorting="desc";

    $scope.jenisProduk="Single";
    $scope.editImage=false;

	
	vm.itemsPerPage=10;
	vm.search='null';
	vm.keywordSearch='nama';
	$scope.search="";
    $scope.operation="Add";

	$scope.option=[
		{name:'10',value:'1'},
		{name:'20',value:'20'},
		{name:'30',value:'30'},
		{name:'40',value:'40'},
		{name:'50',value:'50'},
		{name:'60',value:'60'},
		{name:'70',value:'70'},
		{name:'80',value:'80'},
		{name:'90',value:'90'},
		{name:'100',value:'100'},

		];

    $scope.warna=[{name:'Full Colour',value:'Full Colour'},{name:'One Colour',value:'One Colour'}];
    $scope.jenisKertas=[{name:'Art Paper',value:'Art Paper'},{name:'Craft Putih',value:'Craft Putih'},{name:'Craft Cokelat',value:'Craft Cokelat'}];
    $scope.form.JenisKertas=$scope.jenisKertas[0].value;
    $scope.form.warna=$scope.warna[0].value;


	$scope.select={type:$scope.option[0].value};

    var requireForm=['sku','nama'];

	//fungsi untuk mendapatkan data product
	vm.getProduct=(pageno,search=null)=>{

		product.get(pageno,vm.itemsPerPage,vm.search,vm.sorting,vm.keywordSearch,$scope.jenisProduk).then(function(result){
	
			vm.product=result.data.data;
			vm.total_count=result.data.total_row;
			console.log(result.data.total_row);
			console.log(result.data.data);
	
		});
	}
	//when page start load the data;
	vm.getProduct(vm.pageno,vm.search);

    $scope.reload=()=>{
        alert("asdfasdfasdf");
    }

	$scope.searches=()=>{

		vm.search=$scope.search;
		if($scope.search==''){

			vm.search='null'
		}
		$scope.filter=vm.getProduct(1,vm.search);
		
	}

	$scope.rel=function(){
		vm.itemsPerPage=$scope.select.type;
		console.log($scope.select.type);
		vm.getProduct(vm.pageno,vm.search);
	}

	$scope.reloadData=()=>{
        vm.search='null';
		vm.getProduct(vm.pageno);
	}


    $scope.sortClick=(type)=>{
    	if(type=='asc'){
    		$scope.asc='active';
    		vm.sorting='asc';
    		$scope.desc='';
    	}else{
    		$scope.desc='active';
    		vm.sorting='desc';
    		$scope.asc='';
    	}

    	vm.getProduct(vm.pageno,vm.search);

    }

    $scope.keywordSearchSet=(keyword)=>{
    	vm.keywordSearch=keyword;
    	console.log(vm.keywordSearch);
    }
    //uploader
        //init uploader
    var uploader = $scope.uploader = new FileUploader({
              url: config.apiUrl+'/products/uploadmedia',
              queueLimit:2,
              headers:{'Authorization':'Basic YWRtaW46MTIzNA=='}
    });
   // FILTERS




    $scope.editButton=function(id){
       $scope.form.JenisKertas=$scope.jenisKertas[0].value;
        $scope.form.warna=$scope.warna[0].value;
        validator.resetForm();
    	$('#modal_theme_primary').modal('show');
       
        // console.log($scope.editImage);
        $scope.operation="Edit";
        




        $scope.categoryData=[];
        product.getCategory().then(function(returnData){
            $scope.categoryData=returnData.data.data;
        })
        $scope.supplierData=[];
        product.getSuppliers().then(function(returnData){
            $scope.supplierData=returnData.data.data;
        })

        if($scope.jenisProduk=='Single'){
            product.getDetail(id).then(function(response){
                    $scope.form.productID=response.data.data.productID;
                    $scope.form.sku=response.data.data.sku;
                    $scope.form.nama=response.data.data.nama;
                    $scope.form.categoryID=response.data.data.categoryID;
                    $scope.form.supplierID=response.data.data.supplierID;
                    $scope.form.desc=response.data.data.desc;
                    $scope.form.readystock=response.data.data.readystock;
                    $scope.form.harga=response.data.data.harga;
                    $scope.form.width=response.data.data.width;
                    $scope.form.height=response.data.data.height;
                    $scope.form.length=response.data.data.length;
                    $scope.form.weight=response.data.data.weight;
                    $scope.form.stok=response.data.data.stok-response.data.data.leftInHand;
                    $scope.form.image=response.data.data.image;
                    $scope.typeProduct=response.data.data.readystock;
                    $scope.form.JenisKertas=response.data.data.JenisKertas;
                    $scope.form.warna=response.data.data.warna;
                  

                    $scope.form.url=response.data.data.url;


                    if(response.data.data.image!=null){
                         $scope.editImage=true;
                    }

            }) 
   
        }else{

            product.getDetail(id).then(function(response){
                    $scope.form.productID=response.data.data.productID;
                    $scope.form.sku=response.data.data.sku;
                    $scope.form.nama=response.data.data.nama;
                    $scope.form.categoryID=response.data.data.categoryID;

                    $scope.form.supplierID=response.data.data.supplierID;
                    $scope.form.desc=response.data.data.desc;
                    $scope.form.readystock=response.data.data.readystock;
                    $scope.form.harga=response.data.data.harga;
                    $scope.form.width=response.data.data.width;
                    $scope.form.height=response.data.data.height;
                    $scope.form.length=response.data.data.length;
                    $scope.form.weight=response.data.data.weight;
                    $scope.form.stok=response.data.data.stok-response.data.data.leftInHand;;
                    $scope.form.image=response.data.data.image;

                    $scope.form.url=response.data.data.url;
                    //get Variant

                    product.getVariant(response.data.data.productID).then(function(variant){
                        $scope.variants=variant.data.data;
                    })
                    if(response.image!=null){
                         $scope.editImage=true;
                    }

            })
        }


    }
    $scope.formModals=()=>{
        // Reset form
        
       
        $scope.editImage=false;
        validator.resetForm();
      $("input[type=text], textarea").val("");
      $('input[type=file]').val('');
      console.log($scope.editImage);
        // $scope.form.readystock='Y';

        $scope.categoryData=[];
        product.getCategory().then(function(returnData){
            $scope.categoryData=returnData.data.data;
        })

        $scope.supplierData=[];
        product.getSuppliers().then(function(returnData){
            $scope.supplierData=returnData.data.data;
        })
        $scope.form.JenisKertas=$scope.jenisKertas[0].value;
        $scope.form.warna=$scope.warna[0].value;

      $("#modal_theme_primary").modal('show');


  

    }

    $scope.categ=[];
    $scope.categor = {};
    $scope.supplier={'name':'','contact_phone':'','contact_email':'','address':''};
    $scope.suppliers={};

        $scope.getProCategory=()=>{
           
                product.getCategory().then(function(returnData){
                    
                    $scope.categor=returnData.data.data;
                    console.log(returnData.data.data);

                })

               
        }
        $scope.getSuppliers=()=>{
           
                product.getSuppliers().then(function(returnData){
                        $scope.suppliers=returnData.data.data;
              
                    

                })


               
        }


$scope.getProCategory();
$scope.getSuppliers();
  $scope.currentPage = 1;
  $scope.pageSize = 10;
    $scope.pageChangeHandler = function(num) {
      console.log('meals page changed to ' + num);
  };

    $scope.formModalsType=(type)=>{
        // Reset form
          $("input[type=text], textarea").val("");
        
        if(type==='category'){
             $("#modal_theme_category").modal('show');
              

        }else{
             $("#modal_theme_supplier").modal('show');
        }
    }


    $scope.closeModalType=(type)=>{
        if(type==='category'){
             $scope.categoryName="";
             $("#modal_theme_category").modal('hide');
        }else{
            $scope.supplier={'name':'','contact_phone':'','contact_email':'','address':''};
             $("#modal_theme_supplier").modal('hide');
        }


        
    }

    $scope.editSupplier=false;
    $scope.supplierID="";
    $scope.editSup=(id)=>{
        $scope.editSupplier=true;
        product.getSupplierID(id).then(function(result){
            $scope.supplierID=id;
            $scope.supplier={'name':result.data.data.name,'contact_phone':result.data.data.contact_phone
                            ,'contact_email':result.data.data.contact_email,'address':result.data.data.address};
        })
    }

    $scope.cancelEdit=()=>{
        $scope.editSupplier=false;
         $scope.supplier={'name':'','contact_phone':'','contact_email':'','address':''};
    }
    $scope.submitType=(type)=>{
        if(type==='category'){
           
            product.addCategory({'name':$scope.categoryName}).then(function(response){
                if(response.data.status=='Success'){
                   
                    swal("Info!", "Berhasil Ditambahkan.", "success");

                    
                     var newCat={'categoryID':(parseInt($scope.categor[$scope.categor.length-1].categoryID)+1),'name':$scope.categoryName};
                     // console.log(newCat);
                     // $scope.categor.push(angular.copy(newCat));
                     // console.log($scope.categor);
                     $scope.getProCategory();
                }else{
                    swal("Gagal!", "Gagal Ditambahkan.", "error");
                }


            })
        }else{

            if($scope.editSupplier){
 
                product.editSupplier($scope.supplier,$scope.supplierID).then(function(response){
                    if(response.data.status=='Success'){
                       
                        swal("Info!", "Berhasil Ditambahkan.", "success");

                        
                    
                         // console.log(newCat);
                         // $scope.categor.push(angular.copy(newCat));
                         // console.log($scope.categor);
                         $scope.getSuppliers();
                          $scope.supplier={'name':'','contact_phone':'','contact_email':'','address':''};
                    }else{
                        swal("Gagal!", "Gagal Ditambahkan.", "error");
                    }
                })
            }else{
                product.addSupplier($scope.supplier).then(function(response){
                    if(response.data.status=='Success'){
                       
                        swal("Info!", "Berhasil Diedit.", "success");

                        
                    
                         // console.log(newCat);
                         // $scope.categor.push(angular.copy(newCat));
                         // console.log($scope.categor);
                         $scope.getSuppliers();
                          $scope.supplier={'name':'','contact_phone':'','contact_email':'','address':''};
                    }else{
                        swal("Gagal!", "Gagal Ditambahkan.", "error");
                    }
                })
            }

        }        
    }

    $scope.deleteType=(id,type)=>{
        if(type==='category'){
            
            product.deleteCategory(id).then(function(response){
                if(response.data.status=='Success'){
                    swal("Info!", "Berhasil Dihapus.", "success");
                }else{
                    swal("Gagal!", "Gagal dihapus.", "error");
                }
                 $scope.getProCategory();
            })
        }else{


            product.deleteSupplier(id).then(function(response){
                if(response.data.status=='Success'){
                    swal("Info!", "Berhasil Dihapus.", "success");

                }else{
                    swal("Gagal!", "Gagal dihapus.", "error");
                }

                 $scope.getSuppliers();
            })

            
        }     
    }

    $scope.closeModal=()=>{
         $scope.formVariant.length=1;
         $scope.formVariant=[{'id':'1'}];
         // $scope.form=undefined;
          $scope.form={'productID':'','sku':'','nama':'','desc':'','readystock':'','stok':'','categoryID':'','supplierID':'','image':'','harga':'','width':'','height':'','length':'','weight':'','warna':'','JenisKertas':''};
    $scope.form.JenisKertas=$scope.jenisKertas[0].value;
    $scope.form.warna=$scope.warna[0].value;
        $scope.operation="Add";
        $("#modal_theme_primary").modal('hide');
        console.log($scope.operation);
        $scope.editImage=false;

        if(uploader.queue.length != 0){
                $http.post(config.apiUrl+'/products/unlink',{'namaFile':$scope.form.image},{
                    headers:{'Authorization':'Basic YWRtaW46MTIzNA=='}
                 });
            uploader.queue[0].remove();
            
        }

        
    }
	//submit form

	$scope.submit=()=>{
		$scope.form.jenis="Single";
        var cek=1;
        for (var i =0; i < requireForm.length; i++) {
            if($scope.form+'.'+requireForm[i]!=""){
                cek=cek+i;
            }
        }

        console.log($scope.operation);
         
        if($('#form').valid()){
            if(cek == requireForm.length){
                if($scope.operation=="Add"){
                    if($scope.jenisProduk=='Single'){
                        
                        product.add($scope.form).then(function(response){
                            // console.log(response.data.data.sku);
                            if(response.data.status=="Error"){
                                swal({title:response.data.data[0].sku,type:"error",closeOnConfirm:true});
                            }else if(response.data.status=="Success"){
                                vm.getProduct(1);
                                swal("Data produk berhasil di inputkan","success");
                                $("#modal_theme_primary").modal('hide');
                            }else{
                                swal("Telah terjadi error, silahkan coba lagi","error");
                                $("#modal_theme_primary").modal('hide');
                            }
                        })      
                    }
                    // else{

                    //     //proses penambahan produk yang memiliki variant
                    //     $scope.form.jenis='parent';
                    //     $scope.formVariant.jenis='variant';

                    //     $scope.fo={'produk_parent':$scope.form,'produk_child':$scope.formVariant,'produk_variant':[{'type':'color'},{'type':'Laminasi'}]};
                    //     console.log($scope.fo);
                    //     product.addVariant($scope.fo).then(function(response){
                    //         console.log(response.data.data.sku);
                    //         if(response.data.status=="Error"){
                    //             swal({title:response.data.data[0].sku,type:"error",closeOnConfirm:true});
                    //         }else{
                    //             vm.getProduct(1);
                    //         }
                    //     })     
                    // }
    
                }else{
                
                    product.edit($scope.form).then(function(response){
                        if(response.data.status=="Error"){
                            swal({title:response.data.data[0].sku,type:"error",closeOnConfirm:true});
                        }else if(response.data.status="Success"){
                            vm.getProduct(1);
                            swal("Success", "Data Berhasil Diubah.", "success");
                            $("#modal_theme_primary").modal('hide');

                        }else{
                            swal("Telah terjadi error, silahkan coba lagi","error");
                        }
                    })
                }

                
      
                

            }else{
                console.log('oononon');
            }
        }

	}

      
    // CALLBACKS UPLOADEr

    uploader.onWhenAddingFileFailed = function(item /*{File|FileLikeObject}*/, filter, options) {
        console.info('onWhenAddingFileFailed', item, filter, options);
    };
    uploader.onAfterAddingFile = function(fileItem) {
          console.info('cek',this.getNotUploadedItems().length);
          console.info('ob',this.getNotUploadedItems()[0].file.name);

        //jika operasi edit maka gambar lama akan dihapus
        if($scope.operation=='Edit' && $scope.form.image!=''){
           $scope.removeFile();
            $scope.editImage=false; 
        }
         if(uploader.queue.length> 1){
            uploader.removeFromQueue(0);
            $scope.postData={'namaFile':$scope.form.image};
            //+btoa(username+":"+password);
			$http.post(config.apiUrl+'/products/unlink',{'namaFile':$scope.form.image},{
				headers:{'Authorization':'Basic YWRtaW46MTIzNA=='}
			});
          };
          
	       for (var i =0; i < this.getNotUploadedItems().length-1; i++) {
	         if(this.getNotUploadedItems()[i].file.name == fileItem.file.name){
	           this.removeFromQueue(i);
	         }

	        }

	   
        console.info('onAfterAddingFile', fileItem);
        uploader.uploadItem(fileItem);
        
    };

    uploader.onCompleteItem = function(fileItem, response, status, headers) {
        console.info('onCompleteItem', fileItem, response, status, headers);

        if(response.status=="Success" ){
          $scope.form.image=response.newname;
        }

        console.log($scope.form.image);

    };

    $scope.removeFile=()=>{

        if($scope.operation=='Add' || $scope.editImage==false){
             uploader.queue[0].remove();
        }
       

    	
	   $scope.postData={'namaFile':$scope.form.image};
        //+btoa(username+":"+password);
		$http.post(config.apiUrl+'/products/unlink',{'namaFile':$scope.form.image},{
			headers:{'Authorization':'Basic YWRtaW46MTIzNA=='}
		});

    	$scope.form.image='';
    	$('input[type=file]').val('');

    	
    }





    //remove single data
    $scope.removeData=(id)=>{
        swal({
         title: "Are you sure?",
         text: "Data will Be Deleted",
         type: "warning",
         showCancelButton: true,
         confirmButtonColor: "#DD6B55",confirmButtonText: "Yes, delete it!",
         cancelButtonText: "No, cancel !",
         closeOnConfirm: false,
         closeOnCancel: false }, 
          function(isConfirm){ 
              if(isConfirm){

                product.delete(id).then(function(response){
                    console.log(response);

                     if (response.data.status=="Success") {
                        swal("Deleted!", "Data Berhasil Dihapus.", "success");

                        $scope.reloadData();
                     } else {
                        swal("Gagal Menghapus :(", "error");
                     }
                    
                });
              }else{
                swal("Cancelled", "Deleted Cancelled:)", "error");
              }

        });

    }

    $scope.removeVar=(id,productID)=>{
        swal({
         title: "Are you sure?",
         text: "Data will Be Deleted",
         type: "warning",
         showCancelButton: true,
         confirmButtonColor: "#DD6B55",confirmButtonText: "Yes, delete it!",
         cancelButtonText: "No, cancel !",
         closeOnConfirm: false,
         closeOnCancel: false }, 
          function(isConfirm){ 
              if(isConfirm){

                product.delete(id).then(function(response){
                    console.log(response);

                     if (response.data.status="Success") {
                      product.getVariant(productID).then(function(variant){
                            
        
                               $scope.variants=variant.data.data; 
                        })
                        swal("Deleted!", "Data Berhasil Dihapus.", "success");


                     } else {
                        swal("Cancelled", "Deleted Cancelled :)", "error");
                     }
                    
                });
              }else{
                swal("Cancelled", "Deleted Cancelled:)", "error");
              }

        });

    }
    //remove multiple data
    $scope.checkAll = function () {
        if (!$scope.selectedAll) {
            $scope.selectedAll = false;
        } else {
            $scope.selectedAll = true;
        }
        angular.forEach(vm.product, function(productD) {
            productD.selected = $scope.selectedAll;
        });
    };    


    $scope.removeSelected = function(){
        var newDataList=[];
        
        var productIDCollect=[];
        var i=0;

        angular.forEach(vm.product, function(selected){
            if(selected.selected==true){
               productIDCollect[i]=selected.productID; 
                i++;
            }
            
        }); 

        if(productIDCollect.length < 1){
             swal("Cancelled", "Tidak ada Data dipilih:)", "error");
        }else{
            swal({
             title: "Are you sure?",
             text: productIDCollect.length +" data akan dihapus",
             type: "warning",
             showCancelButton: true,
             confirmButtonColor: "#DD6B55",confirmButtonText: "Yes, delete it!",
             cancelButtonText: "No, cancel !",
             closeOnConfirm: false,
             closeOnCancel: false }, 
              function(isConfirm){ 
                  if(isConfirm){

                    product.deleteCollect(productIDCollect).then(function(response){
                        console.log(response);

                         if (response.data.status="Success") {
                            swal("Deleted!", "Data Berhasil Dihapus.", "success");
                            $scope.selectedAll = false;
                            $scope.reloadData();
                         } else {
                            $scope.selectedAll = false;
                            swal("Cancelled", "Deleted Cancelled :)", "error");

                         }
                        
                    });
                  }else{
                    swal("Cancelled", "Deleted Cancelled:)", "error");
                  }

            });
        }

    };




    //tab
    $scope.singleProduk=()=>{
        $scope.jenisProduk="Single";
        console.log($scope.jenisProduk);
        $scope.reloadData();
    }
    $scope.variantProduk=()=>{
        $scope.jenisProduk="Variant";
        console.log($scope.jenisProduk);
        $scope.reloadData();
    }

      // $scope.addNewVariant = function() {
      //   var newItemNo = $scope.formVariant.length+1;
      //   console.log($scope.formVariant);
      //   $scope.formVariant.push({'id':newItemNo});
      // };
        
      // $scope.removeVariant = function() {
      //   var lastItem = $scope.formVariant.length-1;
      //   $scope.formVariant.splice(lastItem);
      // };
      // $scope.detail=(id)=>{
        
      // }

}])

.controller('ProductDetailCtrl',['$http','$scope','config','product','FileUploader','SweetAlert','$stateParams','$timeout',function($http,$scope,config,product,FileUploader,SweetAlert,$stateParams,$timeout){

    var productID=$stateParams.productID;
    $scope.url=config.apiUrl;
    console.log($scope.coba);


    //get Detail information of product from parameter passes by parameter name product ID
    $scope.product={};
    $scope.getProduct=(id)=>{
        product.getDetail(id).then(function(product){
            $scope.product=product.data.data;
            console.log(product);

        });
       
    }

    $scope.getProduct(productID);




  $scope.labels = ['2006', '2007', '2008', '2009', '2010', '2011', '2012'];
  $scope.series = ['Series A', 'Series B'];

  $scope.data = [
    [65, 59, 80, 81, 56, 55, 40],
    [28, 48, 40, 19, 86, 27, 90]
  ];
  //data for echartsjs


    $scope.grafik={};
    $scope.dataGrafik=[];
    $scope.getGrafik=(id)=>{
        console.log($scope.product.productID);
        product.getGrafik(id).then(function(result){
            $scope.grafik=result.data.data;


            if($scope.grafik!=null){
                $scope.dataGrafik[0]=$scope.grafik[0].january;
                $scope.dataGrafik[1]=$scope.grafik[0].februari;
                $scope.dataGrafik[2]=$scope.grafik[0].maret;
                $scope.dataGrafik[3]=$scope.grafik[0].april;
                $scope.dataGrafik[4]=$scope.grafik[0].mei;
                $scope.dataGrafik[5]=$scope.grafik[0].juni;
                $scope.dataGrafik[6]=$scope.grafik[0].juli;
                $scope.dataGrafik[7]=$scope.grafik[0].agustus;
                $scope.dataGrafik[8]=$scope.grafik[0].september;
                $scope.dataGrafik[9]=$scope.grafik[0].oktober;
                $scope.dataGrafik[10]=$scope.grafik[0].november;
                $scope.dataGrafik[12]=$scope.grafik[0].desember;
                console.log($scope.dataGrafik);


                $scope.eoption = {
                        title: {
                            text: ''
                        },
                        tooltip: {},
                        legend: {
                            data:['Sales']
                        },
                        xAxis: {
                            boundaryGap: ['20%', '20%'],
                            alignWithLabel:true,
                            data: ["Januari","Februari","Maret","April","Mei","Juni","Juli","Agustus","September","Oktober","November","Desember"]
                        },
                        yAxis: {},
                        series: [{
                            name: 'Sales',
                            type: 'bar',
                            data: $scope.dataGrafik
                        }]
                };
            }
        });


    }

   


  $scope.getGrafik(productID);

    $scope.$on('side',function(event,data){
        $scope.getProduct(data);
          $scope.getGrafik(data);
        productID=data;
    })

    



}])
.controller('productSideCtrl',
    function($http,$scope,config,product,FileUploader,SweetAlert,$stateParams){
        //get all Product for sidebar 
        $scope.productID=$stateParams.productID;



        $scope.product={};
        $scope.sorting="desc";
        $scope.jenisProduk="";
        $scope.keywordSearch="nama";
        $scope.search="";

        $scope.getAllProduct=()=>{
            product.getProduct(0,0,$scope.search,$scope.sorting,$scope.keywordSearch,$scope.jenisProduk).then(function(result){
                $scope.product=result.data.data;
                console.log(result.data.data);
            });
        } 

        $scope.getAllProduct();
        $scope.clik=(id)=>{
            $scope.productID=id;

            $scope.$emit('side',id)
        }

        $scope.searches=()=>{

            $scope.search=$scope.src;
            if($scope.src==''){

                $scope.search='null'
            }
            $scope.getAllProduct();
            
        }
    }
);