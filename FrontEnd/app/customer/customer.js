'use strict';

angular.module('myApp.customer', ['ui.router','angularUtils.directives.dirPagination'])

.config(['$stateProvider', function($stateProvider) {
  // $routeProvider.when('/view1', {
  //   templateUrl: 'view1/view1.html',
  //   controller: 'View1Ctrl'
  // });
  $stateProvider

        // HOME STATES AND NESTED VIEWS ========================================
        .state('customer', {
            url: '/customer/:type',
		    views: {

		        // the main template will be placed here (relatively named)
		        '': { templateUrl: 'customer/customer.html',controller: 'CustomerCtrl' },


		        // main sidebar diletakkan di setiap module angularjs 
		        'main-sidebar@customer': { 
		            templateUrl: '../app/template/layout/sidebar1.html',
		            
		        }
		    }
        });
}])

.controller('CustomerCtrl', ['$http','$scope','config','customer','FileUploader','SweetAlert','$stateParams','$rootScope',function($http,$scope,config,customer,FileUploader,SweetAlert,$stateParams,$rootScope) {
    $scope.pageName='';

    $scope.url='http://localhost/hdkreasi';
    $scope.breadcrumb='';
    $scope.form={'customerID':'','email':'','phone':'','company':'','address':'','messengerID':''};

    var type=$stateParams.type;
    if(type=='chatbot'){
      $rootScope.people=0;
    }



    var vm=this;
    vm.customer=[];
    vm.pageno=1;
    vm.total_count=0;
    vm.sorting="desc";

    $scope.jenisProduk="Single";
    $scope.editImage=false;

    
    vm.itemsPerPage=10;
    vm.search='null';
    vm.keywordSearch='customerName';
    $scope.search="";
    $scope.operation="Add";

    $scope.option=[
        {name:'10',value:'10'},
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

    var requireForm=['customerName','phone'];


    //fungsi untuk mendapatkan data customer
    vm.getCustomer=(pageno,search=null)=>{

        customer.get(pageno,vm.itemsPerPage,vm.search,vm.sorting,vm.keywordSearch,type).then(function(result){
    
           
            if(result.data.data!=null){
                 vm.customer=result.data.data;

             }else{
                vm.customer=[];
             }
             console.log(vm.customer);
            vm.total_count=result.data.total_row;

            console.log(result.data.total_row);
            console.log(result.data.data);
    
        });
    }
    //when page start load the data;
    vm.getCustomer(vm.pageno,vm.search);

    $scope.reload=()=>{
        alert("asdfasdfasdf");
    }

    $scope.searches=()=>{

        vm.search=$scope.search;
        if($scope.search==''){

            vm.search='null'
        }
        $scope.filter=vm.getCustomer(1,vm.search);
        
    }

    $scope.rel=function(){
        vm.itemsPerPage=$scope.select.type;
        console.log($scope.select.type);
        vm.getCustomer(vm.pageno,vm.search);
    }


    $scope.reloadData=()=>{
        vm.search='null';
        vm.getCustomer(vm.pageno);
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

        vm.getCustomer(vm.pageno,vm.search);

    }

    $scope.keywordSearchSet=(keyword)=>{
        vm.keywordSearch=keyword;
        console.log(vm.keywordSearch);
    }
    //uploader
        //init uploader
    var uploader = $scope.uploader = new FileUploader({
              url: config.apiUrl+'/customers/uploadmedia',
              queueLimit:2,
              headers:{'Authorization':'Basic YWRtaW46MTIzNA=='}
    });
   // FILTERS




    $scope.editButton=function(id){
   
        validator.resetForm();
        $('#modal_theme_primary').modal('show');
       console.log($scope.editImage);
        // console.log($scope.editImage);
        $scope.operation="Edit";
        


        customer.getDetail(id).then(function(response){
                $scope.form.customerID=response.data.data.customerID;
                $scope.form.customerName=response.data.data.customerName;
                $scope.form.address=response.data.data.address;
                $scope.form.photo=response.data.data.photo;
                $scope.form.company=response.data.data.company;
                $scope.form.email=response.data.data.email;
                $scope.form.phone=response.data.data.phone;


                if(response.data.data.photo!=null){
                     $scope.editImage=true;
                }

        }) 



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


      $("#modal_theme_primary").modal('show');


  

    }





    //submit form

    $scope.submit=()=>{

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
            
                        customer.add($scope.form).then(function(response){
                            if(response.data.status=="Error Email"){
                              swal({title:"Email Sudah Ada, Silahkan masukkan email yang lainnya",type:"error",closeOnConfirm:true});
                            }else{

                              if(response.data.status=="Error"){

                                  swal({title:"Gagal Menyimpan data",type:"error",closeOnConfirm:true});
                              }else{
                                  swal("Success", "Data Berhasil Disimpan.", "success");
                                  vm.getCustomer(1);
                              }
                              $("#modal_theme_primary").modal('hide');
                            }

                        })      
     
    
                }else{
               
                    customer.edit($scope.form).then(function(response){

                        if(response.data.status=="Error"){
                            swal({title:"Gagal Mengubah",type:"error",closeOnConfirm:true});
                        }else{
                            vm.getCustomer(1);

                            swal("Success", "Data Berhasil Diubah.", "success");

                        }
                    })
                    $("#modal_theme_primary").modal('hide');
                }

                
                if(uploader.queue.length != 0){
                    uploader.queue[0].remove();
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
        if($scope.operation=='Edit' && $scope.form.photo!=''){
           $scope.removeFile();
            $scope.editImage=false; 
        }
         if(uploader.queue.length> 1){
            uploader.removeFromQueue(0);
            $scope.postData={'namaFile':$scope.form.photo};
            //+btoa(username+":"+password);
            $http.post(config.apiUrl+'/customers/unlink',{'namaFile':$scope.form.photo},{
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
          $scope.form.photo=response.newname;
        }



     

    };

    $scope.removeFile=()=>{

        if($scope.operation=='Add'){
             uploader.queue[0].remove();
        }
        
       $scope.postData={'namaFile':$scope.form.photo};
        //+btoa(username+":"+password);
        $http.post(config.apiUrl+'/customers/unlink',{'namaFile':$scope.form.photo},{
            headers:{'Authorization':'Basic YWRtaW46MTIzNA=='}
        });

        $scope.form.photo='NULL';
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

                customer.delete(id).then(function(response){
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


    //remove multiple data
    $scope.checkAll = function () {

        if (!$scope.selectedAll) {
            $scope.selectedAll = false;
        } else {
            $scope.selectedAll = true;
        }
        angular.forEach(vm.customer, function(cust) {
            cust.selected = $scope.selectedAll;
        });
    };    


    $scope.removeSelected = function(){
        var newDataList=[];
        
        var customerIDCollect=[];
        var i=0;

        angular.forEach(vm.customer, function(selected){
            if(selected.selected==true){
               customerIDCollect[i]=selected.customerID; 
                i++;
            }
            
        }); 

        if(customerIDCollect.length < 1){
             swal("Cancelled", "Tidak ada Data dipilih:)", "error");
        }else{
            swal({
             title: "Are you sure?",
             text: customerIDCollect.length +" data akan dihapus",
             type: "warning",
             showCancelButton: true,
             confirmButtonColor: "#DD6B55",confirmButtonText: "Yes, delete it!",
             cancelButtonText: "No, cancel !",
             closeOnConfirm: false,
             closeOnCancel: false }, 
              function(isConfirm){ 
                  if(isConfirm){

                    customer.deleteCollect(customerIDCollect).then(function(response){
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


    $scope.closeModal=()=>{

        

        $scope.operation="Add";
        $("#modal_theme_primary").modal('hide');
        console.log($scope.operation);
        $scope.editImage=false;

        if(uploader.queue.length != 0){
                $http.post(config.apiUrl+'/customers/unlink',{'namaFile':$scope.form.photo},{
                    headers:{'Authorization':'Basic YWRtaW46MTIzNA=='}
                 });
            uploader.queue[0].remove();
            
        }
        $scope.form={'customerID':'','email':'','phone':'','company':'','address':'','messengerID':''};

        
    }

    $scope.invoice={};
    $scope.beforeCollapse=0;
    $scope.any=false;
    $scope.custId="";
    var iv=this;
    iv.pageno=1;
    iv.itemsPerPage=10;
    iv.total_count=0;
    $scope.select={types:$scope.option[0].value};

    $scope.getInvoice=(pageno)=>{
      customer.invoiceHistory(iv.pageno,iv.itemsPerPage,$scope.custId).then(function(result){
          $scope.invoice=result.data.data;
          iv.total_count=result.data.total_row;
          if($scope.invoice.invoice.length!=0){
            $scope.any=true;
          }
          console.log($scope.invoice.invoice);
          console.log("adsfad",$scope.any);
      })
    }
    $scope.invoiceHistory=(index,customerID)=>{

      if($scope.beforeCollapse!=0){
        $('#demo'+$scope.beforeCollapse).collapse('hide');
      }

      $('#demo'+index).collapse('show');
      $scope.beforeCollapse=index;
      $scope.custId=customerID;

      $scope.getInvoice(1);

    }
    $scope.rels=function(){
        iv.itemsPerPage=$scope.select.types;

  
        $scope.getInvoice(1);
        
    }

    var custID="";

                $scope.productReport=(customerID)=>{

                  validators.resetForm();
                  custID=customerID;
                  $('input[type=text]').val('');
                  $('#modal_theme_primary_report').modal('show');
                }

                $scope.closeModals=()=>{
                  $('#modal_theme_primary_report').modal('hide');
                }

                 const ipc=require('electron').ipcRenderer;

           
                 var sourceFolder='';
                 $scope.submitting=false;
                 $scope.openBrowser=()=>{
                  ipc.send('open-file-dialog');
                 }
                  $scope.filename=null;
                  $scope.folder=null;
                 $scope.download=()=>{
                  console.log(custID);

                  if($('#formQ').valid()){
                      $scope.submitting=true;
                      var url="";
                     url=config.apiUrl+"/remote/report_customer_id/"+custID;
                      
                      var data={'filename':$scope.filename,'sourceFolder':sourceFolder,'url':url};
                      ipc.send('download',data);
                  }

                 }
                 $scope.folder=null;

                 ipc.on('selected-directory', function (event, path) {
                  console.log(event);
                  console.log(path);
                  $scope.$apply(function(){
                      $scope.folder= path;
                  });

                  sourceFolder=path;
                })

                 $scope.count=0;
                 ipc.on('back',function(event,path){
                  console.log('a',event);
                  console.log('v',path);

                    if(path=='success'){
                      $scope.count=100;
                      $scope.filename=null;
                      $scope.folder=null;
                      $scope.$apply(function(){
                            $scope.submitting=false;
                        });

                        validator.resetForm();
                              // alert('Data Berhasil Disimpan');
                              $scope.closeModals();
                    }else{
                      $scope.$apply(function(){
                          $scope.count= Math.round(path);
                      });
                    }
                  
                 })



}])
