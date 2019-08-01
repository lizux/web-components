'use strict';
//一个根据正文的标题自动生成的浮动的快捷导航栏，使用Bootstrap样式
angular.module('commonModule').directive('fixedNav', ['$window', '$filter',
    function($window, $filter) {
        return {
            restrict: 'EA',
            scope: {
                targetStr: '@'
            },
            template: '<ul class="nav nav-pills nav-stacked">' +
                '<li ng-repeat="anchor in navs"><a href="#{{anchor.id}}" du-smooth-scroll>{{anchor.text}}</a>' +
                '<ul class="nav nav-pills nav-stacked">' +
                '<li ng-repeat="link in anchor.subnavs" du-scrollspy="{{link.id}}"><a href="#{{link.id}}" du-smooth-scroll>{{link.text}}</a>' +
                '</ul>' +
                '</ul>',
            link: function(scope, element, attrs) {
                scope.navs = [];
                angular.forEach($(scope.targetStr), function(elem) {
                    elem = $(elem);
                    if (elem.attr('id')) {
                        var item = {
                            id: elem.attr('id'),
                            text: elem.find('h2').text(),
                            subnavs: []
                        };
                        angular.forEach(elem.find('h3'), function(sub){
                            sub = $(sub);
                            var s = {
                                id: sub.attr('id'),
                                text: sub.text()
                            };
                            item.subnavs.push(s);
                        });
                        scope.navs.push(item);
                    }
                });
                angular.element($window).on('scroll', function() {
                    if (this.pageYOffset >= 150) {
                        element.css('top', 0);
                        var active = element.find('li.active')[0];
                        if (active) {
                            active = $(active);
                            var gap = active.offset().top - this.pageYOffset - $(window).height();
                            if (gap > -20) {
                                element.css('top', $(window).height() - element.height() - 20);
                            }
                        }
                        if (!element.hastop) {
                            $('body').append('<a class="gotop" onclick="$(window).scrollTop(0);" title="·µ»ØÊ×Ò³"></a>');
                            element.hastop = true;
                        }
                    } else {
                        element.css('top', 150 - this.pageYOffset);
                        $('.gotop').remove();
                        element.hastop = false;
                    }
                    scope.$apply();
                });
            }
        };
    }
]);
