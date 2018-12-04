
'use strict';

angular.module('myApp.loginServices',[])
.factory("authenticationSvc", function($http, $q, $window,config,$state,$rootScope) {
  var userInfo;

  function login(data) {
    var deferred = $q.defer();
    $http.post(config.apiUrl+'/employes/login',data,{
      headers:{'Authorization':'Basic YWRtaW46MTIzNA=='}
    })
    .then(function(result) {
      if(result.data.status==="Success"){
        userInfo = {
          accessToken: result.data.data.token,
          userName: result.data.data.email,
          role:result.data.data.role,
          name:result.data.data.name,
          status:true
        };
        $window.sessionStorage["userInfo"] = JSON.stringify(userInfo);
        // console.log($window.sessionStorage["userInfo"]);
        deferred.resolve(userInfo);
        $state.go('app');
      }else{
        deferred.reject({error:true});
      }


      


    }, function(error) {
      console.log(error);
        deferred.reject(error);
    });


    return deferred.promise;
  }
  function getUserInfo() {
    return userInfo;
  }
  function init() {
    if ($window.sessionStorage["userInfo"]) {
      userInfo = JSON.parse($window.sessionStorage["userInfo"]);
    }
  }

  init();
  function logout() {
    var deferred = $q.defer();

      $window.sessionStorage["userInfo"] = null;
      userInfo = null;
      console.log($window.sessionStorage["userInfo"]);
      $rootScope.role="";
      $state.go('login');
  }
  function isAuthorized (authorizedRoles) {
    

    userInfo = JSON.parse($window.sessionStorage["userInfo"]);

    if (!angular.isArray(authorizedRoles)) {
      authorizedRoles = [authorizedRoles];
    }

    if(authorizedRoles=='All'){
      return true;
    }else{

      return (isAuthenticated() &&
        authorizedRoles.indexOf(userInfo.role) !== -1);
    }

  };

  function isAuthenticated () {
    userInfo = JSON.parse($window.sessionStorage["userInfo"]);
    // console.log(userInfo);
    // if(userInfo){
    //   return true;
    // }else{
    //   return false;
    // }

    console.log(userInfo);


    return !!userInfo.accessToken;
  };
  return {
    login: login,
    getUserInfo:getUserInfo,
    logout:logout,
    isAuthorized:isAuthorized,
    isAuthenticated:isAuthenticated
  };
});