import { Component, OnInit, ChangeDetectionStrategy,  } from '@angular/core';
import { Dialog } from '@vendure/admin-ui/core'
import { UntypedFormGroup, FormBuilder, FormControl, FormArray } from '@angular/forms';
import { DataService, NotificationService } from '@vendure/admin-ui/core';
import { ID } from '@vendure/common/lib/shared-types';
import { VERIFY_SELLER_MUTATION } from '../../queries';
import { SellerInformationField } from '../../types';


@Component({
    selector: 'seller-information-modal',
    templateUrl: './seller-information-modal.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
  })
  export class SellerInformationModal implements Dialog, OnInit{
    resolveWith: (result?: any) => void;
    fields: SellerInformationField[];
    information:string;
    isAlreadyVerified:boolean;
    sellerId: ID;
    formGroup: UntypedFormGroup;

    constructor(private dataService: DataService, private formBuilder: FormBuilder, private ns:NotificationService){

    }

    ngOnInit(): void {
        const sellerInformation:{ [key: string]: string;}= JSON.parse(this.information);
        this.formGroup= this.formBuilder.group({fields: new FormArray(this.fields.map((f:SellerInformationField)=> new FormControl(sellerInformation?.[f.fieldName]??"")))})
    }

    cancel(){
        this.resolveWith()
    }

    verifySeller(){
        this.dataService.mutate(VERIFY_SELLER_MUTATION, {id: this.sellerId}).subscribe((data:any)=>{
            if(data?.updateSeller?.id === this.sellerId){
                this.resolveWith();
                this.ns.success('Seller Verified Successfully')
            }else{
                this.ns.error('Unable to verify Seller')
            }
        })
    }

  }