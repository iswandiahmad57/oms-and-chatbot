'use strict';

angular.module('myApp.dashboard', ['ui.router','angularUtils.directives.dirPagination','chart.js',])
.config(['$stateProvider','$urlRouterProvider','ChartJsProvider', function($stateProvider,$urlRouterProvider,ChartJsProvider) {


    ChartJsProvider.setOptions({
      chartColors: ['#FF5252', '#FF8A80'],
      responsive: false
    });
    // Configure all line charts
    ChartJsProvider.setOptions('line', {
      showLines: false
    });
    $stateProvider.state('app',{
    	url:'/app',
		views:{

			'@':{
				templateUrl:'dashboard/dashboard.html',
        		controller:'DashboardCtrl',

			  
			},
            // main sidebar diletakkan di setiap module angularjs 
            'main-sidebar@app': { 
                templateUrl: 'template/layout/sidebar1.html',
                
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


    })

}])
.controller("DashboardCtrl",['$scope','$rootScope','dashboard','product',function($scope,$rootScope,dashboard,product){
                const moment=require('moment');
                $scope.product=[];
                $scope.pilProduct='null';
                $scope.grafik={};

                $scope.todayOrder='';
                $scope.allOrder='';

                $scope.invoice={};
                //besar dari 5
                //kecil dari 5
                //kecil dari 0
                var day='<5';
                $scope.orderDeadline={};
                $scope.dataGrafik=[];

                $scope.getProduk=()=>{
                  product.getSimple().then(function(result){
                    $scope.product=result.data.data;

                  })
                }

                $scope.getInfo=()=>{
                  dashboard.getInfo().then(function(result){
                    $scope.allOrder=result.data.data.allOrder;
                    $scope.todayOrder=result.data.data.resultBy;
                  })
                }

                $scope.getOrderDeadline=()=>{
                  dashboard.getOrderDeadline(day).then(function(result){
                    $scope.orderDeadline=result.data.data;
                    console.log('deadlin',$scope.orderDeadline);
            
                  })
                }

                $scope.getInvoice=()=>{
                  dashboard.getInvoices().then(function(result){
                    $scope.invoice=result.data.data;
                    console.log('invoice',$scope.invoice)
                  })
                }

                $scope.setting={};
                dashboard.getSetting().then(function(result){
                  $scope.setting=result.data.data;
                })

                $scope.getProduk();


                //digunakan untuk mendapatk informasi mengenai order hari ini dalan semua order
                $scope.getInfo();

                //digunakan untuk mendapatkan informasi order
                $scope.getOrderDeadline();

                //untuk mendapatkan invoice

                $scope.getInvoice();


                $scope.gantiOrder=(value)=>{
                  day=value;
                  $scope.getOrderDeadline();
                }


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
                                  text: 'Grafik Penjualan Produk'
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



                $scope.proName="ALL Produk";
                $scope.pilihProduct=(param)=>{
                  if(param=='All'){
                    $scope.pilProduct=null;
                    $scope.proName="All";

                  }else{
                    $scope.pilProduct=param;
                    angular.forEach($scope.product,function(i){
                      if(i.productID==param){
                        $scope.proName=i.nama;
                      }
                    })
                  }
                   $scope.getGrafik();
                }

                $scope.getGrafik();

                    $scope.diffDay=(startDate,endDate)=>{
		                var date = new Date();
						var dateNow = date.getFullYear() + '-' + ('0' + (date.getMonth() + 1)).slice(-2) + '-' + ('0' + date.getDate()).slice(-2)

                        var startDate = moment(startDate);
						if(startDate<dateNow){
							var startDate = moment(startDate);
						}else{
							var startDate = moment(dateNow);
						}
                

                        var endDate = moment(endDate);

                        var result = endDate.diff(startDate, 'days');
                        console.log(result);

                        return result;
                    }

}])