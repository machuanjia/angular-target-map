/**
 * Created by yanshi0429 on 17/8/8.
 */
import * as angular from 'angular';
import $ from 'jquery';
import _ from 'lodash';
import Main from './main';
angular.module('app', ['wt.target.map'])
    .controller("appCtrl", ["$scope", function ($scope) {
        let data = [{
            "_id": "1",
            "name": "1这里是目标这里是目标",
            "parents": [],
            "overall_progress":20
        }, {
            "_id": "1-1-2",
            "name": "1-1-2这里是目标这里是目标",
            "parent": {"name": "1-1", "_id": "1-1"},
            "parents": ["1", "1-1"],
            "overall_progress":10
        }, {
            "_id": "1-1-1",
            "name": "1-1-1这里是目标这里是目标",
            "parent": {"name": "1-1", "_id": "1-1"},
            "parents": ["1", "1-1"],
            "overall_progress":10
        }, {
            "_id": "1-2",
            "name": "1-2这里是目标这里是目标",
            "parent": {"name": "1", "_id": "1"},
            "parents": ["1"],
            "overall_progress":90
        }, {
            "_id": "1-1",
            "name": "1-1这里是目标这里是目标",
            "parent": {"name": "1", "_id": "1"},
            "parents": ["1"],
            "overall_progress":30
        }];
        $scope.data = data;








        // for (var i in data) {
        //     let temp = _.filter(data, function (n) {
        //         return n.parent._id === data[i]._id;
        //     });
        //     let _size = _.sum(_.map(temp, 'childNodeSize'));
        //     data[i].childNodeSize = data[i].childNodeSize + _size;
        // };

        // for (var i in data) {
        //     let temp = data[i];
        //     if(!temp.parent._id){
        //         temp.lineSize = 1;
        //     }else{
        //         let _parent = _.find(data, function (n) {
        //             return n._id === temp.parent._id;
        //         });
        //         temp.lineSize = _parent.childNodeSize;
        //     }
        // };



        // $scope.data = {
        //     children: [{
        //         "_id": "59719c1793a7494483020755",
        //         "name": "1",
        //         "parents": [],
        //         "parent": {"name": "root"},
        //         "lvl": 0,
        //         "children": [{
        //             "_id": "59896274221146133d1514b1",
        //             "name": "1-2",
        //             "parent": {"name": "1", "_id": "59719c1793a7494483020755"},
        //             "parents": ["59719c1793a7494483020755"],
        //             "lvl": 1,
        //             "childNodeSize": 0
        //         }, {
        //             "_id": "5989614c221146133d1514a9",
        //             "name": "1-1",
        //             "parent": {"name": "1", "_id": "59719c1793a7494483020755"},
        //             "parents": ["59719c1793a7494483020755"],
        //             "lvl": 1,
        //             "children": [{
        //                 "_id": "598962a7221146133d1514b9",
        //                 "name": "1-1-1",
        //                 "parent": {"name": "1-1", "_id": "5989614c221146133d1514a9"},
        //                 "parents": ["59719c1793a7494483020755", "5989614c221146133d1514a9"],
        //                 "lvl": 2,
        //                 "childNodeSize": 0
        //             }],
        //             "childNodeSize": 1
        //         }],
        //         "childNodeSize": 3
        //     }]
        // };

    }]);
