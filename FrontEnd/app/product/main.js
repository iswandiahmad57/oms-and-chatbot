'use strict';

angular.module('myApp.product', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/productSingle', {
    templateUrl: 'view/product_single.html',
    controller: 'productSingleController'
  }).when('/productVariant',{

  }).when('/productDetail/:productID/:action');
}])

.controller('productSingleController', ['$scope','$routeParams','$http','config',function($scope,$routeParams,$http,config) {
	//product single digunakan untuk menampilkan produk yang berjenis single
	//show data from services


}])
.controller('productVariantController',[function(){

}])
.controller('productDetailController',[function(){
	//product detail ini digunakan untuk menampilkan Detail Product
	//terdapat beberapa fungsi diantaranya adalah fungsi untuk pencarian produk di sidebar
	//fungsi edit juga berada disini

	//show all data to sidebar with filter

	//reload sidebar data


	//edit button


	//delete button

	





}]);