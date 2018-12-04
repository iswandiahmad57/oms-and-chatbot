angular.module('myApp.login', ['ui.router'])
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
.config(function ($stateProvider) {
  $stateProvider
    .state('login', {
      url: '/login',
      templateUrl: 'login/login.html',
      controller: 'LoginController',
      data:{
      	authorizedRoles:['All']
      }
	  // resolve: {
	  //   auth: ["$q", "authenticationSvc", function($q, authenticationSvc) {
	  //     var userInfo = authenticationSvc.getUserInfo();

	  //     if (userInfo) {
	  //       return $q.when(userInfo);
	  //     } else {
	  //       return $q.reject({ authenticated: false });
	  //     }
	  //   }]
	  // }
    });
})

.controller('LoginController', function ($scope,authenticationSvc,$state,$window,$q,$rootScope) {
	$scope.form={};
	
	$("body").unblock();
	$scope.error="";
	$scope.login=function(){


		// authenticationSvc.login($scope.form.username,$scope.form.password).then(function(result){
		// 	if(result.status==="Success"){

		// 	}
		// }).then;

		if($rootScope.online){
			var deffered=$q.defer();
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
			authenticationSvc.login($scope.form).then(function(userInfo){
				if(!userInfo.status){
					$scope.error="Ada masalah terhadap email dan password anda, silahkan coba lagi";
					$('body').unblock();
				}
			},function(error){
				deffered.reject({hasPayment:false});
				$scope.error="Ada masalah terhadap email dan password anda, silahkan coba lagi";
				console.log("oasdfasdf");
				$('body').unblock();
				
			});

			return deffered.promise;
		}else{
			alert("Anda Sedang Tidak Terhubung Ke Server, Silahkan Cek Koneksi Internet anda atau tunggu beberapa saat");
		}

	}

});
