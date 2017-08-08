/**
 * Created by yanshi0429 on 17/8/8.
 */
import template from './template.html';
import css from './map.less';

class WtAppTargetMapController {
    constructor($rootScope) {
        this.$rootScope = $rootScope;
        this.mm = "macj";

    }

    $onInit() {
        console.log('this is log');
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
    controller: WtAppTargetMapController
};



