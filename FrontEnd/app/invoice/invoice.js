'use strict';

angular.module('myApp.invoice', ['ui.router','angularUtils.directives.dirPagination'])

.config(['$stateProvider', function($stateProvider) {
  // $routeProvider.when('/view1', {
  //   templateUrl: 'view1/view1.html',
  //   controller: 'View1Ctrl'
  // });
  $stateProvider

        // HOME STATES AND NESTED VIEWS ========================================
        .state('invoice', {
            url: '/invoice',
    		    views: {

                '': { templateUrl: 'invoice/invoice.html',controller: 'InvoiceCtrl' },
    		        // main sidebar diletakkan di setiap module angularjs 
    		        'main-sidebar@invoice': { 
    		            templateUrl: '../app/template/layout/sidebar1.html',
    		            
    		        }
    		    },data:{
              authorizedRoles: ["Pegawai"]
            },resolve:{

              //cek koneksi terlebih dahulu
              cekConnection:function($q){
                return $q.resolve();
              }
            }
        });
}])

.controller('InvoiceCtrl', ['$http','$scope','config','invoice','order','FileUploader','SweetAlert','$filter','setting',function($http,$scope,config,invoice,order,FileUploader,SweetAlert,$filter,setting) {
    const moment=require('moment');
    var vm=this;
    $scope.invoice=[];
    vm.pageno=1;
    vm.total_count=0;
    vm.sorting="desc";
    vm.itemsPerPage=10;
    vm.itemByMonth='null';
    vm.itemByStatus='null';
    vm.search='null';
    vm.keywordSearch='';
    $scope.search="";
    $scope.order={};


  $scope.month=[{'month':'Januari','num':'01'},
                {'month':'Februari','num':'02'},
                {'month':'Maret','num':'03'},
                {'month':'April','num':'04'},
                {'month':'Mei','num':'05'},
                {'month':'Juni','num':'06'},
                {'month':'Juli','num':'07'},
                {'month':'Agustus','num':'08'},
                {'month':'September','num':'09'},
                {'month':'Oktober','num':'10'},
                {'month':'November','num':'11'},
                {'month':'Desember','num':'12'}];

  $scope.status=[{name:'Paid',value:'Paid'},{name:'Waiting Payment',value:'Waiting Payment'},{name:'Cancel',value:'Cancel'}];

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

  $scope.perPage=function(){
      vm.itemsPerPage=$scope.select.type;
       vm.getInvoice(1);

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
         vm.getInvoice(1);
    }
    $scope.keywordSearchSet=(keyword)=>{
        vm.keywordSearch=keyword;
        console.log(vm.keywordSearch);
         vm.getInvoice(1);
    }

    $scope.searches=()=>{
        console.log($scope.search);
        vm.search=$scope.search;
        if($scope.search==''){

            vm.search='null'
        }
         vm.getInvoice(1);
    }

    $scope.byMonth=(value)=>{
      if(value=="All"){
        vm.itemByMonth='null';
      }else{
        vm.itemByMonth=value;
      }
       vm.getInvoice(1);
    }
    $scope.byStatus=(value)=>{
      if(value=="All"){
        vm.itemByStatus='null';
      }else{
        vm.itemByStatus=value;
      }
       vm.getInvoice(1);
    }


    vm.getInvoice=(pageno)=>{

        invoice.get(pageno,vm.itemsPerPage,vm.search,vm.sorting,vm.keywordSearch,vm.itemByMonth,vm.itemByStatus).then(function(result){
    
           
            if(result.data.data!=null){
                 $scope.invoice=result.data.data;
                 var date;
                 var it=0;
                 angular.forEach($scope.invoice,function(item){
                    date=$filter('date')(item.invoiceDate, "MM");
                    console.log(date);
                    for (var i = 0; i < $scope.month.length; i++) {
                      if(date==$scope.month[i].num){
                        $scope.invoice[it].group=$scope.month[i].month;
                      }
                    }

                    it++;
                    
                 })
                 console.log(vm.invoice);

             }else{
                // vm.customer=[];
                $scope.invoice=[];
             }
        
            vm.total_count=result.data.total_row;

            //gabung kan invoice


            console.log(result.data.total_row);
            console.log(result.data.data);
    
        });
    }

    vm.getInvoice(1);

    $scope.diffDay=(startDate,endDate)=>{
        var date = new Date();
        var dateNow = date.getFullYear() + '-' + ('0' + (date.getMonth() + 1)).slice(-2) + '-' + ('0' + date.getDate()).slice(-2)

        var startDate = moment(startDate);
        if(startDate<dateNow){
          startDate = moment(startDate);
        }else{
          startDate = moment(dateNow);
        }


        var endDate = moment(endDate);

        var result = endDate.diff(startDate, 'days');


  
        return result;
    }

    $scope.invoicess={};

    $scope.getDetail=(invoiceID)=>{
        invoice.detail(invoiceID).then(function(response){
           $scope.order=response.data.data;
          $scope.$apply()
            
    
        });
    }
    $scope.lihatInvoice=(invoiceID)=>{
      $scope.getDetail(invoiceID);
      console.log($scope.order);
      $('#modal_theme_primary').modal('show');

    }

    $scope.closeModal=()=>{
      $("#modal_theme_primary").modal('hide');
    }
    $scope.getTotalOrderItem = function(type=null){
        var total = 0;
        var amount=0;

        var itemCount=0;
        angular.forEach($scope.order.item, function(order) {
            itemCount=itemCount+1;
        });
      
        for(var i = 0; i < itemCount; i++){
            var tot= parseInt($scope.order.item[i].itemTotal);
            total=total + tot;

            
        }       
    
    
        
        return total;
    }
    const ter=require("angka-menjadi-terbilang");
    $scope.terbilang=function(nilai){
      console.log(ter(nilai));
      return ter(nilai);
    }


    const ipc=require('electron').ipcRenderer;
    


    $scope.print=()=>{

      ipc.send('print-to-pdf');
    }
    

    $scope.prints=(invoiceID)=>{
      $scope.getDetail(invoiceID);  
      $scope.print();
    }

    $scope.changeStatus=(idInvoice,status,orderNumber,messengerID)=>{
      console.log(status);
                      swal({
                       title: "Anda Yakin Ingin Mengubah Status Invoice?",
                       text: status,
                       type: "warning",
                       showCancelButton: true,
                       confirmButtonColor: "#DD6B55",confirmButtonText: "Ya!",
                       cancelButtonText: "No, cancel !",
                       closeOnConfirm: false,
                       closeOnCancel: false }, 
                        function(isConfirm){ 
                            if(isConfirm){

                             invoice.changeStatus(status,idInvoice).then(function(response){
                                  console.log(response);

                                   if (response.data.status="Success") {
                                      if(status==='Paid'){
                                        status="Terbayar";
                                        invoice.sendNotification(messengerID,orderNumber,status).then(function(result){
                                          console.log("berhasil");
                                      
                                        },function(error){
                                          console.log("gagal");

                                        })
                                      }
            
                                      swal("Berhasi!", "Status Berhasil Diubah.", "success");
                                       vm.getInvoice(1);


                                   } else {
                                      swal("Gagal", "Gagal Mengubah :)", "error");
                                   }
                                  
                              });
                            }else{
                              swal("Cancelled", "Cancelled:)", "error");
                            }

                      });
    }

    //get invoice configuration

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
    $scope.remove=(id)=>{
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

                invoice.delete(id).then(function(response){
                    console.log(response);

                     if (response.data.status="Success") {
                        swal("Deleted!", "Data Berhasil Dihapus.", "success");

                        vm.getInvoice(1);
                     } else {
                        swal("Cancelled", "Deleted Cancelled :)", "error");
                     }
                    
                });
              }else{
                swal("Cancelled", "Deleted Cancelled:)", "error");
              }

        });

    }
  $scope.sendInvoice=function(type,orderID,val){
    var messengerID='';
    var email='';
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


  }
   //  $scope.pageName='';

   //  $scope.url='http://localhost/hdkreasi';
   //  $scope.breadcrumb='';





   //  var vm=this;
   //  vm.invoice=[];
   //  vm.pageno=1;
   //  vm.total_count=0;
   //  vm.sorting="desc";

   //  $scope.jenisProduk="Single";
   //  $scope.editImage=false;

    
   //  vm.itemsPerPage=10;
   //  vm.search='null';
   //  vm.keywordSearch='';
   //  $scope.search="";
   //  $scope.operation="Add";

   //  $scope.option=[
   //      {name:'10',value:'1'},
   //      {name:'20',value:'20'},
   //      {name:'30',value:'30'},
   //      {name:'40',value:'40'},
   //      {name:'50',value:'50'},
   //      {name:'60',value:'60'},
   //      {name:'70',value:'70'},
   //      {name:'80',value:'80'},
   //      {name:'90',value:'90'},
   //      {name:'100',value:'100'},

   //      ];

   //  $scope.select={type:$scope.option[0].value};

   //  var requireForm=['customerName','phone'];


   //  //fungsi untuk mendapatkan data customer

   //  //when page start load the data;
   //  vm.getCustomer(vm.pageno,vm.search);

   //  $scope.reload=()=>{
   //      alert("asdfasdfasdf");
   //  }

   //  $scope.searches=()=>{

   //      vm.search=$scope.search;
   //      if($scope.search==''){

   //          vm.search='null'
   //      }
   //      $scope.filter=vm.getCustomer(1,vm.search);
        
   //  }



   //  $scope.reloadData=()=>{
   //      vm.search='null';
   //      vm.getCustomer(vm.pageno);
   //  }


   //  $scope.sortClick=(type)=>{
   //      if(type=='asc'){
   //          $scope.asc='active';
   //          vm.sorting='asc';
   //          $scope.desc='';
   //      }else{
   //          $scope.desc='active';
   //          vm.sorting='desc';
   //          $scope.asc='';
   //      }

   //      vm.getCustomer(vm.pageno,vm.search);

   //  }

   //  $scope.keywordSearchSet=(keyword)=>{
   //      vm.keywordSearch=keyword;
   //      console.log(vm.keywordSearch);
   //  }
   //  //uploader
   //      //init uploader
   //  var uploader = $scope.uploader = new FileUploader({
   //            url: config.apiUrl+'/customers/uploadmedia',
   //            queueLimit:2,
   //            headers:{'Authorization':'Basic YWRtaW46MTIzNA=='}
   //  });
   // // FILTERS




   //  $scope.editButton=function(id){
   
   //      validator.resetForm();
   //      $('#modal_theme_primary').modal('show');
   //     console.log($scope.editImage);
   //      // console.log($scope.editImage);
   //      $scope.operation="Edit";
        


   //      customer.getDetail(id).then(function(response){
   //              $scope.form.customerID=response.data.data.customerID;
   //              $scope.form.customerName=response.data.data.customerName;
   //              $scope.form.address=response.data.data.address;
   //              $scope.form.photo=response.data.data.photo;
   //              $scope.form.company=response.data.data.company;
   //              $scope.form.email=response.data.data.email;
   //              $scope.form.phone=response.data.data.phone;


   //              if(response.data.data.photo!=null){
   //                   $scope.editImage=true;
   //              }

   //      }) 



   //  }
   //  $scope.formModals=()=>{
   //      // Reset form
        
       
   //      $scope.editImage=false;
   //      validator.resetForm();
   //        $("input[type=text], textarea").val("");
   //        $('input[type=file]').val('');
   //        console.log($scope.editImage);
   //      // $scope.form.readystock='Y';
   //      $scope.categoryData=[];


   //    $("#modal_theme_primary").modal('show');


  

   //  }






}])
