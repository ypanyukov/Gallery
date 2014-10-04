'use strict';

angular.module('picturesList', ['ngRoute', 'ngResource'])
    .config(['$routeProvider', function ($routeProvider) {
        $routeProvider.
            when('/item/:pictureId', {
                templateUrl: '../assets/views/item.html',
                controller: PictureViewCtrl
            }).
            otherwise({redirectTo: '/'});
    }])
    .filter('startFrom', function () {
        return function (input, start) {
            if (angular.isDefined(input)) {
                start = +start;
                input = input.slice(start);
            }
            return input;
        }
    })
    .directive('picList', function ($http) {
        return {
            restrict: 'E',
            scope: {
                source: "=picSource",
                perPage: "=picPerPage"
            },
            templateUrl: "../assets/views/list.html",
            link: function (scope) {
                $http({
                    url: scope.source,
                    method: 'GET'
                }).success(function (data) {
                    if (data.items && data.items.length > 0) {
                        scope.$parent.pictures = scope.pictures = data.items.map(function (item, index) {
                            var idRegExp = new RegExp(/^.+\/(.+)\.[^\.]+$/);
                            if (!item.shortUrl)
                                item.shortUrl = index + "-" + item.src.replace(idRegExp, "$1");
                            return item;
                        });

                        scope.pageId = 0;
                        scope.startFrom = 0;
                        scope.picCount = scope.pictures.length;
                    }
                });
            },
            controller: function ($scope) {

                $scope.prev = function () {
                    $scope.pageId = $scope.pageId - 1;
                    $scope.startFrom = ($scope.picCount + $scope.pageId * $scope.perPage) % $scope.picCount;
                };

                $scope.next = function () {
                    $scope.pageId = $scope.pageId + 1;
                    $scope.startFrom = ($scope.picCount + $scope.pageId * $scope.perPage) % $scope.picCount;
                };
            }
        }
    });

var PictureViewCtrl = function ($scope, $routeParams, $location, $document) {
    $scope.$watch('$parent.pictures', function (value) {
        if (!angular.isUndefined(value)) {
            var prev = 0,
                next = 0,
                current = -1,
                img = angular.element(document.getElementById('picPreviewImage'))[0];

            value.forEach(function (item, index) {
                if (item.shortUrl == $routeParams['pictureId']) {
                    current = index;
                    prev = (value.length + index - 1) % value.length;
                    next = (value.length + index + 1) % value.length;
                }
            });

            if (current == -1)
                $location.path('/');

            $scope.prevPicLink = value[prev].shortUrl;
            $scope.nextPicLink = value[next].shortUrl;
            $scope.current = value[current];

            $scope.$watch(function(){
                return img.width;
            }, function(value){
                setTimeout(function(){
                    console.log(img.width);
                }, 10);
            });
        }
    });

    $scope.returnToMain = function () {
        $location.path('/');
    };

};