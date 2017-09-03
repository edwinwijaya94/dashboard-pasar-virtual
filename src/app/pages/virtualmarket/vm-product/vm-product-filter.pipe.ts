import * as _ from "lodash";
import {Pipe, PipeTransform} from "@angular/core";

@Pipe({
    name: "productFilter"
})
export class VmProductFilterPipe implements PipeTransform {

    transform(array: any[], nameQuery: any, categoryQuery: any): any {

        if (nameQuery || categoryQuery) {
            return _.filter(array, row=>(row.name.toLowerCase().indexOf(nameQuery.toLowerCase()) > -1 && row.category.toLowerCase().indexOf(categoryQuery.toLowerCase()) > -1) );
        }
        return array;
    }
}