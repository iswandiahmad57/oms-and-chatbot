'use strict';

angular.module('myApp.setting', ['ui.router','angularUtils.directives.dirPagination'])

.config(['$stateProvider', function($stateProvider) {
  // $routeProvider.when('/view1', {
  //   templateUrl: 'view1/view1.html',
  //   controller: 'View1Ctrl'
  // });
  $stateProvider

        // HOME STATES AND NESTED VIEWS ========================================
        .state('setting', {
            url: '/setting',
		    views: {

            '': { templateUrl: 'setting/setting.html',controller: 'SettingCtrl' },
		        // main sidebar diletakkan di setiap module angularjs 
		        'main-sidebar@setting': { 
		            templateUrl: '../app/template/layout/sidebar1.html',
		            
		        }
		    },
        data:{
              authorizedRoles: ["Admin"]
        }
        });
}])

.controller('SettingCtrl', ['$http','$scope','config','setting','FileUploader','SweetAlert','$filter',function($http,$scope,config,setting,FileUploader,SweetAlert,$filter) {

    var year = new Date().getFullYear()-1;
    var range = [];
    range.push(year);
    for (var i = 1; i < 20; i++) {
        range.push(year + i);
    }
    $scope.years = range;

    //get setting 

    $scope.setting={};
    $scope.getSetting=()=>{
      setting.get().then(function(result){
        $scope.setting.nama_perusahaan=result.data.data.umum.nama_perusahaan;
        $scope.setting.alamat=result.data.data.umum.nama_perusahaan;
        $scope.setting.no_telp1=result.data.data.umum.no_telp1;
        $scope.setting.no_telp2=result.data.data.umum.no_telp2;
        $scope.setting.email=result.data.data.umum.email;
        $scope.setting.payment_detail=result.data.data.invoice.payment_detail;
        $scope.setting.periode=result.data.data.periode.tahun;
      })
    }

    $scope.getSetting();



    $scope.submit=()=>{
      console.log($scope.setting);
      setting.send($scope.setting).then(function(result){
        swal("Berhasil!", "Berhasil", "success");
      })
    }



}])
