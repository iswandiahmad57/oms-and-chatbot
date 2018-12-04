'use strict';

angular.module('myApp.shipping', ['ui.router','angularUtils.directives.dirPagination'])

.config(['$stateProvider', function($stateProvider) {
  // $routeProvider.when('/view1', {
  //   templateUrl: 'view1/view1.html',
  //   controller: 'View1Ctrl'
  // });
  $stateProvider

        // HOME STATES AND NESTED VIEWS ========================================
        .state('shipping', {
            url: '/shipping',
		    views: {

            '': { templateUrl: 'shipping/shipping.html',controller: 'ShippingCtrl' },
		        // main sidebar diletakkan di setiap module angularjs 
		        'main-sidebar@shipping': { 
		            templateUrl: '../app/template/layout/sidebar1.html',
		            
		        }
		    },
        data:{
              authorizedRoles: ["Admin","Pegawai"]
        },resolve:{

          //cek koneksi terlebih dahulu
          cekConnection:function($q){
            return $q.resolve();
          }
        }
        });
}])

.controller('ShippingCtrl', ['$http','$scope','config','shipping','order','FileUploader','SweetAlert','$filter',function($http,$scope,config,shipping,order,FileUploader,SweetAlert,$filter) {
    const moment=require('moment');
    var vm=this;
    vm.shipping=[];
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
    $scope.oper="";


  $scope.orderGet=()=>{
    order.getOrderSimple().then(function(result){
      $scope.order=result.data.data
    })
  }

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

  $scope.statuss=[{name:'Pengiriman',value:'Pengiriman'},{name:'Diterima',value:'Diterima'}];

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
       vm.getShipping(1);

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
         vm.getShipping(1);
    }
    $scope.keywordSearchSet=(keyword)=>{
        vm.keywordSearch=keyword;
        console.log(vm.keywordSearch);
         vm.getShipping(1);
    }

    $scope.searches=()=>{
        console.log($scope.search);
        vm.search=$scope.search;
        if($scope.search==''){

            vm.search='null'
        }
         vm.getShipping(1);
    }

    $scope.byMonth=(value)=>{
      if(value=="All"){
        vm.itemByMonth='null';
      }else{
        vm.itemByMonth=value;
      }
       vm.getShipping(1);
    }
    $scope.byStatus=(value)=>{
      if(value=="ALl"){
        vm.itemByStatus='null';
      }else{
        vm.itemByStatus=value;
      }
       vm.getShipping(1);
    }
    vm.getShipping=(pageno)=>{

        shipping.get(pageno,vm.itemsPerPage,vm.search,vm.sorting,vm.keywordSearch,vm.itemByMonth,vm.itemByStatus).then(function(result){
    
           
            if(result.data.data!=null){
                 vm.shipping=result.data.data;
                 var date;
                 var it=0;
                 angular.forEach(vm.shipping,function(item){
                    date=$filter('date')(item.tanggal_pengiriman, "MM");
                    console.log(date);
                    for (var i = 0; i < $scope.month.length; i++) {
                      if(date==$scope.month[i].num){
                        vm.shipping[it].group=$scope.month[i].month;
                      }
                    }

                    it++;
                    
                 })
                 console.log(vm.invoice);

             }else{
                // vm.customer=[];
                vm.shipping=[];
             }
        
            vm.total_count=result.data.total_row;
            console.log(vm.shipping);

            //gabung kan invoice

    
        });
    }

    vm.getShipping(1);

    $scope.diffDay=(startDate,endDate)=>{
        var startDate = moment(startDate);
        var endDate = moment(endDate);

        var result = endDate.diff(startDate, 'days');
        console.log(result);

        return result;
    }




    $scope.changeStatus=(id,status)=>{
      console.log(status);
                      swal({
                       title: "Anda Yakin Ingin Mengubah Status Pengiriman?",
                       text: status,
                       type: "warning",
                       showCancelButton: true,
                       confirmButtonColor: "#DD6B55",confirmButtonText: "Ya!",
                       cancelButtonText: "No, cancel !",
                       closeOnConfirm: false,
                       closeOnCancel: false }, 
                        function(isConfirm){ 
                            if(isConfirm){

                             shipping.changeStatus(status,id).then(function(response){
                                  console.log(response);

                                   if (response.data.status="Success") {
            
                                      swal("Berhasi!", "Status Berhasil Diubah.", "success");
                                       vm.getShipping(1);


                                   } else {
                                      swal("Gagal", "Gagal Mengubah :)", "error");
                                   }
                                  
                              });
                            }else{
                              swal("Cancelled", "Cancelled:)", "error");
                            }

                      });
    }


    $scope.closeMo=()=>{
      $("#modal_theme_order").modal('hide');
    }


    ///order

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

    var requireForm=['sku','nama'];

    var orderFrom='Manual';
  
  //fungsi untuk mendapatkan data product
  vm.getOrder=(pageno,search=null)=>{

    order.get(pageno,vm.itemsPerPage,vm.search,vm.sorting,vm.keywordSearchO,null,'manual',orderFrom).then(function(result){
  
      vm.orders=result.data.data;
      vm.total_count_order=result.data.total_row;
      console.log(result.data.total_row);
      console.log(result.data.data);
  
    });
  }
  //when page start load the data;
 

    $scope.show=function(){
       vm.getOrder(vm.pageno,vm.search);
      $('#modal_theme_order').modal('show');
    
    }

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


    var orderID='';
    $scope.pilihOrder=(nama,id)=>{
      orderID=id
      $scope.namaOrder=$filter('uppercase')(nama); 
      $scope.viewOrder=id+'|  '+$scope.namaOrder;

      $scope.closeMo();
    }

  $scope.tgl='';

  $scope.pengiriman={'orderID':'','tanggal_pengiriman':'','kurir':'','berat':'','harga_pengiriman':'','tracking_kode':''};

  var idPeng="";
  $scope.submitPengiriman=()=>{
    
    $scope.$broadcast('refresh','1');
    if($scope.oper=="Add"){
      if($('#formPengiriman').valid()){
        $scope.pengiriman.orderID=orderID;
        var newDate=$filter('date')($scope.tgl,'yyyy-MM-dd');
         $scope.pengiriman.tanggal_pengiriman=newDate;
         console.log($scope.pengiriman);
          order.pengiriman($scope.pengiriman).then(function(response){
                
                if(response.data.status=="Success"){
                  vm.getShipping(1);
                  $scope.closeModal();
                }else{
                  swal({title:'Gagal, Coba Lagi ',type:"error",closeOnConfirm:true});
                }
                $scope.pengiriman={'orderID':'','tanggal_pengiriman':'','kurir':'','berat':'','harga_pengiriman':'','tracking_kode':''};
            
          })
      }
    }else{
      if($('#formPengiriman').valid()){

                    $scope.pengiriman.id=idPeng;
                    shipping.edit($scope.pengiriman).then(function(response){

                        if(response.data.status=="Error"){
                            swal({title:"Gagal Mengedit",type:"error",closeOnConfirm:true});
                        }else{
                            vm.getShipping(1);
                            $scope.closeModal();
                            swal("Success", "Data Berhasil Di edit.", "success");

                        }
                    })
      }
    }
       

  }

  $scope.ek=true;

  $scope.editButton=(id)=>{

   $scope.oper="Edit";
    shipping.getDetail(id).then(function(result){
      idPeng=result.data.data.id;
      $scope.pengiriman.orderID=result.data.data.orderID;
      $scope.tgl=new Date(result.data.data.tanggal_pengiriman);
      $scope.pengiriman.kurir=result.data.data.kurir;
      $scope.pengiriman.berat=result.data.data.berat;
      $scope.pengiriman.harga_pengiriman=result.data.data.harga_pengiriman;
      $scope.pengiriman.tracking_kode=result.data.data.tracking_kode;
    })
  
     $("#modal_theme_primary").modal('show');


  }
    $scope.formModal=()=>{
        // Reset form

      
          $("input[type=text], textarea").val("");
          $('input[type=file]').val('');
          $('input[type=date]').val('');
        $scope.orderGet();
        $scope.oper="Add";
      $("#modal_theme_primary").modal('show');

    }
    $scope.closeModal=()=>{
      $("#modal_theme_primary").modal('hide');
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

                shipping.delete(id).then(function(response){
                    console.log(response);

                     if (response.data.status="Success") {
                        swal("Deleted!", "Data Berhasil Dihapus.", "success");

                        vm.getShipping(1);
                     } else {
                        swal("Cancelled", "Deleted Cancelled :)", "error");
                     }
                    
                });
              }else{
                swal("Cancelled", "Deleted Cancelled:)", "error");
              }

        });

    }
  $scope.orderDeliveryAddress="";
  $scope.custName="";
  const ipc=require('electron').ipcRenderer;
    $scope.print=(address,name)=>{
      $scope.orderDeliveryAddress=address;
      $scope.custName=name
      ipc.send('print-to-pdf');
    }

}])
