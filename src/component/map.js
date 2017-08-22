/**
 * Created by yanshi0429 on 17/8/8.
 */
import $ from 'jquery';
import template from './template.html';
import css from './map.less';

class WtAppTargetMapController {
    constructor($scope, $timeout) {
        this.$scope = $scope;
        this.$timeout = $timeout;
        this.maxLeft = 0;
        this.maxRight = 0;
        this.scale = 1;


        this.nodesType = {
            '1':'公司',
            '2':'部门',
            '3':'个人'
        };
        //constant.okrObjectiveType

        //节点设置
        this.nodeWidth = 220;
        this.nodeHeight = 120;
        this.nodeIntervalX = 20;
        this.nodeIntervalY = 50;
        this.nodes = [];
        this.nodesGroup = [];
        this.depth = 0;
        this.origin = {
            x: 100,
            y: 0
        };
        this.init();
    }
    removeAnimateChildren(node,isOwn){
        if(node){
            let nodes = this.nodesGroup[node.depth];
            for(let i in nodes){
                let _temp = nodes[i];
                _temp.expand = false;
                _.remove(this.nodes,function(n){
                    return n.parents && _.indexOf(n.parents,_temp._id) > -1;
                });
            }
            this.depth = node.depth;
            this.nodesGroup = this.nodesGroup.splice(0,(node.depth+1));
        }
    }
    setPath(nodes){
        let self = this;
        if(!nodes){
            nodes = this.nodes;
        }
        for(let i in nodes){
            let _temp = nodes[i];
            if(_temp.isRoot){
                continue;
            }
            let x1 = _temp.parentNode.left+ self.nodeWidth/2;
            let y1 = _temp.parentNode.top + self.nodeHeight;
            let x2 = _temp.left + self.nodeWidth/2;
            let y2 = _temp.top;
            let path = "";

            if(x2 < x1){
                path = "M"+x1+" "+y1+" C"+(x1 - 30)+" "+(y1+35)+", "+(x2+20)+" "+(y2-10)+", "+(x2+20)+" "+(y2-10) +" S"+(x2+8)+" "+(y2-10)+", "+x2+" "+y2;
            }else if(x2 > x1){
                path = "M"+x1+" "+y1+" C"+(x1 + 30)+" "+(y1+35)+", "+(x2-20)+" "+(y2-10)+", "+(x2-20)+" "+(y2-10) +" S"+(x2-8)+" "+(y2-10)+", "+x2+" "+y2;
            }else{
                path = "M"+x1+" "+y1+"L"+x2+" "+y2;
            }
            _temp.path = path;
        }
    }
    appendChildren(node,animate){
        let _self = this;
        let children = _.filter(this.orgNodes,function(n){
            return n.parent && n.parent._id === node._id;
        });

        if(children.length === 0){
            return;
        }
        node.childrenSize = children.length;
        node.nodes = children;
        this.depth ++;
        this.nodesGroup[this.depth] = children;
        let _left = node.left + this.nodeWidth/2  - (children.length * this.nodeWidth + (children.length - 1) * this.nodeIntervalX)/2;
        let _top = node.top + _self.nodeHeight + _self.nodeIntervalY;

        for(let i in children){
            let _temp = children[i];
            _temp.parentNode = node;
            _temp.width = _self.nodeWidth;
            _temp.height = _self.nodeHeight;
            _temp.depth = node.depth + 1;
            _temp.left = _left + i * _self.nodeWidth + i * _self.nodeIntervalX;
            _temp.top = _top;
            _temp.typeDesc = _self.nodesType[_temp.type];
            _temp.orderIndex = i;
            _temp.expand = false;
            _temp.title = _self.setTitle(_temp);

            let _children = _.filter(this.orgNodes,function(n){
                return n.parent && n.parent._id === _temp._id;
            });
            if(_children.length > 0){
                _temp.childrenSize = _children.length;
                _temp.nodes = _children;
            }
            if(animate){
                _temp.animate = animate;
            }
            this.nodes.push(_temp);
        };
    }
    setHVSize(nodes){
        if(!nodes){
            nodes = this.nodes;
        }
        let _left,_right;
        for(let i in nodes){
            let _temp = nodes[i];
            if(i == 0){
                _left = _temp.left;
                _right = _temp.left;
            }else{
                if(_temp.left < _left){
                    _left = _temp.left;
                }
                if(_temp.left > _right){
                    _right = _temp.left;
                }
            }
        }

        this.maxLeft = _left;
        this.maxRight = _right;

        let _width = _right - _left + this.nodeWidth;
        this.map.width = _width;
        this.origin.x = this.map.width/2;
        this.map.contentWidth = _width;
        if(_width > this.origin.width){
            this.map.bodyWidth = _width + 100;
        }else{
            this.map.bodyWidth = this.origin.width + 100;
        }

        let _height = this.depth * (this.nodeHeight + this.nodeIntervalY);
        this.map.height = _height;

    }
    resetPostion(){
        let _sw = 0-this.maxLeft;
        for(let i in this.nodes){
            let _temp = this.nodes[i];
            _temp.left = _temp.left + _sw;
        }
    }
    nodeClick(event,node){
        if(event){
            event.stopPropagation();
        }
        console.log('map click!');
    }
    expandNode(node){
        this.removeAnimateChildren(node);
        node.expand = true;
        this.appendChildren(node);
        this.setHVSize();
        this.resetPostion();
        this.setPath();
    }
    collapseNode(node){
        node.expand = false;
        //删除子节点
        this.removeAnimateChildren(node);
        this.setHVSize();
        this.resetPostion();
    }
    getByte (str) {
        for (var i = str.length, n = 0; i--; ) {
            n += str.charCodeAt(i) > 255 ? 2 : 1;
        }
        return n;
    }
    setTitle(node){
        let str = node.name;
        let endstr = '...';
        let len = 45;

        function n2(a) {
            var n = a / 2 | 0;
            return (n > 0 ? n : 1)
        }

        if (!(str + "").length || !len || len <= 0) {
            return "";
        }
        if (this.getByte(str) <= len) {
            return str;
        }
        var lenS = len - this.getByte(endstr)
            , _lenS = 0
            , _strl = 0
        while (_strl <= lenS) {
            var _lenS1 = n2(lenS - _strl)
            _strl += this.getByte(str.substr(_lenS, _lenS1))
            _lenS += _lenS1
        }
        return str.substr(0, _lenS - 1) + endstr;
    }
    setRootList(){
        let root = [];
        let self = this;
        for(let i in this.orgNodes){
            let _temp = this.orgNodes[i];
            if(!_temp.parent){
                root.push(_temp);
            }else{
                let _p = _.find(this.orgNodes,{_id:_temp.parent._id});
                if(!_p){
                    root.push(_temp);
                }
            }
        }
        let _left = (this.map.width - (root.length * this.nodeWidth + (root.length -1) * this.nodeIntervalX))/2;

        for(let o in root){
            let _temp = root[o];
            _temp.parentNode = null;
            _temp.width = self.nodeWidth;
            _temp.height = self.nodeHeight;
            _temp.depth = 1;
            _temp.orderIndex = o;
            _temp.left =_left + o * self.nodeWidth + o * self.nodeIntervalX;
            _temp.top = self.origin.y;
            _temp.typeDesc = self.nodesType[_temp.type];
            _temp.isRoot = true;

            _temp.title = self.setTitle(_temp);

            let _children = _.filter(this.orgNodes,function(n){
                return n.parent && n.parent._id === _temp._id;
            });
            if(_children.length > 0){
                _temp.childrenSize = _children.length;
                _temp.nodes = _children;
                _temp.expand = false;
            }
        }

        this.depth = 1;
        this.nodes = [];
        this.nodesGroup[this.depth] = root;
        this.nodes = this.nodes.concat(root);

        let _l = this.nodes[0].left;
        let _r = this.nodes[this.nodes.length-1].left;
        let _width = _r - _l + this.nodeWidth;
        if(_width > this.map.width){
            this.map.width = _width;
            this.origin.width = _width;
            this.map.contentWidth = _width + 50;
            let _sw = this.map.width/2 - this.origin.x;
            this.origin.x = this.map.width/2;
            for(let i in this.nodes){
                let _temp = this.nodes[i];
                _temp.left = _temp.left + _sw;
            }
        }
    }
    setLayout() {
        let _wrap = $('.target-map-wrap');
        let _width = _wrap.width();
        this.map = {
            containerWidth:_width,
            bodyWidth:_width,
            contentWidth:_width-100,
            width: _width-100,
            height: _wrap.height()-100
        };
        this.origin = {
            width:_width-100,
            x:(_width-100)/2,
            y:0
        };
    }
    enlarge(scale){
        this.scale = scale;
    }

    init() {
        let self = this;
        this.$scope.$on('mapDataRefresh', function (e,data) {
            if(data.data && data.data.length > 0){
                self.orgNodes = _.cloneDeep(data.data);
                self.setLayout();
                self.setRootList();
            }
        });
        this.$scope.$on('scaleMap', function (e,data) {
            if(data && data.scale){
                self.enlarge(data.scale);
            }
        });


        if(this.data && this.data.length > 0){
            this.orgNodes = _.cloneDeep(this.data);
            this.setLayout();
            this.setRootList();
        }
    }
}

WtAppTargetMapController.$inject = [
    '$scope',
    '$timeout'
];
// export a = 'aa';
// export b = 'bb';
//
// import * as ab from './'
export default {
    selector: 'wtAppTargetMap',
    template: template,
    controller: WtAppTargetMapController,
    bindings: {
        data: '='
    }
};



