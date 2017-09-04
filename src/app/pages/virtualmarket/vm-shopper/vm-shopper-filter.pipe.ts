import * as _ from "lodash";
import {Pipe, PipeTransform} from "@angular/core";

@Pipe({
    name: "shopperFilter"
})
export class VmShopperFilterPipe implements PipeTransform {

    transform(array: any[], nameQuery: any): any {

        if (nameQuery) {
            return _.filter(array, row=>(row.name.toLowerCase().indexOf(nameQuery.toLowerCase()) > -1) );
        }
        return array;
    }
}