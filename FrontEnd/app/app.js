'use strict';

// Declare app level module which depends on views, and components
angular.module('myApp', [
  'ngRoute',
  'myApp.view1',
  'myApp.customer',
  'myApp.view2',
  'myApp.order',
  'myApp.productServices',
  'myApp.customerServices',
  'myApp.orderServices',
  'myApp.invoiceServices',
  'myApp.invoice',
  'myApp.setting',
  'myApp.settingServices',
  'myApp.loginServices',
  'myApp.dashboard',
  'myApp.login',
  'ui.router',
  'oitozero.ngSweetAlert',
  'angularFileUpload',
  'chart.js',
   'datatables',
   'ngTable',
   'myApp.shipping',
   'myApp.shippingServices',
   'myApp.dashboardServices',
   'myApp.laporan',
   'myApp.pegawai',
   'myApp.pegawaiServices',
   'angular-ladda'

])

.config(function ($urlRouterProvider) {
  
  $urlRouterProvider.otherwise('/login');

})
.config(function($httpProvider){
  $httpProvider.interceptors.push('Interceptor');
}).controller("utama",['$scope','$rootScope','$state','authenticationSvc','$window','Factory','$interval','invoice',function($scope,$rootScope,$state,authenticationSvc,$window,Factory,$interval,invoice){
  $rootScope.$watch($rootScope.online,function(){
    console.log($rootScope.online);
  });

  $scope.notif=[];
  $scope.countNotif=0;
    var getKonfirmasiData=function(){
      invoice.getKonfirmasi().then(function(result){
        $scope.countNotif=0;
        $scope.notif=result.data.data;

        for (var i = 0; i < result.data.data.length; i++) {
                if(result.data.data[i].read==='new'){
                  
                  $scope.countNotif=$scope.countNotif+1;
           
                }
        }

       
      });
    }

    $scope.reloadNotif=function(){
      getKonfirmasiData();
    }

  $rootScope.$watch('changeNotif',function(){
    $scope.countNotif=0;
      getKonfirmasiData();
        $rootScope.changeNotif='ya';
      console.log("berhasilll");
  });

  $scope.people=0;
  $rootScope.$watch('people',function(){
    $scope.people=$rootScope.people;
    $rootScope.people=$scope.people;


  });

  $scope.orderNotif=0;
  $rootScope.$watch('orderNotif',function(){
    $scope.orderNotif=$rootScope.orderNotif;

  });


  $scope.oke="dsfadsf";
  $scope.$state = $state;


  $scope.logout=function(){
    authenticationSvc.logout();

  }

    var running;
    $scope.running='toggle server polling ';
    console.log($rootScope.online)
    $scope.online = $rootScope.online



    Factory.ckIfOnline();
    $rootScope.$watch('online', function(newValue, oldValue){
        if (newValue !== oldValue) {
            $scope.online=$rootScope.online;

        }
            if(!$scope.online && $state.current.name!='login'){
              $("body").block({
                  message: 'Anda tidak online <br/> <i class="icon-spinner6 spinner"></i> <br/> kami mencoba menghubungkan anda kembali',
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
            }else{
              $("body").unblock();
            }


    });
    var runUpd = function(){
        running = $interval(function(){
            console.log('running update');

            Factory.ckIfOnline();


        },5000);                        
    }; 
    var cancelRunning = function() {
        if (running) {$interval.cancel(running);}
    };
    runUpd();

    $scope.openModal=function(){
      $("#modal_theme_password").modal('show');
    }

    $scope.closeModal=()=>{
      $("#modal_theme_password").modal('hide');
    }

    $scope.changePassword=()=>{
      
    }

}])
.constant('config',{
	apiUrl:'http://layangwacan.com',
	appName:'Order Management System',
  webhookUrl:'http://arcane-mesa-75663.herokuapp.com'

})
.factory('Factory', function($q, $http, $rootScope,config){
    var httpLoc = config.apiUrl+'/remote/cek_connection'; 
    return{
        ckIfOnline: function(){
            $http.get(httpLoc);                      
        },  
        change: function(){
            return 'duck'
        }  
    }
}).factory('Interceptor', function($rootScope){
        var Interceptor ={
            responseError: function(response){
                $rootScope.status = response.status;
                $rootScope.online = false;
                return response;
            },
            response: function(response){
                $rootScope.status = response.status;
                $rootScope.online = true;
                return response;
            }
        };
        return Interceptor;
})
.run(function($window,$rootScope,$state,authenticationSvc,$timeout,Factory,$http) {
  // $rootScope.online=false;
  // $rootScope.role="";
  // Offline.options = {checks: {xhr: {url: 'http://google.com/'}}};
    //cek internet connection
      $rootScope.changeNotif="ya";

      $rootScope.people=0;
      $rootScope.orderNotif=0;
      var socket = io('https://arcane-mesa-75663.herokuapp.com');

      // socket.on('tweet', function(data){console.log(data)});
     socket.emit('chat message', "Kdfdf");

     socket.on('notif pembayaran',function(msg){

          $rootScope.changeNotif="ye";
        console.log(msg);
        noty({
          text: 'Konfirmasi Pembayaran Dengan Nomor Pesanan: '+msg.orderNumber+' sejumlah:'+msg.keterangan,
                    type: 'information',
                    dismissQueue: true,
                    timeout: 4000,
                    layout:'topRight',
        });

     })

     socket.on('notif people',function(msg){
        $rootScope.people=+1;
        noty({
          text: 'Pelanggan baru dari Messenger',
                    type: 'information',
                    dismissQueue: true,
                    timeout: 4000,
                    layout:'topRight',
        });
     })


    socket.on('notif order',function(msg){

      $rootScope.orderNotif=+1;

      //write file

        noty({
          text: 'Order baru dari Messenger',
                    type: 'information',
                    dismissQueue: true,
                    timeout: 4000,
                    layout:'topRight',
        });
    })

      console.log('running')
      Factory.ckIfOnline();
      var onFocus = function(){
          Factory.ckIfOnline();
      }
      $window.onfocus = onFocus;  
      // var run = function(){
      //  if (Offline.state === 'up'){
      //    Offline.check();
      //     console.log(Offline.check());
      //     console.log(Offline.state);
      //     $rootScope.online=true;
      //  }else{
      //     $rootScope.online=false;
      //  }
      // }


    // console.log($rootScope.role);
   


      //  setInterval(run, 5000);
    $rootScope.$on('$stateChangeStart', function (event,next) {
      // console.log(next);
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
            console.log(next);
          var authorizedRoles = next.data.authorizedRoles;

          //cek apakah terdapat role atau tidak
          if (!authenticationSvc.isAuthorized(authorizedRoles)) {
            event.preventDefault();
            if (authenticationSvc.isAuthenticated()) {
              // user is not allowed
              console.log("tidak dibolehkan");
              $("body").unblock();

              // $rootScope.$broadcast(AUTH_EVENTS.notAuthorized);
            } else {
              // user is not logged in
              $("body").unblock();
              $state.go("login");

              // $rootScope.$broadcast(AUTH_EVENTS.notAuthenticated);
            }
          }else{
              $("body").unblock();
      
          }
    });
    $rootScope.$on('$stateChangeSuccess', function(){

     var profile=JSON.parse($window.sessionStorage["userInfo"]);

      if(profile){
         $rootScope.role=profile.role;
         $rootScope.profile=JSON.parse($window.sessionStorage["userInfo"]);
      }else{
         $rootScope.role="";
         $rootScope.profile="";
      }
      $("body").unblock();
    });

// var counter = 100;
// var stopped;

// //timeout function
// //1000 milliseconds = 1 second
// //Every second counts
// //Cancels a task associated with the promise. As a result of this, the //promise will be resolved with a rejection.  
// var countdown = function() {
//     stopped = $timeout(function() {
//        console.log(counter);
//      counter--;   
//      countdown();   
//     }, 1000);
//   };
   
    
// var stop = function(){
//    $timeout.cancel(stopped);
 
//   } 


    $rootScope.$on("$stateChangeError", function(event, toState, toParams, fromState, fromParams, error) {
      $("body").unblock();
      console.log(error);
      if(error){
         // countdown();
    
        new PNotify({
            title: 'Danger notice',
            text: 'Check me out! I\'m a notice.',
            addclass: 'bg-danger'
        });
      }


      // if (eventObj.authenticated === false) {

      //   console.log("dsfasdfLogiout");
      //   $state.go("login");
      // }
    });
 // $rootScope.$on('$stateChangeError', function(event, toState,toParams, fromState, fromParams, error) {
 //            console.log(error);
 //            console.log("adfasdfasdf");  
 //  });



    // $rootScope.$on('$statePermissionError', function(){
    //   console.log("asdfads");
    // });
});;
