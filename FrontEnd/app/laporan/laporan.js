'use strict';

angular.module('myApp.laporan', ['ui.router','angularUtils.directives.dirPagination'])

.config(['$stateProvider', function($stateProvider) {
  // $routeProvider.when('/view1', {
  //   templateUrl: 'view1/view1.html',
  //   controller: 'View1Ctrl'
  // });
  $stateProvider

        // HOME STATES AND NESTED VIEWS ========================================
        .state('laporan', {
            url: '/laporan',
		    views: {

            '': { templateUrl: 'laporan/laporan.html',controller: 'LaporanCtrl' },
		        // main sidebar diletakkan di setiap module angularjs 
		        'main-sidebar@laporan': { 
		            templateUrl: '../app/template/layout/sidebar1.html',
		            
		        }
		    },
        data:{
              authorizedRoles: ["Admin"]
        }
        });
}])

.controller('LaporanCtrl', ['$http','$scope','config','dashboard','product','FileUploader','SweetAlert','$filter',function($http,$scope,config,dashboard,product,FileUploader,SweetAlert,$filter) {
                const moment=require('moment');
                $scope.product=[];
                $scope.pilProduct='null';
                $scope.tipe='All';
                $scope.grafik={};
                 $scope.dataGrafik=[];

                 var exportType=true;

                $scope.getProduk=()=>{
                  product.getSimple().then(function(result){
                    $scope.product=result.data.data;

                  })
                }


                $scope.getProduk();
  $scope.month=[{'month':'All','num':'0'},
                {'month':'Januari','num':'01'},
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


$scope.selectedMonth={'month':'All','num':'0'};




                $scope.getGrafik=()=>{
                  dashboard.getGrafik($scope.pilProduct).then(function(result){
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
                      $scope.dataGrafik[11]=$scope.grafik[0].desember;

                      console.log($scope.dataGrafik);
                      $scope.eoption = {
                              title: {
                                  text: 'Grafik Penjualan Produk '
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
                



                $scope.pilihProduct=(param)=>{
                  if(param=='All'){
                    $scope.pilProduct=null;
                    $scope.tipe="All";
                  }else{
                    
                    $scope.pilProduct=param;
                  }
                   $scope.getGrafik();
                }

                $scope.getGrafik();

                $scope.productReport=(type)=>{

                	validator.resetForm();
                	$('input[type=text]').val('');

                  if(type=='product'){
                    exportType=true;
                  }else{
                    exportType=false;
                  }
                	$('#modal_theme_primary').modal('show');
                }

                $scope.closeModal=()=>{
                	$('#modal_theme_primary').modal('hide');
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

                 	if($('#form').valid()){
                 		  $scope.submitting=true;
                      var url="";
                      if(exportType){
                        url=config.apiUrl+"/remote/report_product/"+$scope.selectedMonth.num;
                      }else{
                        url=config.apiUrl+"/remote/report_customer/"+$scope.selectedMonth.num;
                      }
								      var data={'filename':$scope.filename+" Periode("+$scope.selectedMonth.month+")",'sourceFolder':sourceFolder,'url':url};
                 			ipc.send('download',data)
	                 }else{
	                 	
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
                   	}else{
        					    $scope.$apply(function(){
        					        $scope.count= Math.round(path);
        					    });
                   	}
                 	
                 })



}])
