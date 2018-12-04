'use strict';

angular.module('myApp.order', ['ui.router','angularUtils.directives.dirPagination'])
//invoice electron boler
.config(['$stateProvider', function($stateProvider) {
  // $routeProvider.when('/view1', {
  //   templateUrl: 'view1/view1.html',
  //   controller: 'View1Ctrl'
  // });
  $stateProvider

        // HOME STATES AND NESTED VIEWS ========================================
        .state('order', {
            url: '/order/:type',
            views: {

                // the main template will be placed here (relatively named)
                '': { templateUrl: 'order/order.html',controller: 'OrderCtrl' },
                'side@order':{
                  controller:'OrderCtrlSide'
                },


                // main sidebar diletakkan di setiap module angularjs 
                'main-sidebar@order': { 
                    templateUrl: '../app/template/layout/sidebar1.html',
                    
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
        }).
        state('orderDetail',{
            url:'/orderDetail/:orderID',
            views: {
                '':{templateUrl:'order/orderDetail.html',controller:'OrderDetailCtrl'},
                // main sidebar diletakkan di setiap module angularjs 
                'main-sidebar@orderDetail': { 
                    templateUrl: '../app/template/layout/sidebar1.html',
                    
                },
                'orderSide@orderDetail':{
                    templateUrl:'order/view/orderSide.html',
                    controller:'OrderSideCtrl',
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
.config(['$httpProvider', function($httpProvider) {  
  $httpProvider.interceptors.push(function ($q, $injector) {
      var incrementalTimeout = 1000;

      function retryRequest (httpConfig) {
          var $timeout = $injector.get('$timeout');
          var thisTimeout = incrementalTimeout;
          incrementalTimeout *= 2;
          return $timeout(function() {
              var $http = $injector.get('$http');
              return $http(httpConfig);
          }, thisTimeout);
      };

      return {
          responseError: function (response) {
              if (response.status === 500) {
                  if (incrementalTimeout < 5000) {
                      return retryRequest(response.config);
                  }
                  else {
                      alert('The remote server seems to be busy at the moment. Please try again in 5 minutes');
                  }
              }
              else {
                  incrementalTimeout = 1000;
              }
              return $q.reject(response);
          }
      };
  });
}])
.directive('babKu',function(){
    return {
        restrict: 'C',
        link: function (scope, elem, attrs) {
            // directive is called once for each chart
            // listen to option changes
            var validator = $(".form-validate-jquery").validate();
            if (attrs.eoption) {
                scope.$watch(attrs['eoption'], function() {

                    var option = scope.$eval(attrs.eoption);
                    console.log(option);
                    if (angular.isObject(option)) {
                        var validator = $(".form-validate-jquery").validate(option);
                       
                    }
                }, true); // deep watch
            }
        }
    }
})
.directive('tableShow',function(){
  return{
    scope: {
      head:'=',
      body:'='
    },template:'<ul><li ng-repeat="p in head">{{p}}</li></ul>'
  }
})
.filter('comma2decimal', [
function() { // should be altered to suit your needs
    return function(input) {

    var ret=(input)?input.toString().trim().replace(/,/g,'.'):null;
        return ret;
    };
}])

.controller('OrderCtrl', ['$http','$scope','config','order','customer','product','$timeout','FileUploader','SweetAlert','$filter','$rootScope','$state','$stateParams',function($http,$scope,config,order,customer,product,$timeout,FileUploader,SweetAlert,$filter,$rootScope,$state,$stateParams) {
  // $rootScope.$watch('online',function(){
  //   console.log("asdfasdfasdf"+online,"oke");
  // })

  //jenis order merupakan order yang di inputkan manual atau melalu chatbot

  var type=$stateParams.type;
  if(type=='chatbot'){
    $rootScope.orderNotif=0;
  }
  var orderFrom='';

  if(type=='chatbot'){
    orderFrom='Messenger';
  }else{
    orderFrom='Manual';
  }
  $scope.pageName='';
  $scope.orderDate="";
  $scope.orderFinishDate="";
    $scope.head=['Nama','Alamat','Kota','Pekerjaan'];
    $scope.url='http://localhost/hdkreasi';
    $scope.breadcrumb='';
    $scope.form={'orderID':'','orderName':'','orderNumber':'','orderAuthorized':'','orderDate':'','orderFinishDate':'','orderStatus':'','orderDeliveryInstruction':'','orderDeliveryAddress':'','orderDesc':'','customerID':''};
    $scope.newForm={};
    $scope.form.item=[{'orderID':'','itemID':'','productID':'','itemQty':'','itemUnitPrice':'','itemDiscount':'','product':'','readystock':'','itemTotal':'','leftInHand':'','extra':'N','itemDesc':''}];
    $scope.extra=[{'orderID':'','itemID':'','productID':'','itemQty':'','itemUnitPrice':'','itemDiscount':'','product':'','readystock':'','itemTotal':'','leftInHand':'','extra':'Y','itemDesc':''}];
    //ui
        var validator = $(".form-validate-jquery").validate({
              ignore: 'input[type=hidden], .select2-search__field', // ignore hidden fields
              errorClass: 'validation-error-label',
              successClass: 'validation-valid-label',
              highlight: function(element, errorClass) {
                  $(element).removeClass(errorClass);
              },
              unhighlight: function(element, errorClass) {
                  $(element).removeClass(errorClass);
              },

              // Different components require proper error label placement
              errorPlacement: function(error, element) {

                  // Styled checkboxes, radios, bootstrap switch
                  if (element.parents('div').hasClass("checker") || element.parents('div').hasClass("choice") || element.parent().hasClass('bootstrap-switch-container') ) {
                      if(element.parents('label').hasClass('checkbox-inline') || element.parents('label').hasClass('radio-inline')) {
                          error.appendTo( element.parent().parent().parent().parent() );
                      }
                       else {
                          error.appendTo( element.parent().parent().parent().parent().parent() );
                      }
                  }

                  // Unstyled checkboxes, radios
                  else if (element.parents('div').hasClass('checkbox') || element.parents('div').hasClass('radio')) {
                      error.appendTo( element.parent().parent().parent() );
                  }

                  // Input with icons and Select2
                  else if (element.parents('div').hasClass('has-feedback') || element.hasClass('select2-hidden-accessible')) {
                      error.appendTo( element.parent() );
                  }

                  // Inline checkboxes, radios
                  else if (element.parents('label').hasClass('checkbox-inline') || element.parents('label').hasClass('radio-inline')) {
                      error.appendTo( element.parent().parent() );
                  }

                  // Input group, styled file input
                  else if (element.parent().hasClass('uploader') || element.parents().hasClass('input-group')) {
                      error.appendTo( element.parent().parent() );
                  }

                  else {
                      error.insertAfter(element);
                  }
              },
              validClass: "validation-valid-label",
              success: function(label) {
                  label.addClass("validation-valid-label").text("Success.")
              },
              rules: {
                  no: {
                      digits: true
                  },
                  date: {
                    date: true
                },
   
              },
              messages: {
                  custom: {
                      required: "This is a custom error message",
                  },
                  agree: "Please accept our policy"
              }
          });
                validator.settings.rules['noExtra'+0]={'digits':true};
                validator.settings.rules['noItem'+0]={'digits':true};
                validator.settings.rules['noExtraHarga'+0]={'digits':true};
                validator.settings.rules['noItemHarga'+0]={'digits':true};
                validator.settings.rules['noExtraDiscount'+0]={'digits':true};
                validator.settings.rules['noItemDiscount'+0]={'digits':true};
                $scope.addNewVariant = function(type,index) {
                    if(type=="extra"){
                     $scope.extra.push({'orderID':'','itemID':'','productID':'','itemQty':'','itemUnitPrice':'','itemDiscount':'','product':'','readystock':'','itemTotal':'','leftInHand':'','extra':'Y','itemDesc':''});
                      validator.settings.rules['noExtra'+index]={'digits':true};
                      validator.settings.rules['noExtraHarga'+index]={'digits':true};
    
                validator.settings.rules['noExtraDiscount'+index]={'digits':true};
                    }else{

                      
                    validator.settings.rules['noItem'+index]={'digits':true};
                     validator.settings.rules['noItemHarga'+index]={'digits':true};
                     validator.settings.rules['noItemDiscount'+index]={'digits':true};
                      $scope.form.item.push({'orderID':'','itemID':'','productID':'','itemQty':'','itemUnitPrice':'','itemDiscount':'','product':'','readystock':'','itemTotal':'','leftInHand':'','extra':'N','itemDesc':''});
                    }
                };
                $scope.removeVariantExtra = function(index) {
                  

                  if($scope.extra[index].orderID!="" || $scope.extra[index].itemID!=""){

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

                             order.delete_item($scope.extra[index].itemID).then(function(response){
                                  console.log(response);

                                   if (response.data.status="Success") {
            
                                      swal("Deleted!", "Data Berhasil Dihapus.", "success");
                                      $scope.extra.splice(index, 1);


                                   } else {
                                      swal("Cancelled", "Deleted Cancelled :)", "error");
                                   }
                                  
                              });
                            }else{
                              swal("Cancelled", "Deleted Cancelled:)", "error");
                            }

                      });
                  }else{
                    if(index!=0){
                     $scope.extra.splice(index, 1);
                    }
                  }

                  
                };
                $scope.removeVariant = function(index) {
                  

                  if($scope.form.item[index].orderID!="" || $scope.form.item[index].itemID!=""){

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

                             order.delete_item($scope.form.item[index].itemID).then(function(response){
                                  console.log(response);

                                   if (response.data.status="Success") {
            
                                      swal("Deleted!", "Data Berhasil Dihapus.", "success");
                                      $scope.form.item.splice(index, 1);


                                   } else {
                                      swal("Cancelled", "Deleted Cancelled :)", "error");
                                   }
                                  
                              });
                            }else{
                              swal("Cancelled", "Deleted Cancelled:)", "error");
                            }

                      });
                  }else{
                    if(index!=0){
                      $scope.form.item.splice(index, 1);
                    }
                    
                  }

                  
                };
                $scope.amount=function(qty,price,discount,index,type){
                    // if(price){
                    //     return qty * price;
                    // }
                    var total=0;
                    if(qty==0){
                        
                       total=price;
                    }
                    if(discount){
                        var amount=qty*price;
                        var discount=(amount * discount)/100; 
                         total=amount-discount;
                    }else{
                       total=qty*price;
                    }
                    if(type=='extra'){
                      $scope.extra[index].itemTotal=total;
                    }else{
                      $scope.form.item[index].itemTotal=total;
                    }
                    
           
                    return total;
                }

                $scope.getTotal = function(type){
                    var total = 0;
                    var amount=0;

                    if(type=="extra"){
                      for(var i = 0; i < $scope.extra.length; i++){
                          var item = $scope.extra[i];

                          if(item.itemDiscount!=null){ 
                              var amounts=item.itemQty*item.itemUnitPrice;
                              var discount=(amounts * item.itemDiscount)/100; 
                              amount =amounts-discount;
                              total +=amount;
                          }else{
                              amount =item.itemQty * item.itemUnitPrice;
                              total +=amount;

                          }
                          
                      }
                    }else{
                            var itemCount=0;
                            angular.forEach($scope.form.item, function(order) {
                                itemCount=itemCount+1;
                            });
                      for(var i = 0; i < itemCount; i++){
                          var item = $scope.form.item[i];

                          if(item.itemDiscount!=null){ 
                              var amounts=item.itemQty*item.itemUnitPrice;
                              var discount=(amounts * item.itemDiscount)/100; 
                              amount =amounts-discount;
                              total +=amount;
                          }else{
                              amount =item.itemQty * item.itemUnitPrice;
                              total +=amount;

                          }
                          
                      }  

                    }



                    return total;
                }


    //UI
    




  var vm=this;
  vm.orders=[];
  vm.pageno=1;
  vm.total_count_order=0;
  vm.sorting="desc";

    

  
  vm.itemsPerPage=10;
  vm.search='null';
  vm.keywordSearch='orderName';
  vm.keywordSearchO='orderName';
  $scope.search="";
  $scope.operation="Add";
  $scope.customer=[];
  $scope.orderStatus=null;

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

  $scope.select={type:$scope.option[0].value};

    var requireForm=['sku','nama'];

  //fungsi untuk mendapatkan data product
  vm.getOrder=(pageno,search=null)=>{

    order.get(pageno,vm.itemsPerPage,vm.search,vm.sorting,vm.keywordSearchO,$scope.orderStatus,type,orderFrom).then(function(result){
    

         vm.orders=result.data.data;
        vm.total_count_order=result.data.total_row;
     
     
      console.log(vm.orders);
      console.log(result.data.data);
  
    });
  }
  //when page start load the data;
  vm.getOrder(vm.pageno,vm.search);


  $scope.searches=()=>{

    vm.search=$scope.search;
    if($scope.search==''){

      vm.search='null'
    }
    $scope.filter=vm.getOrder(1,vm.search);
    
  }

  $scope.rel=function(){
    vm.itemsPerPage=$scope.select.type;
    console.log($scope.select.type);
    vm.getOrder(vm.pageno,vm.search);
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

      vm.getOrder(vm.pageno,vm.search);

    }

    $scope.keywordSearchSet=(keyword)=>{
      vm.keywordSearchO=keyword;
      console.log(vm.keywordSearchO);
    }

    $scope.statuss=[{name:'All',value:'null'},{name:'Confirmed',value:'Confirmed'},{name:'Not Confirmed',value:'Not Confirmed'},{name:'Shipping',value:'Shipping'},{name:'Done',value:'Done'}];
    
    $scope.byStatus=(type)=>{
      $scope.orderStatus=type;
      vm.getOrder(vm.pageno,vm.search);
    }
    // $scope.$on('sideCtrl',function(event,data){
    //   if(data=='All'){
    //     $scope.orderStatus=null;
    //      vm.getOrder(vm.pageno,vm.search);
    //   }else{
    //     $scope.orderStatus=data;
    //      vm.getOrder(vm.pageno,vm.search);
    //   }

    // })


    $scope.editButton=function(id){
   
        validator.resetForm();
        $('#modal_theme_primary').modal('show');
       
        // console.log($scope.editImage);
        $scope.operation="Edit";
        


        order.getDetail(id).then(function(response){
        
          customer.getDetail(response.data.data.customerID).then(function(response){
            $scope.namaCustomer=response.data.data.customerName;
          })
            $scope.form={'orderID':response.data.data.orderID,
                         'orderName':response.data.data.orderName,
                         'orderNumber':response.data.data.orderNumber,
                         'orderAuthorized':response.data.data.orderAuthorized,
                         'orderDate':response.data.data.orderDate,
                         'orderFinishDate':response.data.data.orderFinishDate,
                         'orderStatus':response.data.data.orderStatus,
                         'orderDeliveryInstruction':response.data.data.orderDeliveryInstruction,
                         'orderDeliveryAddress':response.data.data.orderDeliveryAddress,
                         'orderDesc':response.data.data.orderDeliveryAddress,
                         'customerID':response.data.data.customerID};

          $scope.orderDate=new Date(response.data.data.orderDate);
          $scope.orderFinishDate=new Date(response.data.data.orderFinishDate);
          console.log($scope.orderFinishDate);
          console.log('extre',$scope.extra);

            order.getItem(id).then(function(responses){
              
                $scope.form.item=[];
                $scope.extra=[];
                if(responses.data.status!="Error"){
                    var index=0;
                    var indexs=0;
                   for (var i = 0; i < responses.data.data.length; i++) {
                    
                      $scope.form.item.push({'orderID':'','itemID':'','productID':'','itemQty':'','itemUnitPrice':'','itemDiscount':'','product':'','readystock':'','stok':'','itemTotal':'','leftInHand':'','extra':'Y','itemDesc':''});
                      $scope.extra.push({'orderID':'','itemID':'','productID':'','itemQty':'','itemUnitPrice':'','itemDiscount':'','product':'','readystock':'','stok':'','itemTotal':'','leftInHand':'','extra':'N','itemDesc':''});
                    
                    if(responses.data.data[i].extra=='Y'){
                     $scope.extra[index].product=responses.data.data[i].namaProduk;
                     $scope.extra[index].readystock=responses.data.data[i].readystock;
                     $scope.extra[index].stok=responses.data.data[i].stok;
                     $scope.extra[index].leftInHand=responses.data.data[i].leftInHand;

                     $scope.extra[index].orderID=responses.data.data[i].orderID;
                     $scope.extra[index].itemID=responses.data.data[i].itemID;
                     $scope.extra[index].productID=responses.data.data[i].productID;
                     $scope.extra[index].itemQty=responses.data.data[i].itemQty;
                     $scope.extra[index].itemUnitPrice=responses.data.data[i].itemUnitPrice;
                     $scope.extra[index].itemDiscount=responses.data.data[i].itemDiscount;
                     $scope.extra[index].extra=responses.data.data[i].extra;
                     $scope.extra[index].itemDesc=responses.data.data[i].itemDesc;
                     index++;
                    }else{
                     $scope.form.item[indexs].product=responses.data.data[i].namaProduk;
                     $scope.form.item[indexs].readystock=responses.data.data[i].readystock;
                     $scope.form.item[indexs].stok=responses.data.data[i].stok;
                     $scope.form.item[indexs].leftInHand=responses.data.data[i].leftInHand;

                     $scope.form.item[indexs].orderID=responses.data.data[i].orderID;
                     $scope.form.item[indexs].itemID=responses.data.data[i].itemID;
                     $scope.form.item[indexs].productID=responses.data.data[i].productID;
                     $scope.form.item[indexs].itemQty=responses.data.data[i].itemQty;
                     $scope.form.item[indexs].itemUnitPrice=responses.data.data[i].itemUnitPrice;
                     $scope.form.item[indexs].itemDiscount=responses.data.data[i].itemDiscount;
                     $scope.form.item[indexs].extra=responses.data.data[i].extra;
                     indexs++;
                    }
                   
                    

                   }
                  
                }else{
                   $scope.form.item=[{'orderID':'','itemID':'','productID':'','itemQty':'','itemUnitPrice':'','itemDiscount':'','product':'','readystock':'','stok':'','itemTotal':'','leftInHand':'','extra':'N','itemDesc':''}];
                   $scope.extra=[{'orderID':'','itemID':'','productID':'','itemQty':'','itemUnitPrice':'','itemDiscount':'','product':'','readystock':'','stok':'','itemTotal':'','leftInHand':'','extra':'Y','itemDesc':''}];
                }
               
            })

        }) 



    }


    $scope.formModals=()=>{
        // Reset form
        
       
        validator.resetForm();
        $("input[type=text], textarea").val("");
        $("#modal_theme_primary").modal('show');
        console.log($scope.form.item);


  

    }




    $scope.closeModal=()=>{

         // $scope.form=undefined;
         $scope.form={'orderID':'','orderName':'','orderNumber':'','orderAuthorized':'','orderDate':'','orderFinishDate':'','orderStatus':'','orderDeliveryInstruction':'','orderDeliveryAddress':'','orderDesc':'','customerID':''};
          $scope.form.item=[{'orderID':'','itemID':'','productID':'','itemQty':'','itemUnitPrice':'','itemDiscount':'','product':'','readystock':'','itemTotal':'','leftInHand':'','extra':'N','itemDesc':''}]
          $scope.extra=[{'orderID':'','itemID':'','productID':'','itemQty':'','itemUnitPrice':'','itemDiscount':'','product':'','readystock':'','itemTotal':'','leftInHand':'','extra':'Y','itemDesc':''}];

        $scope.operation="Add";
        $("#modal_theme_primary").modal('hide');


        
    }
  //submit form

  $scope.submit=()=>{

        var cek=1;
        for (var i =0; i < requireForm.length; i++) {
            if($scope.form+'.'+requireForm[i]!=""){
                cek=cek+i;
            }
        }

        if($('#form').valid()){
            if(cek == requireForm.length){
                for (var i = 0; i < $scope.extra.length; i++) {
                  if($scope.extra[i].itemDesc!=''){
                  $scope.form.item.push({'orderID':$scope.extra[i].orderID,
                                        'itemID':$scope.extra[i].itemID,
                                        'productID':$scope.extra[i].productID,
                                        'itemQty':$scope.extra[i].itemQty,
                                        'itemUnitPrice':$scope.extra[i].itemUnitPrice,
                                        'itemDiscount':$scope.extra[i].itemDiscount,
                                        'product':$scope.extra[i].product,
                                        'readystock':$scope.extra[i].readystock,
                                        'itemTotal':$scope.extra[i].itemTotal,
                                        'leftInHand':$scope.extra[i].leftInHand,
                                        'extra':'Y',
                                        'itemDesc':$scope.extra[i].itemDesc}); 
                  }

                }
 
                if($scope.operation=="Add"){
                        var newDate=$filter('date')($scope.orderDate,'yyyy-MM-dd');
                        var finisDate=$filter('date')($scope.orderFinishDate,'yyyy-MM-dd');
                        $scope.form.orderDate=newDate;
                        $scope.form.orderFinishDate=finisDate;


                        order.add($scope.form).then(function(response){
                            $scope.closeModal();
                            if(response.data.status=="Error"){
                                swal({title:"Error, Coba Lagi",type:"error",closeOnConfirm:true});
                            }else{
                                vm.getOrder(1);
                                swal("Success", "Data Berhasil Disimpan.", "success");
                            }
                        })     
    
                }else{
                    
                    console.log($scope.form.item);
                    var newDate=$filter('date')($scope.orderDate,'yyyy-MM-dd');
                    var finisDate=$filter('date')($scope.orderFinishDate,'yyyy-MM-dd');
                    $scope.form.orderDate=newDate;
                    $scope.form.orderFinishDate=finisDate;
                    order.edit($scope.form).then(function(response){
                        if(response.data.status=="Error"){
                            swal({title:'Gagal Mengedit',type:"error",closeOnConfirm:true});
                        }else{
                            vm.getOrder(1);
                            swal("Success", "Data Berhasil Diubah.", "success");

                        }
                    })
                }

                $("#modal_theme_primary").modal('hide');
      
                

            }else{
                //nothing
            }
        }

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

                     if (response.data.status="Success") {
                        swal("Deleted!", "Data Berhasil Dihapus.", "success");

                        $scope.reloadData();
                     } else {
                        swal("Cancelled", "Deleted Cancelled :)", "error");
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
        angular.forEach(vm.orders, function(order) {
            order.selected = $scope.selectedAll;
        });
    };    


    $scope.removeSelected = function(){
        var newDataList=[];
        
        var orderIDCollect=[];
        var i=0;

        angular.forEach(vm.order, function(selected){
            if(selected.selected==true){
               orderIDCollect[i]=selected.orderID; 
                i++;
            }
            
        }); 

        if(orderIDCollect.length < 1){
             swal("Cancelled", "Tidak ada Data dipilih:)", "error");
        }else{
            swal({
             title: "Are you sure?",
             text: orderIDCollect.length +" data akan dihapus",
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


    //customer choose
    $scope.seas='';
    $scope.cari='';
    var cs=this;
    
    cs.customer=[];
    cs.pageno=1;
    cs.total_count_cust=0;
    cs.sorting="desc";
    cs.itemsPerPage=10;
    cs.searche='null';
    cs.keywordSearch='customerName';

    $scope.showCase=false;
    cs.getCustomer=(pageno,search=null)=>{

        customer.get(pageno,cs.itemsPerPage,cs.searche,cs.sorting,cs.keywordSearch).then(function(result){
    
           
            if(result.data.data!=null){
                 cs.customer=result.data.data;

             }else{
                cs.customer=[];
             }
       
            cs.total_count_cust=result.data.total_row;
    
        });
    }

    $scope.showw=function(){
      $scope.showCase=true;
      $('#modal_theme_primary1').modal('show');
      cs.getCustomer(cs.pageno,cs.search);

    }
   $scope.close=function(){
      $scope.showCase=false;
      $('#modal_theme_primary1').modal('hide');
    }
    
    $scope.pilihCustomer=(index,nama,id,address)=>{

      $scope.form.customerID=id;
      $scope.form.orderDeliveryAddress=address
      $scope.namaCustomer=$filter('uppercase')(nama); 
      $scope.close();
    }
    $scope.searchess=(s)=>{

        cs.searche=s;
        if(s==''){

            cs.searche='null';
        }

 
        $scope.filter=cs.getCustomer(1,cs.searche);
        
    }

    $scope.rels=function(){
        cs.itemsPerPage=$scope.select.type;
       
        cs.getCustomer(cs.pageno,cs.search);
    }


    $scope.sortClicks=(type)=>{
        if(type=='asc'){
            $scope.asc='active';
            cs.sorting='asc';
            $scope.desc='';
        }else{
            $scope.desc='active';
            cs.sorting='desc';
            $scope.asc='';
        }

        cs.getCustomer(cs.pageno,cs.search);

    }

    $scope.keywordSearch=(keyword)=>{
        cs.keywordSearch=keyword;
        console.log(cs.keywordSearch);
    }



    var ps=this;
    
    ps.product=[];
    ps.pageno=1;
    ps.total_counts=0;
    ps.sorting="desc";
    ps.itemsPerPage=10;
    ps.searchess='null';
    ps.keywordSearchProduct='nama';

    $scope.showCaseProduct=false;
    cs.getProduct=(pageno,search=null)=>{

        product.get(pageno,ps.itemsPerPage,ps.searchess,ps.sorting,ps.keywordSearchProduct,'all').then(function(result){
    
           
            if(result.data.data!=null){
                 ps.product=result.data.data;

             }else{
                ps.product=[];
             }
       
            ps.total_counts=result.data.total_row;
    
        });
    }

    var indexProdukItem=0;
    $scope.showwProduct=function(index){
      $scope.showCaseProduct=true;
      indexProdukItem=index
      ps.getProduct(ps.pageno,ps.search);

    }
   $scope.closeProduct=function(){
      $scope.showCaseProduct=false;
      $('#modal_theme_primary2').modal('hide');
    }

    $scope.product=[];
    
    $scope.pilihProduct=(nama,id,harga,stok,readystock)=>{
      var found=false;
      for (var i = 0; i<$scope.form.item.length; i++) {
        if($scope.form.item[i].productID==id){
          found=true;
        }
      }
      $scope.closeProduct();
      console.log(found);

      if(!found){
        $scope.form.item[indexProdukItem].productID=id;
        $scope.form.item[indexProdukItem].stok=stok;
        $scope.form.item[indexProdukItem].readystock=readystock;
        $scope.form.item[indexProdukItem].itemUnitPrice=harga;
        $scope.form.item[indexProdukItem].product=$filter('uppercase')(nama);
      }else{
        swal({title:"Produk Telah Dipilih",type:"error",closeOnConfirm:true});
      }
 
      console.log($scope.form.item);
      // $scope.product[index]=$filter('uppercase')(nama); 
     
    }

    $scope.cekStok=(readystock,qty,stok,leftInHand,indexProdukItem)=>{

      console.log($scope.form.item);
      var qt=parseInt(qty);
      var s=parseInt(stok);
      var a=parseInt(leftInHand);
      
     
      var oldqty=1;
     
      var re=readystock;

        setTimeout(function(){
         
          if(re!='N'){
            if($scope.form.item[indexProdukItem].orderID!=null){

              order.cekStok($scope.form.item[indexProdukItem].productID,qty,$scope.form.item[indexProdukItem].itemID).then(function(response){
               if(response.data.status!="cukup"){
                 $scope.form.item[indexProdukItem].itemQty=null;
                 $scope.form.item[indexProdukItem].itemQty=response.data.data;
                 swal({title:"Stok Tidak Mencukupi",type:"error",closeOnConfirm:true});
               }
              }) 
            }else{
              order.cekStok($scope.form.item[indexProdukItem].productID,qty).then(function(response){

               if(response.data.status!="cukup"){
                 $scope.form.item[indexProdukItem].itemQty=null;
                 $scope.form.item[indexProdukItem].itemQty=response.data.data;
                 swal({title:"Stok Tidak Mencukupi",type:"error",closeOnConfirm:true});
               }
              })
            }

            
          }
          

          
        },1000);
      


    }
    $scope.searchessProduct=(s)=>{

        ps.searchess=s;
        if(s==''){

            ps.searchess='null';
        }

 
        $scope.filter=ps.getProduct(1,ps.searchess);
        
    }

    $scope.relsProduct=function(){
        ps.itemsPerPage=$scope.select.type;
       
        ps.getCustomer(ps.pageno,ps.search);
    }


    $scope.sortClicksProduct=(type)=>{
        if(type=='asc'){
            $scope.asc='active';
            ps.sorting='asc';
            $scope.desc='';
        }else{
            $scope.desc='active';
            ps.sorting='desc';
            $scope.asc='';
        }

        ps.getProduct(ps.pageno,ps.search);

    }

    $scope.keywordSearchProduct=(keyword)=>{
        ps.keywordSearchProduct=keyword;
        console.log(cs.keywordSearch);
    }

}])
.controller('OrderDetailCtrl',['$http','$scope','config','order','product','customer','FileUploader','SweetAlert','$stateParams','$filter','setting',function($http,$scope,config,order,product,customer,FileUploader,SweetAlert,$stateParams,$filter,setting){

    var orderID=$stateParams.orderID;
    $scope.url=config.apiUrl;
    //untuk order yang belum dikonfirmasi
    $scope.konfirmasi=false;
    $scope.operation="Add";
      $scope.shipment={};

    //get Detail information of product from parameter passes by parameter name product ID
    $scope.order={};
    $scope.orderItem={};
    $scope.invoice={};
    $scope.invState=false;
    const ipc=require('electron').ipcRenderer;
    $scope.print=()=>{
      alert("Apakah anda akan mecetak invoice ini?");
      ipc.send('print-to-pdf');
    }
    $scope.getShipment=(id)=>{
      order.getShipment(id).then(function(response){
        $scope.shipment=response.data.data;
      })
    }
    $scope.getOrder=(id)=>{
      console.log('ccc',id);
        order.getDetail(id).then(function(response){
            $scope.order=response.data.data;
            console.log($scope.order);

            console.log('order',$scope.order);


            if($scope.order.orderStatus=="Shipping" || $scope.order.orderStatus=="Done"){
              $scope.getShipment(orderID);
            }
            if($scope.order.orderStatus == "Not Confirmed"){
              $scope.konfirmasi=false;
            }else{
              $scope.konfirmasi=true;
            }
        
        });
       
        order.getItem(id).then(function(responses){
            $scope.orderItem=responses.data.data;

          
        });


        order.getInvoice(id).then(function(responses){
          if(responses.data.status=="Error"){
            
            $scope.invState=false;
          }else{
            $scope.invoice=responses.data.data;
            $scope.invState=true;
          }
        })
        //get Invoice jika ada
        console.log($scope.orderItem);
    }



    $scope.getOrder(orderID);

    $scope.$on('side',function(event,data){
      console.log(data);
      orderID=data;
        $scope.getOrder(orderID);
        
    })


    //setelah order di konfirmasi akan ada refresh side data $scope.emit('refresh','referesh');

    //ui
        var validator = $(".form-validate-jquery-edit").validate({
              ignore: 'input[type=hidden], .select2-search__field', // ignore hidden fields
              errorClass: 'validation-error-label',
              successClass: 'validation-valid-label',
              highlight: function(element, errorClass) {
                  $(element).removeClass(errorClass);
              },
              unhighlight: function(element, errorClass) {
                  $(element).removeClass(errorClass);
              },

              // Different components require proper error label placement
              errorPlacement: function(error, element) {

                  // Styled checkboxes, radios, bootstrap switch
                  if (element.parents('div').hasClass("checker") || element.parents('div').hasClass("choice") || element.parent().hasClass('bootstrap-switch-container') ) {
                      if(element.parents('label').hasClass('checkbox-inline') || element.parents('label').hasClass('radio-inline')) {
                          error.appendTo( element.parent().parent().parent().parent() );
                      }
                       else {
                          error.appendTo( element.parent().parent().parent().parent().parent() );
                      }
                  }

                  // Unstyled checkboxes, radios
                  else if (element.parents('div').hasClass('checkbox') || element.parents('div').hasClass('radio')) {
                      error.appendTo( element.parent().parent().parent() );
                  }

                  // Input with icons and Select2
                  else if (element.parents('div').hasClass('has-feedback') || element.hasClass('select2-hidden-accessible')) {
                      error.appendTo( element.parent() );
                  }

                  // Inline checkboxes, radios
                  else if (element.parents('label').hasClass('checkbox-inline') || element.parents('label').hasClass('radio-inline')) {
                      error.appendTo( element.parent().parent() );
                  }

                  // Input group, styled file input
                  else if (element.parent().hasClass('uploader') || element.parents().hasClass('input-group')) {
                      error.appendTo( element.parent().parent() );
                  }

                  else {
                      error.insertAfter(element);
                  }
              },
              validClass: "validation-valid-label",
              success: function(label) {
                  label.addClass("validation-valid-label").text("Success.")
              },
              rules: {
                  no: {
                      digits: true
                  },
                  date: {
                    date: true
                },
   
              },
              messages: {
                  custom: {
                      required: "This is a custom error message",
                  },
                  agree: "Please accept our policy"
              }
          });


                validator.settings.rules['noExtra'+0]={'digits':true};
                validator.settings.rules['noItem'+0]={'digits':true};
                validator.settings.rules['noExtraHarga'+0]={'digits':true};
                validator.settings.rules['noItemHarga'+0]={'digits':true};
                validator.settings.rules['noExtraDiscount'+0]={'digits':true};
                validator.settings.rules['noItemDiscount'+0]={'digits':true};
                validator.settings.rules['noExtra'+1]={'digits':true};
                validator.settings.rules['noItem'+1]={'digits':true};
                validator.settings.rules['noExtraHarga'+1]={'digits':true};
                validator.settings.rules['noItemHarga'+1]={'digits':true};
                validator.settings.rules['noExtraDiscount'+1]={'digits':true};
                validator.settings.rules['noItemDiscount'+1]={'digits':true};
$scope.rule=[];
                $scope.addNewVariant = function(type,index) {
                    if(type=="extra"){
                     $scope.extra.push({'orderID':'','itemID':'','productID':'','itemQty':'','itemUnitPrice':'','itemDiscount':'','product':'','readystock':'','itemTotal':'','leftInHand':'','extra':'Y','itemDesc':''});
                      validator.settings.rules['noExtra'+index]={'digits':true};
                      validator.settings.rules['noExtraHarga'+index]={'digits':true};
    
                       validator.settings.rules['noExtraDiscount'+index]={'digits':true};
                    }else{

                      
                    validator.settings.rules['noItem'+index]={'digits':true};
                     validator.settings.rules['noItemHarga'+index]={'digits':true};
                     validator.settings.rules['noItemDiscount'+index]={'digits':true};
                      $scope.form.item.push({'orderID':'','itemID':'','productID':'','itemQty':'','itemUnitPrice':'','itemDiscount':'','product':'','readystock':'','itemTotal':'','leftInHand':'','extra':'N','itemDesc':''});
                    }
                };
                $scope.removeVariantExtra = function(index) {
                  

                  if($scope.extra[index].orderID!="" || $scope.extra[index].itemID!=""){

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
                              if($scope.extra[index].itemID){
                                 order.delete_item($scope.extra[index].itemID).then(function(response){
                                      console.log(response);

                                       if (response.data.status="Success") {
                
                                          swal("Deleted!", "Data Berhasil Dihapus.", "success");
                                          $scope.extra.splice(index, 1);


                                       } else {
                                          swal("Cancelled", "Deleted Cancelled :)", "error");
                                       }
                                       
                                      
                                  });
                              }

                            }else{
                              swal("Cancelled", "Deleted Cancelled:)", "error");
                            }

                      });
                  }else{
                    if(index!=0){
                      $scope.extra.splice(index, 1);
                    }
                    
                  }

                  
                };
                $scope.removeVariant = function(index) {
                  

                  if($scope.form.item[index].orderID!="" || $scope.form.item[index].itemID!=""){

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
                              if($scope.form.item[index].itemID){
                               order.delete_item($scope.form.item[index].itemID).then(function(response){
                                    console.log(response);

                                     if (response.data.status="Success") {
              
                                        swal("Deleted!", "Data Berhasil Dihapus.", "success");
                                        $scope.form.item.splice(index, 1);


                                     } else {
                                        swal("Cancelled", "Deleted Cancelled :)", "error");
                                     }
                                      $scope.form.item.push({'orderID':'','itemID':'','productID':'','itemQty':'','itemUnitPrice':'','itemDiscount':'','product':'','readystock':'','itemTotal':'','leftInHand':'','extra':'N','itemDesc':''});
                                    
                                });
                              }
                            }else{
                              swal("Cancelled", "Deleted Cancelled:)", "error");
                            }

                      });
                  }else{
                    if(index!=0){
                      $scope.form.item.splice(index, 1);
                    }
                  }

                  
                };
                $scope.amount=function(qty,price,discount,index,type){
                    // if(price){
                    //     return qty * price;
                    // }
                    var total=0;
                    if(qty==0){
                        
                       total=price;
                    }
                    if(discount){
                        var amount=qty*price;
                        var discount=(amount * discount)/100; 
                         total=amount-discount;
                    }else{
                       total=qty*price;
                    }
                    if(type=='extra'){
                      $scope.extra[index].itemTotal=total;
                    }else{
                      $scope.form.item[index].itemTotal=total;
                    }

           
                    return total;
                }

                $scope.getTotal = function(type){
                    var total = 0;
                    var amount=0;

                    if(type=="extra"){
                      for(var i = 0; i < $scope.extra.length; i++){
                          var item = $scope.extra[i];

                          if(item.itemDiscount!=null){ 
                              var amounts=item.itemQty*item.itemUnitPrice;
                              var discount=(amounts * item.itemDiscount)/100; 
                              amount =amounts-discount;
                              total +=amount;
                          }else{
                              amount =item.itemQty * item.itemUnitPrice;
                              total +=amount;

                          }
                          
                      }
                    }else{
                            var itemCount=0;
                            angular.forEach($scope.form.item, function(order) {
                                itemCount=itemCount+1;
                            });
                            for(var i = 0; i < itemCount; i++){
                                var item = $scope.form.item[i];

                                if(item.itemDiscount!=null){ 
                                    var amounts=item.itemQty*item.itemUnitPrice;
                                    var discount=(amounts * item.itemDiscount)/100; 
                                    amount =amounts-discount;
                                    total +=amount;
                                }else{
                                    amount =item.itemQty * item.itemUnitPrice;
                                    total +=amount;

                                }
                                
                            }                    
                    }



                    return total;
                }
                $scope.getTotalOrderItem = function(type=null){
                    var total = 0;
                    var amount=0;

                    var itemCount=0;
                    angular.forEach($scope.orderItem, function(order) {
                        itemCount=itemCount+1;
                    });
                  
                    for(var i = 0; i < itemCount; i++){
                        var tot= parseInt($scope.orderItem[i].itemTotal);
                        total=total + tot;

                        
                    }           
                
                    
                    return total;
                }




    //UI
    //Edit Area
    $scope.form={'orderID':'','orderName':'','orderNumber':'','orderAuthorized':'','orderDate':'','orderFinishDate':'','orderStatus':'','orderDeliveryInstruction':'','orderDeliveryAddress':'','orderDesc':'','customerID':''};
    $scope.form.item=[{'orderID':'','itemID':'','productID':'','itemQty':'','itemUnitPrice':'','itemDiscount':'','product':'','readystock':'','itemTotal':'','leftInHand':'','extra':'N','itemDesc':''}];
    $scope.extra=[{'orderID':'','itemID':'','productID':'','itemQty':'','itemUnitPrice':'','itemDiscount':'','product':'','readystock':'','itemTotal':'','leftInHand':'','extra':'Y','itemDesc':''}];
     var requireForm=['sku','nama'];
    $scope.closeModal=()=>{

         // $scope.form=undefined;
         $scope.form={'orderID':'','orderName':'','orderNumber':'','orderAuthorized':'','orderDate':'','orderFinishDate':'','orderStatus':'','orderDeliveryInstruction':'','orderDeliveryAddress':'','orderDesc':'','customerID':''};
         $scope.form.item=[{'orderID':'','itemID':'','productID':'','itemQty':'','itemUnitPrice':'','itemDiscount':'','product':'','readystock':'','itemTotal':'','leftInHand':'','extra':'N','itemDesc':''}];
         $scope.extra=[{'orderID':'','itemID':'','productID':'','itemQty':'','itemUnitPrice':'','itemDiscount':'','product':'','readystock':'','itemTotal':'','leftInHand':'','extra':'Y','itemDesc':''}];

        $scope.operation="Add";
        $("#modal_theme_primary").modal('hide');


        
    }
    $scope.editButton=function(){
       
        $('#modal_theme_primary').modal('show');
       
        // console.log($scope.editImage);
        $scope.operation="Edit";
        


        order.getDetail(orderID).then(function(response){
        
          customer.getDetail(response.data.data.customerID).then(function(response){
            $scope.namaCustomer=response.data.data.customerName;
          })
            $scope.form={'orderID':response.data.data.orderID,
                         'orderName':response.data.data.orderName,
                         'orderNumber':response.data.data.orderNumber,
                         'orderAuthorized':response.data.data.orderAuthorized,
                         'orderDate':response.data.data.orderDate,
                         'orderFinishDate':response.data.data.orderFinishDate,
                         'orderStatus':response.data.data.orderStatus,
                         'orderDeliveryInstruction':response.data.data.orderDeliveryInstruction,
                         'orderDeliveryAddress':response.data.data.orderDeliveryAddress,
                         'orderDesc':response.data.data.orderDeliveryAddress,
                         'customerID':response.data.data.customerID};

          $scope.orderDate=new Date(response.data.data.orderDate);
          $scope.orderFinishDate=new Date(response.data.data.orderFinishDate);
          console.log($scope.orderDate);

            order.getItem(orderID).then(function(responses){
              
                $scope.form.item=[];
                $scope.extra=[];

                if(responses.data.status!="Error"){
                    var index=0;
                    var indexs=0;
                   
                    
                    

                   for (var i = 0; i < responses.data.data.length; i++) {

                    if(responses.data.data[i].extra=='Y'){
                      $scope.extra.push({'orderID':'','itemID':'','productID':'','itemQty':'','itemUnitPrice':'','itemDiscount':'','product':'','readystock':'','stok':'','itemTotal':'','leftInHand':'','extra':'Y','itemDesc':''});
                    $scope.extra[index].product=responses.data.data[i].namaProduk;
                     $scope.extra[index].readystock=responses.data.data[i].readystock;
                     $scope.extra[index].stok=responses.data.data[i].stok;
                     $scope.extra[index].leftInHand=responses.data.data[i].leftInHand;

                     $scope.extra[index].orderID=responses.data.data[i].orderID;
                     $scope.extra[index].itemID=responses.data.data[i].itemID;
                     $scope.extra[index].productID=responses.data.data[i].productID;
                     $scope.extra[index].itemQty=responses.data.data[i].itemQty;
                     $scope.extra[index].itemUnitPrice=responses.data.data[i].itemUnitPrice;
                     $scope.extra[index].itemDiscount=responses.data.data[i].itemDiscount;
                     $scope.extra[index].extra=responses.data.data[i].extra;
                     $scope.extra[index].itemDesc=responses.data.data[i].itemDesc;

                     index++;
                    }else{

                       $scope.form.item.push({'orderID':'','itemID':'','productID':'','itemQty':'','itemUnitPrice':'','itemDiscount':'','product':'','readystock':'','stok':'','itemTotal':'','leftInHand':'','extra':'N','itemDesc':''});
                     $scope.form.item[indexs].product=responses.data.data[i].namaProduk;
                     $scope.form.item[indexs].readystock=responses.data.data[i].readystock;
                     $scope.form.item[indexs].stok=responses.data.data[i].stok;
                     $scope.form.item[indexs].leftInHand=responses.data.data[i].leftInHand;

                     $scope.form.item[indexs].orderID=responses.data.data[i].orderID;
                     $scope.form.item[indexs].itemID=responses.data.data[i].itemID;
                     $scope.form.item[indexs].productID=responses.data.data[i].productID;
                     $scope.form.item[indexs].itemQty=responses.data.data[i].itemQty;
                     $scope.form.item[indexs].itemUnitPrice=responses.data.data[i].itemUnitPrice;
                     $scope.form.item[indexs].itemDiscount=responses.data.data[i].itemDiscount;
                     $scope.form.item[indexs].extra=responses.data.data[i].extra;
                     indexs++;
                    }
                   
                       console.log('yasd',$scope.form.item);
                       console.log('$s',$scope.extra);

                   }
                   $scope.form.item.push({'orderID':'','itemID':'','productID':'','itemQty':'','itemUnitPrice':'','itemDiscount':'','product':'','readystock':'','stok':'','itemTotal':'','leftInHand':'','extra':'N','itemDesc':''});
                        $scope.extra.push({'orderID':'','itemID':'','productID':'','itemQty':'','itemUnitPrice':'','itemDiscount':'','product':'','readystock':'','stok':'','itemTotal':'','leftInHand':'','extra':'Y','itemDesc':''});
                  
                }else{
                   $scope.form.item=[{'orderID':'','itemID':'','productID':'','itemQty':'','itemUnitPrice':'','itemDiscount':'','product':'','readystock':'','stok':'','itemTotal':'','leftInHand':'','extra':'N','itemDesc':''}];
                   $scope.extra=[{'orderID':'','itemID':'','productID':'','itemQty':'','itemUnitPrice':'','itemDiscount':'','product':'','readystock':'','stok':'','itemTotal':'','leftInHand':'','extra':'Y','itemDesc':''}];
                }
               
               
            })

        }) 



    }

    //customer choose
    $scope.seas='';
    $scope.cari='';
    var cs=this;
    
    $scope.customer=[];
    cs.pageno=1;
    cs.total_count=0;
    cs.sorting="desc";
    cs.itemsPerPage=10;
    cs.searche='null';
    cs.keywordSearch='customerName';

    $scope.showCase=false;
    cs.getCustomer=(pageno,search=null)=>{

        customer.get(pageno,cs.itemsPerPage,cs.searche,cs.sorting,cs.keywordSearch).then(function(result){
    
           
            if(result.data.data!=null){
                 $scope.customer=result.data.data;

             }else{
                $scope.customer=[];
             }
       
            cs.total_count=result.data.total_row;
    
        });
    }

    $scope.showw=function(){
      $scope.showCase=true;
      $('#modal_theme_primary1').modal('show');
      cs.getCustomer(cs.pageno,cs.search);

    }
   $scope.close=function(){
      $scope.showCase=false;
      $('#modal_theme_primary1').modal('hide');
    }
    
    $scope.pilihCustomer=(index,nama,id,address)=>{

      $scope.form.customerID=id;
      $scope.form.orderDeliveryAddress=address
      $scope.namaCustomer=$filter('uppercase')(nama); 
      $scope.close();
    }
    $scope.searchess=(s)=>{

        cs.searche=s;
        if(s==''){

            cs.searche='null';
        }

 
        $scope.filter=cs.getCustomer(1,cs.searche);
        
    }

    $scope.rels=function(){
        cs.itemsPerPage=$scope.select.type;
       
        cs.getCustomer(cs.pageno,cs.search);
    }


    $scope.sortClicks=(type)=>{
        if(type=='asc'){
            $scope.asc='active';
            cs.sorting='asc';
            $scope.desc='';
        }else{
            $scope.desc='active';
            cs.sorting='desc';
            $scope.asc='';
        }

        cs.getCustomer(cs.pageno,cs.search);

    }

    $scope.keywordSearch=(keyword)=>{
        cs.keywordSearch=keyword;
        console.log(cs.keywordSearch);
    }



    var ps=this;
    
    $scope.product=[];
    ps.pageno=1;
    ps.total_counts=0;
    ps.sorting="desc";
    ps.itemsPerPage=10;
    ps.searchess='null';
    ps.keywordSearchProduct='nama';

    $scope.showCaseProduct=false;
    cs.getProduct=(pageno,search=null)=>{

        product.get(pageno,ps.itemsPerPage,ps.searchess,ps.sorting,ps.keywordSearchProduct,'all').then(function(result){
    
           
            if(result.data.data!=null){
                 $scope.product=result.data.data;

             }else{
                $scope.product=[];
             }
       
            ps.total_counts=result.data.total_row;
    
        });
    }

    var indexProdukItem=0;
    $scope.showwProduct=function(index){
      $scope.showCaseProduct=true;
      indexProdukItem=index
      cs.getProduct(ps.pageno,ps.search);

    }
   $scope.closeProduct=function(){
      $scope.showCaseProduct=false;
      $('#modal_theme_primary2').modal('hide');
    }

    $scope.product=[];
    
    $scope.pilihProduct=(nama,id,harga,stok,leftInHand,readystock)=>{
      var found=false;
      for (var i = 0; i<$scope.form.item.length; i++) {
        if($scope.form.item[i].productID==id){
          found=true;
        }
      }
      $scope.closeProduct();

      if(!found){
        $scope.form.item[indexProdukItem].productID=id;
        $scope.form.item[indexProdukItem].stok=stok;
        $scope.form.item[indexProdukItem].readystock=readystock;
        $scope.form.item[indexProdukItem].itemUnitPrice=harga;
        $scope.form.item[indexProdukItem].leftInHand=leftInHand;
        $scope.form.item[indexProdukItem].product=$filter('uppercase')(nama);
      }else{
        swal({title:"Produk Telah Dipilih",type:"error",closeOnConfirm:true});
      }
 
      console.log($scope.form.item);
      // $scope.product[index]=$filter('uppercase')(nama); 
     
    }

    $scope.cekStok=(readystock,qty,stok,indexProdukItem)=>{


      var qt=parseInt(qty);
      var s=parseInt(stok);

      var oldqty=1;
     
      var re=readystock;

        setTimeout(function(){
         
          if(re!='N'){
            if($scope.form.item[indexProdukItem].orderID!=null){

              order.cekStok($scope.form.item[indexProdukItem].productID,qty,$scope.form.item[indexProdukItem].itemID).then(function(response){
               if(response.data.status!="cukup"){
                 $scope.form.item[indexProdukItem].itemQty=null;
                 $scope.form.item[indexProdukItem].itemQty=response.data.data;
                 swal({title:"Stok Tidak Mencukupi",type:"error",closeOnConfirm:true});
               }
              }) 
            }else{
              order.cekStok($scope.form.item[indexProdukItem].productID,qty).then(function(response){

               if(response.data.status!="cukup"){
                 $scope.form.item[indexProdukItem].itemQty=null;
                 $scope.form.item[indexProdukItem].itemQty=response.data.data;
                 swal({title:"Stok Tidak Mencukupi",type:"error",closeOnConfirm:true});
               }
              })
            }

            
          }
          

          
        },1000);

    }
    $scope.searchessProduct=(s)=>{

        ps.searchess=s;
        if(s==''){

            ps.searchess='null';
        }

 
        $scope.filter=ps.getProduct(1,ps.searchess);
        
    }

    $scope.relsProduct=function(){
        ps.itemsPerPage=$scope.select.type;
       
        ps.getCustomer(ps.pageno,ps.search);
    }


    $scope.sortClicksProduct=(type)=>{
        if(type=='asc'){
            $scope.asc='active';
            ps.sorting='asc';
            $scope.desc='';
        }else{
            $scope.desc='active';
            ps.sorting='desc';
            $scope.asc='';
        }

        ps.getProduct(ps.pageno,ps.search);

    }

    $scope.keywordSearchProduct=(keyword)=>{
        ps.keywordSearchProduct=keyword;
        console.log(cs.keywordSearch);
    }

  //submit form

  $scope.submit=()=>{

        var cek=1;
        for (var i =0; i < requireForm.length; i++) {
            if($scope.form+'.'+requireForm[i]!=""){
                cek=cek+i;
            }
        }

                      var newObj={};
                      angular.extend(newObj,$scope.rule);
                      $(".form-validate-jquery-edit").validate({
                            ignore: 'input[type=hidden], .select2-search__field', // ignore hidden fields
                            errorClass: 'validation-error-label',
                            successClass: 'validation-valid-label',
                            highlight: function(element, errorClass) {
                                $(element).removeClass(errorClass);
                            },
                            unhighlight: function(element, errorClass) {
                                $(element).removeClass(errorClass);
                            },

                            // Different components require proper error label placement
                            errorPlacement: function(error, element) {

                                // Styled checkboxes, radios, bootstrap switch
                                if (element.parents('div').hasClass("checker") || element.parents('div').hasClass("choice") || element.parent().hasClass('bootstrap-switch-container') ) {
                                    if(element.parents('label').hasClass('checkbox-inline') || element.parents('label').hasClass('radio-inline')) {
                                        error.appendTo( element.parent().parent().parent().parent() );
                                    }
                                     else {
                                        error.appendTo( element.parent().parent().parent().parent().parent() );
                                    }
                                }

                                // Unstyled checkboxes, radios
                                else if (element.parents('div').hasClass('checkbox') || element.parents('div').hasClass('radio')) {
                                    error.appendTo( element.parent().parent().parent() );
                                }

                                // Input with icons and Select2
                                else if (element.parents('div').hasClass('has-feedback') || element.hasClass('select2-hidden-accessible')) {
                                    error.appendTo( element.parent() );
                                }

                                // Inline checkboxes, radios
                                else if (element.parents('label').hasClass('checkbox-inline') || element.parents('label').hasClass('radio-inline')) {
                                    error.appendTo( element.parent().parent() );
                                }

                                // Input group, styled file input
                                else if (element.parent().hasClass('uploader') || element.parents().hasClass('input-group')) {
                                    error.appendTo( element.parent().parent() );
                                }

                                else {
                                    error.insertAfter(element);
                                }
                            },
                            validClass: "validation-valid-label",
                            success: function(label) {
                                label.addClass("validation-valid-label").text("Success.")
                            },
                            rules: newObj,
                            messages: {
                                custom: {
                                    required: "This is a custom error message",
                                },
                                agree: "Please accept our policy"
                            }
                        });

        if($('#form').valid()){
            if(cek == requireForm.length){

                for(var i=0; i<$scope.form.item.length; i++){

                  if($scope.form.item[i].productID==''){
                     $scope.form.item.splice(i, 1);
                     console.log("okee dihapus");
                  }
                 
                }

                for (var i = 0; i < $scope.extra.length; i++) {

                  if($scope.extra[i].itemDesc!='' && $scope.extra[i].itemQty!=''){
                    $scope.form.item.push({'orderID':$scope.extra[i].orderID,
                                          'itemID':$scope.extra[i].itemID,
                                          'productID':$scope.extra[i].productID,
                                          'itemQty':$scope.extra[i].itemQty,
                                          'itemUnitPrice':$scope.extra[i].itemUnitPrice,
                                          'itemDiscount':$scope.extra[i].itemDiscount,
                                          'product':$scope.extra[i].product,
                                          'readystock':$scope.extra[i].readystock,
                                          'itemTotal':$scope.extra[i].itemTotal,
                                          'leftInHand':$scope.extra[i].leftInHand,
                                          'extra':'Y',
                                          'itemDesc':$scope.extra[i].itemDesc}); 
                  }
                }

                order.edit($scope.form).then(function(response){
                    if(response.data.status=="Error"){
                        swal({title:'Gagal Mengubah',type:"error",closeOnConfirm:true});
                    }else{
                          $scope.getOrder(orderID);
                        swal("Success", "Data Berhasil Diubah.", "success");

                    }
                })
              

                $("#modal_theme_primary").modal('hide');
      
                

            }
        }

  }

  $scope.konfirmasiButton=(status,messengerID=null,orderNumber=null)=>{
      $scope.$broadcast('refresh','1');
    var data={'orderID':orderID,'status':status}
      order.changeStatus(data).then(function(response){
        if(response.data.status=="Success"){
          $scope.getOrder(orderID);
          if(messengerID!=''){
            var statuss="Dikonfirmasi dan Diproduksi";
            order.sendNotification(messengerID,orderNumber,statuss).then(function(result){
              console.log("berhasil");
          
            },function(error){
              console.log("gagal");

            })
          }
          // console.log(messengerID);

          $scope.konfirmasi=true;
        }else{
          swal("Pesanan Gagal Di konfirmasi","Error");
        }
      })
  }
  $scope.tgl='';

  $scope.pengiriman={'orderID':'','tanggal_pengiriman':'','kurir':'','berat':'','harga_pengiriman':'','tracking_kode':''};

  $scope.submitPengiriman=(orderiD,messengerID=null,orderNumber=null)=>{
    
    $scope.$broadcast('refresh','1');
  
       
    if($('#formPengiriman').valid()){
    
      var newDate=$filter('date')($scope.tgl,'yyyy-MM-dd');
       $scope.pengiriman.tanggal_pengiriman=newDate;
       $scope.pengiriman.orderID=orderiD;
       console.log($scope.pengiriman);
        order.pengiriman($scope.pengiriman).then(function(response){
              
              if(response.data.status=="Success"){
                $scope.getOrder($scope.order.orderID);
                if(messengerID!=''){
                  var statuss="Pengiriman";
                  order.sendNotification(messengerID,orderNumber,statuss).then(function(result){
                    console.log("berhasil");
                  },function(error){
                    console.log("gagal");
                  })
                }


              }else{
                swal({title:'Gagal, Coba Lagi ',type:"error",closeOnConfirm:true});
              }
              validatorPengiriman.resetForm();
              $scope.pengiriman={'orderID':'','tanggal_pengiriman':'','kurir':'','berat':'','harga_pengiriman':'','tracking_kode':''};
          
        })
    }
  }



  $scope.invo={'orderID':'','invoiceDate':'','invoiceDueDate':'','invoiceNote':''}
  $scope.submitInvoice=(orderid)=>{
    console.log($scope.invoiceDate);
    console.log($scope.invo);
    if($('#formInvoice').valid()){
       var newDate=$filter('date')($scope.tanggalPengiriman,'yyyy-MM-dd');
       $scope.invo.invoiceDate=$filter('date')($scope.invoiceDate,'yyyy-MM-dd');
       $scope.invo.invoiceDueDate=$filter('date')($scope.dueDate,'yyyy-MM-dd');
       $scope.invo.orderID=orderid
    
        validatorInvoice.resetForm();
      order.invoice($scope.invo).then(function(response){
           $scope.invo={'orderID':orderID,'invoiceDate':'','invoiceDueDate':'','invoiceNote':''}
            if(response.data.status=="Success"){
              $scope.getOrder($scope.order.orderID);
            }else{
              swal({title:'Gagal, Coba Lagi ',type:"error",closeOnConfirm:true});
            }
        
      })
    }
  }
    $scope.setting={};
    $scope.getSetting=()=>{
      setting.get().then(function(result){
        $scope.setting.nama_perusahaan=result.data.data.umum.nama_perusahaan;
        $scope.setting.alamat=result.data.data.umum.nama_perusahaan;
        $scope.setting.no_telp1=result.data.data.umum.no_telp1;
        $scope.setting.no_telp2=result.data.data.umum.no_telp2;
        $scope.setting.email=result.data.data.umum.email;
        $scope.setting.payment_detail=result.data.data.invoice.payment_detail;
      })
    }

    $scope.getSetting();

  const ter=require("angka-menjadi-terbilang");
  $scope.terbilang=function(nilai){
    console.log(ter(nilai));
    return ter(nilai);
  }

  $scope.sendInvoice=function(type,orderID,val){
    var messengerID='';
    var email='';
    if($scope.invState){
      $("body").block({
          message: '<i class="icon-spinner6 spinner"></i>',
          overlayCSS: {
              backgroundColor: '#1B2024',
              opacity: 0.85,
              cursor: 'wait'
          },
          css: {
              border: 0,
              padding: 0,
              backgroundColor: 'none',
              color: '#fff'
          }
      });
      if(type==="email"){
        email=val;
       
        order.sendEmail(email,orderID).then(function(result, status, headers, config){
           $('body').unblock();

            
              swal("Berhasil", "email Berhasil di kirim ke alamat ini "+email, "success");
           
        },function(error){
           $('body').unblock();
              swal("Gagal", "Gagal Mengirim email", "warning");
        });



      }else{

        messengerID=val;
        order.sendInvoiceMessenger(messengerID,orderID).then(function(result, status, headers, config){
           $('body').unblock();
           if(status!='401'){
             swal("Berhasil", "Invoice Berhasil di kirim ke messenger", "success");
           }else{
               swal("Gagal", "Gagal Mengirim Invoice", "");
           }
          
        },function(error){
           $('body').unblock();
             swal("Gagal", "Gagal Mengirim Invoice", "warning");
        });

      }
    }else{
      swal("Maaf, invoice belum dibuat", "silahkan buat invoice di bawah ini :)", "error");
    }



  }
}])
.controller('OrderSideCtrl',
    function($http,$scope,config,order,FileUploader,SweetAlert,$stateParams){
        //get all Product for sidebar 
        $scope.orderID=$stateParams.orderID;



        $scope.order={};
        $scope.sorting="desc";
  
        $scope.keywordSearch="orderNumber";
        $scope.search="";
        $scope.getAllOrder=()=>{

          order.getAllOrder(0,0,$scope.search,$scope.sorting,$scope.keywordSearch).then(function(result){
        
            $scope.order=result.data.data;


            
          });
        }


        $scope.getAllOrder();
        $scope.clik=(id)=>{
            $scope.orderID=id;

            $scope.$emit('side',id)
        }

        $scope.$on('refresh',function(event,data){
          $scope.getAllOrder();
          console.log("berhasil");
          
        });

        $scope.searches=()=>{

            $scope.search=$scope.src;
            if($scope.src==''){

                $scope.search='null'
            }
            $scope.getAllOrder();
            
        }
    }
).controller('OrderCtrlSide',
    function($http,$scope,config,order,FileUploader,SweetAlert,$stateParams){
        //get all Product for sidebar 
        $scope.clik=(type)=>{
      

            $scope.$emit('sideCtrl',type)
        }


    }
);