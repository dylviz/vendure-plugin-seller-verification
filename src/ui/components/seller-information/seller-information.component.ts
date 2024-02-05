import {Component, Input} from '@angular/core';
import {UntypedFormGroup, FormArray} from '@angular/forms';
@Component({
    selector: 'seller-information',
    templateUrl: './seller-information.component.html',
    styleUrls: ['./seller-information.component.scss']
})
export class SellerInformationComponent {
    @Input() formGroup: UntypedFormGroup;
    @Input() fields: string[];

    getAsset(formControlIndex: number):any{
        return (this.formGroup.get('fields') as FormArray)?.at(formControlIndex)?.value??undefined;
    }

    updateFormControlWithAsset(event:any, formControlIndex: number):void{
        // if(!this.readonly){
            (this.formGroup.get('fields') as FormArray)?.at(formControlIndex)?.setValue(event?.featuredAsset);
        // }
    }

    getAssets(formControlIndex: number):any[]{
        const featuredAsset= this.getAsset(formControlIndex);
        if(featuredAsset){
            return [featuredAsset]
        } 
        return []
    }

    getUpdatePermissions():string[]{
        // if(this.readonly){
            return []
        // }
        // return []
    }

}