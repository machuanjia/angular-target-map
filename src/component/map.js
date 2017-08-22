/**
 * Created by yanshi0429 on 17/8/8.
 */
import $ from 'jquery';
import template from './template.html';
import css from './map.less';

class WtAppTargetMapController {
    constructor($rootScope) {
        this.$rootScope = $rootScope;
        this.NodeWidth = 220;
        this.NodeHeight = 100;
        this.NodeIntervalX = 20;
        this.NodeIntervalY = 50;
        this.origin = {
            x:300,
            y:50
        }
        this.orgNodes = _.cloneDeep(this.ngModel);
        this.orgtree = {};
        this.Nodes = [];
        this.viewNodes = [];
        this.showDepth = 2;
        this.initDepth = true;
        this.currentList = [];
    }

    svgClick(evt) {
        if(evt && evt.target){
            let _id = evt.target.getAttribute('target');
            let _node = _.find(this.currentList,{_id:_id});
            let _children = _.filter(this.orgNodes,function(n){
                return n.parent._id === _id;
            });
            if(!_node.expand){
                if(_children && _children.length > 0){
                    this.initDepth = false;
                    this.currentList = this.currentList.concat(_children);
                    _node.expand = true;
                }
            }else{
                _node.expand = false;
                for(let i in _children){
                    _.remove(this.currentList,{_id:_children[i]._id});
                }
            }
            _.each(this.currentList,function(n){
                delete n.Nodes;
            });
            this.currentList = this.getTree(this.currentList);
            this.renderNodes();




            // if(!_node.expand){
            //     _node.expand = true;
            //     if(_node.Depth < this.Depth && _node.Nodes){
            //         this.viewNodes = this.viewNodes.concat(_node.Nodes);
            //     }
            // }else{
            //     if(_node.Nodes){
            //         for(let i in _node.Nodes){
            //             _.remove(this.viewNodes,{_id:_node.Nodes[i]._id});
            //         }
            //         _node.expand = false;
            //     }
            // }
            // this.getTree(this.viewNodes);
            // this.renderNodes();
        }

    }


    setLayout() {
        let _wrap = $('.target-map-wrap');
        this.map = {
            width: _wrap.width(),
            height: _wrap.height()
        }
        this.origin = {
            x:_wrap.width()/2,
            y: 100
        };
    }
    getTree(data){
        let self = this;
        let array = [];
        function fn(data, parent) {
            var result = [], temp;
            for (var i in data) {
                data[i].Width = self.NodeWidth;
                data[i].Height = self.NodeHeight;
                data[i].Box = {
                    w:self.NodeWidth,
                    h:self.NodeHeight
                };
                if (data[i].parent._id == parent) {
                    if (parent == undefined) {
                        data[i].lvl = 1;
                    } else {
                        let _lvl = _.find(data, {_id: data[i].parent._id}).lvl + 1;
                        if(self.initDepth && _lvl > self.showDepth){
                            return;
                        }
                        data[i].lvl =_lvl;
                    }

                    if(data[i].lvl < self.showDepth && _.isUndefined(data[i].expand)){
                        data[i].expand = true;
                    }

                    array.push(data[i]);

                    let children = _.filter(data, function (n) {
                        return n.parent._id === data[i]._id;
                    });
                    _.each(children,function(n){
                        n.parentNode = data[i];
                    });
                    result.push(data[i]);
                    temp = fn(data, data[i]._id);
                    if (temp && temp.length > 0) {
                        data[i].Nodes = temp;
                    }
                }
            }
            return result;
        }
        this.orgtree = fn(data, undefined)[0];
        return array;
    }
    setRoot (){
        let root = _.find(this.orgNodes, function (n) {
            return !n.parent;
        });
        root.parent = {
            name: 'root'
        };
        root.parentNode = null;
        root.Width = this.NodeWidth;
        root.Height = this.NodeHeight;
        root.Box = {
          w:this.NodeWidth,
          h:this.NodeHeight
        };

    }

    renderNodes(){
        this.IntervalWidth = this.NodeIntervalX;
        this.IntervalHeight = this.NodeIntervalY;
        this.Top = this.origin.y;
        this.Left = this.origin.x;
        this.Depth = 0;
        this.Nodes = [];
        this.DepthGroup = [];
        var This = this;
        let self = This = this;
        GetDepth(this.orgtree);
        let maxLength = 0;
        for(var obj in this.DepthGroup){
            if(this.DepthGroup[obj].Nodes && this.DepthGroup[obj].Nodes.length > maxLength){
                maxLength = this.DepthGroup[obj].Nodes.length;
            }
        }
        this.Left = this.Left - (maxLength * this.NodeWidth + (maxLength - 1) * this.NodeIntervalX)/2;
        SetDepthsHeight();
        for ( var n = 1; n <= this.Depth; n++) {//设置顶距离
            var tempTop = this.Top + GetDepthHeightToRoot(n);
            var tempNodes = this.DepthGroup[n].Nodes;
            for ( var m = 0; m < tempNodes.length; m++) {
                tempNodes[m].Top = tempTop;
            }
        }

        for ( var n = this.Depth; n >= 1; n--) {// 设置左距离
            var DepthNodes = self.DepthGroup[n].Nodes;
            if (n == self.Depth) {
                for ( var m = 0; m < DepthNodes.length; m++) {
                    if (m == 0) {
                        DepthNodes[m].Left = 0;
                    } else {
                        DepthNodes[m].Left = DepthNodes[m - 1].Left
                            + DepthNodes[m - 1].Width + self.IntervalWidth;
                    }
                }
            } else {
                var flag = false;
                for ( var m = 0; m < DepthNodes.length; m++) {
                    // 存在子节点的节点是否出现
                    if (DepthNodes[m].Nodes && DepthNodes[m].Nodes.length != 0) {
                        flag = true
                        var tempNodeLeft_ = GetParentLeftByNode(DepthNodes[m].Nodes[0]);
                        tempNodeLeft_ -= (DepthNodes[m].Width / 2);
                        DepthNodes[m].Left = tempNodeLeft_;
                    } else {
                        if (flag) {
                            adjustBox(DepthNodes[m], m);
                        }
                    }
                }
                for ( var m = 0; m < DepthNodes.length; m++) {
                    if (DepthNodes[m].Left == null) {
                        SetLeftByDepthNode(DepthNodes, m, "LTR");
                    }
                }
            }
        }
        var MaxLeftValue = this.Nodes[0].Left;
        for ( var n = 1; n < this.Nodes.length; n++) {//取得最小左距离
            if (MaxLeftValue > this.Nodes[n].Left) {
                MaxLeftValue = this.Nodes[n].Left;
            }
        }
        MaxLeftValue = (-MaxLeftValue) + this.Left;
        for ( var n = 0; n < this.Nodes.length; n++) {//重新设置距离
            this.Nodes[n].Left += MaxLeftValue;
            this.Nodes[n].Box.left = this.Nodes[n].Left;
            this.Nodes[n].Box.top = this.Nodes[n].Top;
        }

        for (let n in this.Nodes) {
           let temp  = this.Nodes[n];
            temp.Lines = [];
           if(temp.parentNode){
               let x1 = temp.parentNode.Left + self.NodeWidth/2;
               let y1 = temp.parentNode.Top + self.NodeHeight;
               let x2 = temp.Left + self.NodeWidth/2;
               let y2 = temp.Top;
               let path = "";

               if(x2 < x1){
                   path = "M"+x1+" "+y1+" C"+(x1 - 30)+" "+(y1+35)+", "+(x2+20)+" "+(y2-10)+", "+(x2+20)+" "+(y2-10) +" S"+(x2+8)+" "+(y2-10)+", "+x2+" "+y2;
               }else{
                   path = "M"+x1+" "+y1+" C"+(x1 + 30)+" "+(y1+35)+", "+(x2-20)+" "+(y2-10)+", "+(x2-20)+" "+(y2-10) +" S"+(x2-8)+" "+(y2-10)+", "+x2+" "+y2;
               }

               temp.Lines.push({
                   x1:x1,
                   y1:y1,
                   x2:x2,
                   y2:x2,
                   path:path
               });
           }

           //  if(!temp.Lines){
           //      temp.Lines = [];
           //  }
           // if(temp.Nodes){
           //     for ( let t in temp.Nodes) {
           //         let _tt = temp.Nodes[t];
           //         let x1 = temp.Left + self.NodeWidth/2;
           //         let y1 = temp.Top + self.NodeHeight;
           //         let x2 = _tt.Left + self.NodeWidth/2;
           //         let y2 = _tt.Top;
           //         let path = "";
           //
           //         if(x2 < x1){
           //             path = "M"+x1+" "+y1+" C"+(x1 - 30)+" "+(y1+35)+", "+(x2+20)+" "+(y2-10)+", "+(x2+20)+" "+(y2-10) +" S"+(x2+8)+" "+(y2-10)+", "+x2+" "+y2;
           //         }else{
           //             path = "M"+x1+" "+y1+" C"+(x1 + 30)+" "+(y1+35)+", "+(x2-20)+" "+(y2-10)+", "+(x2-20)+" "+(y2-10) +" S"+(x2-8)+" "+(y2-10)+", "+x2+" "+y2;
           //         }
           //
           //
           //
           //         temp.Lines.push({
           //             x1:x1,
           //             y1:y1,
           //             x2:x2,
           //             y2:x2,
           //             path:path
           //         });
           //
           //     }
           // }
        }

        function GetDepthHeightToRoot(DepthId) {//取得距离顶层的高度
            var tempHeight_ = 0;
            for ( var x_ = DepthId; x_ >= 1; x_--) {
                tempHeight_ += This.DepthGroup[x_].Height;
            }
            tempHeight_ += This.IntervalHeight * (DepthId - 1);
            tempHeight_ -= This.DepthGroup[DepthId].Height;
            return tempHeight_;
        }
        function GetParentLeftByNode(Node_) {// 根据群组中任一节点，取得父节点Left 计算需要数据
            var tempNodesGroup_ = This.DepthGroup[Node_.Depth].NodeGroups[Node_.NodeGroupId];
            var tempGroupWidth_ = (tempNodesGroup_[tempNodesGroup_.length - 1].Left
                + tempNodesGroup_[0].Left + tempNodesGroup_[0].Width) / 2;
            return tempGroupWidth_;
        }
        function adjustBox(Node_, index) {// 节点没有子节点，则为该节点留下空间，调整下方各节点
            var tempNodesGroup_ = This.DepthGroup[Node_.Depth].Nodes;
            for ( var i = index - 1; i >= 0; i--) {
                if (tempNodesGroup_[i].Nodes.length > 0) {
                    // 取得该节点的子节点集合
                    var tempChildNodesGroup_ = tempNodesGroup_[i].Nodes;
                    if (i == index - 1) {
                        if (tempChildNodesGroup_.length >= 3
                            || ((index + 1) < tempNodesGroup_.length && tempChildNodesGroup_.length == 2 && tempNodesGroup_[index + 1].Nodes.length == 2)) {
                            break;
                        }
                    }
                    // 最后的子节点
                    var tempLastChildNode = tempChildNodesGroup_[tempChildNodesGroup_.length - 1];
                    // 该层的所有子节点
                    var tempChildNodesGroupAll_ = This.DepthGroup[Node_.Depth + 1].Nodes;
                    var indexFrom = tempLastChildNode.NodeOrderId;
                    for ( var j = 0; j < tempChildNodesGroupAll_.length; j++) {
                        if (tempChildNodesGroupAll_[j] == tempLastChildNode) {
                            indexFrom = j;
                        }
                    }

                    adjustBoxIn(tempChildNodesGroupAll_, indexFrom + 1,
                        tempChildNodesGroupAll_.length, Node_.Width);
                    break;
                }
            }
        }
        function adjustBoxIn(arr, left, right, boxWidth) {
            for ( var i = left; i < right; i++) {
                arr[i].Left += (boxWidth + This.IntervalWidth);
                if (arr[i].Nodes.length > 0) {
                    adjustBoxIn(arr[i].Nodes, 0, arr[i].Nodes.length, boxWidth);
                }
            }
        }
        function SetLeftByDepthNode(DepthNodes_, NodeId, Type) {
            if (Type == "LTR" && NodeId == DepthNodes_.length - 1) {
                SetLeftByDepthNode(DepthNodes_, NodeId, "RTL");
                return;
            }
            if (Type == "RTL" && NodeId == 0) {
                SetLeftByDepthNode(DepthNodes_, NodeId, "LTR");
                return;
            }
            var FindIndex = null;
            if (Type == "LTR") {
                for ( var r_ = NodeId + 1; r_ < DepthNodes_.length; r_++) {
                    if (DepthNodes_[r_].Left != null) {
                        FindIndex = r_;
                        break;
                    }
                }
                if (FindIndex == null) {
                    SetLeftByDepthNode(DepthNodes_, NodeId, "RTL");
                    return;
                } else {
                    for ( var r_ = FindIndex - 1; r_ >= NodeId; r_--) {
                        DepthNodes_[r_].Left = DepthNodes_[r_ + 1].Left
                            - This.IntervalWidth - DepthNodes_[r_].Width;
                    }
                }
            }
            if (Type == "RTL") {
                for ( var r_ = NodeId - 1; r_ >= 0; r_--) {
                    if (DepthNodes_[r_].Left != null) {
                        FindIndex = r_;
                        break;
                    }
                }
                if (FindIndex == null) {
                    SetLeftByDepthNode(DepthNodes_, NodeId, "LTR");
                    return;
                } else {
                    for ( var r_ = FindIndex + 1; r_ <= NodeId; r_++) {
                        DepthNodes_[r_].Left = DepthNodes_[r_ - 1].Left
                            + This.IntervalWidth
                            + DepthNodes_[r_ - 1].Width;
                    }
                }
            }
        }
        function SetDepthsHeight() {
            //设置层深高度
            for ( var n_ = 1; n_ <= This.Depth; n_++) {
                var tempNodes_ = This.DepthGroup[n_].Nodes;
                var MaxHeight = 0;
                for ( var m_ = 0; m_ < tempNodes_.length; m_++) {
                    if (tempNodes_[m_].Height > MaxHeight) {
                        MaxHeight = tempNodes_[m_].Height;
                    }
                }
                This.DepthGroup[n_].Height = MaxHeight;
            }
        }
        function GetDepth(OrgObj) {
            //取得层深,层群集
            This.Nodes[This.Nodes.length] = OrgObj;
            OrgObj.Depth = (This.Depth == 0) ? This.Depth + 1
                : OrgObj.parentNode.Depth + 1;
            This.Depth = (OrgObj.Depth > This.Depth) ? OrgObj.Depth : This.Depth;
            if (typeof (This.DepthGroup[OrgObj.Depth]) != "object") {
                This.DepthGroup[OrgObj.Depth] = [];
                This.DepthGroup[OrgObj.Depth].Nodes = [];
                This.DepthGroup[OrgObj.Depth].NodeGroups = [];
            }
            This.DepthGroup[OrgObj.Depth].Nodes[This.DepthGroup[OrgObj.Depth].Nodes.length] = OrgObj;
            if (OrgObj.Depth == 1) {
                This.DepthGroup[OrgObj.Depth].NodeGroups[0] = [];
                This.DepthGroup[OrgObj.Depth].NodeGroups[0][0] = OrgObj;
                OrgObj.NodeGroupId = 0;
                OrgObj.NodeOrderId = 0;
            } else {
                if (This.DepthGroup[OrgObj.Depth].NodeGroups.length == 0) {
                    This.DepthGroup[OrgObj.Depth].NodeGroups[0] = [];
                    This.DepthGroup[OrgObj.Depth].NodeGroups[0][0] = OrgObj;
                    OrgObj.NodeGroupId = 0;
                    OrgObj.NodeOrderId = 0;
                } else {
                    var GroupsLength = This.DepthGroup[OrgObj.Depth].NodeGroups.length;
                    var GroupNodesLength = This.DepthGroup[OrgObj.Depth].NodeGroups[GroupsLength - 1].length;
                    if (OrgObj.parentNode == This.DepthGroup[OrgObj.Depth].NodeGroups[GroupsLength - 1][GroupNodesLength - 1].parentNode) {
                        This.DepthGroup[OrgObj.Depth].NodeGroups[GroupsLength - 1][GroupNodesLength] = OrgObj;
                        OrgObj.NodeGroupId = GroupsLength - 1;
                        OrgObj.NodeOrderId = GroupNodesLength;
                    } else {
                        if (typeof (This.DepthGroup[OrgObj.Depth].NodeGroups[GroupsLength]) != "object") {
                            This.DepthGroup[OrgObj.Depth].NodeGroups[GroupsLength] = [];
                        }
                        GroupNodesLength = This.DepthGroup[OrgObj.Depth].NodeGroups[GroupsLength].length;
                        This.DepthGroup[OrgObj.Depth].NodeGroups[GroupsLength][GroupNodesLength] = OrgObj;
                        OrgObj.NodeGroupId = GroupsLength;
                        OrgObj.NodeOrderId = GroupNodesLength;
                    }
                }
            }

            if (OrgObj.Nodes && OrgObj.Nodes.length != 0) {
                for ( var n = 0; n < OrgObj.Nodes.length; n++) {
                    GetDepth(OrgObj.Nodes[n]);
                }
            }
        }
    }

    $onInit() {
        this.setLayout();
        this.setRoot();
        this.currentList = this.getTree(this.orgNodes);
        this.renderNodes();
    }
}

WtAppTargetMapController.$inject = [
    '$rootScope'
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
        ngModel: '='
    }
};



