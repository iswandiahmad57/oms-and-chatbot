'use strict';

angular.module('myApp.pegawai', ['ui.router','angularUtils.directives.dirPagination'])

.config(['$stateProvider', function($stateProvider) {
  // $routeProvider.when('/view1', {
  //   templateUrl: 'view1/view1.html',
  //   controller: 'View1Ctrl'
  // });
  $stateProvider

        // HOME STATES AND NESTED VIEWS ========================================
        .state('pegawai', {
            url: '/pegawai',
		    views: {

		        // the main template will be placed here (relatively named)
		        '': { templateUrl: 'pegawai/pegawai.html',controller: 'PegawaiCtrl' },


		        // main sidebar diletakkan di setiap module angularjs 
		        'main-sidebar@pegawai': { 
		            templateUrl: '../app/template/layout/sidebar1.html',
		            
		        }
		    },
        data:{
              authorizedRoles: ["Admin"]
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


.controller('PegawaiCtrl', ['$http','$scope','config','employe','FileUploader','SweetAlert',function($http,$scope,config,employe,FileUploader,SweetAlert) {
    $scope.pageName='';

    $scope.url=config.url;
    $scope.breadcrumb='';
    $scope.form={'employeID':'','email':'','password':'','name':'','contact_phone':'','role':'Pegawai'};





    var vm=this;
    vm.employe=[];
    vm.pageno=1;
    vm.total_count=0;
    vm.sorting="desc";


    
    vm.itemsPerPage=10;
    vm.search='null';
    vm.keywordSearch='name';
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
    vm.getEmploye=(pageno,search=null)=>{

        employe.get(pageno,vm.itemsPerPage,vm.search,vm.sorting,vm.keywordSearch).then(function(result){
    
           
            if(result.data.data!=null){
                 vm.employe=result.data.data;

             }else{
                vm.employe=[];
             }
             console.log(vm.employe);
            vm.total_count=result.data.total_row;

    
        });
    }
    //when page start load the data;
    vm.getEmploye(vm.pageno,vm.search);

    $scope.reload=()=>{
        alert("asdfasdfasdf");
    }

    $scope.searches=()=>{

        vm.search=$scope.search;
        if($scope.search==''){

            vm.search='null'
        }
        $scope.filter=vm.getEmploye(1,vm.search);
        
    }

    $scope.rel=function(){
        vm.itemsPerPage=$scope.select.type;
      
        vm.getEmploye(vm.pageno,vm.search);
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

        vm.getEmploye(vm.pageno,vm.search);

    }

    $scope.keywordSearchSet=(keyword)=>{
        vm.keywordSearch=keyword;
        console.log(vm.keywordSearch);
    }
    //uploader




    $scope.editButton=function(id){
   
        validator.resetForm();
        $('#modal_theme_primary').modal('show');
       console.log($scope.editImage);
        // console.log($scope.editImage);
        $scope.operation="Edit";
        


        employe.getDetail(id).then(function(response){
                $scope.form.employeID=response.data.data.employeID;
                $scope.form.email=response.data.data.email;
                $scope.form.name=response.data.data.name;
                $scope.form.password=response.data.data.password;
                $scope.form.role=response.data.data.role;
                $scope.form.contact_phone=response.data.data.contact_phone;

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

         
        if($('#form').valid()){
            if(cek == requireForm.length){
                if($scope.operation=="Add"){
            
                        employe.addPegawai($scope.form).then(function(response){
                      
                            if(response.data.status=="Error"){
                                swal({title:"Gagal Menginputkan data",type:"error",closeOnConfirm:true});
                            }else{
                                vm.getEmploye(1);
                            }
                        })      
     
    
                }else{
               
                    employe.edit($scope.form).then(function(response){

                        if(response.data.status=="Error"){
                            swal({title:"Gagal Mengedit",type:"error",closeOnConfirm:true});
                        }else{
                            vm.getEmploye(1);

                            swal("Success", "Data Berhasil Di edit.", "success");

                        }
                    })
                }

                $("#modal_theme_primary").modal('hide');
                // if(uploader.queue.length != 0){
                //     uploader.queue[0].remove();
                // }
                
                
              
      
                

            }else{
                console.log('oononon');
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

                employe.delete(id).then(function(response){
                    console.log(response);

                     if (response.data.status="Success") {
                        swal("Deleted!", "Data Berhasil Dihapus.", "success");

                        vm.getEmploye(1);
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
        angular.forEach(vm.employe, function(cust) {
            cust.selected = $scope.selectedAll;
        });
    };    


    $scope.removeSelected = function(){
        var newDataList=[];
        
        var customerIDCollect=[];
        var i=0;

        angular.forEach(vm.employe, function(selected){
            if(selected.selected==true){
               customerIDCollect[i]=selected.employeID; 
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

                    employe.deleteCollect(customerIDCollect).then(function(response){
                        console.log(response);

                         if (response.data.status="Success") {
                            swal("Deleted!", "Data Berhasil Dihapus.", "success");
                            $scope.selectedAll = false;
                           vm.getEmploye(1);
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
        $scope.form={'employeID':'','email':'','password':'','name':'','contact_phone':'','role':'Pegawai'};

        
    }



}])
