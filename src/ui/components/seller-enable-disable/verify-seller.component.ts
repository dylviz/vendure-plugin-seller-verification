import {
	ChangeDetectionStrategy,
	ChangeDetectorRef,
	Component,
	OnInit,
} from "@angular/core";
import { FormBuilder, UntypedFormGroup, FormArray, FormControl, Validators,FormGroup } from "@angular/forms";
import {
	NotificationService,
} from "@vendure/admin-ui/core";
import { SellerInformationField } from "../../types";
import { GET_SELLER_INFORMATION_FIELDS } from "../../queries";
import { DataService } from '@vendure/admin-ui/core';
import { GET_ACTIVE_CHANNEL, REQUEST_VERIFICATION } from "./verify-seller.graphql";
import { ID } from "@vendure/core";
import { forkJoin } from 'rxjs';


@Component({
	selector: "vdr-store-credit-detail",
	templateUrl: "./verify-seller.component.html",
	styleUrls: ["./verify-seller.component.scss"],
	changeDetection: ChangeDetectionStrategy.Default,
})
export class VerifySellerComponent
	implements OnInit
{
	detailForm: UntypedFormGroup;
	fields: SellerInformationField[];
	sellerInformation:any;
	sellerId: ID;

	constructor(
		private dataService: DataService,
		private formBuilder: FormBuilder,
		private changeDetector: ChangeDetectorRef,
		private notificationService: NotificationService
	) {
		
		
	}

	ngOnInit() {
		this.detailForm= this.formBuilder.group({fields: new FormArray([])});
		const sellerInformartionFieldsObservable= this.dataService.query(GET_SELLER_INFORMATION_FIELDS).single$;
		const activeChannelQueryObservable= this.dataService.query(GET_ACTIVE_CHANNEL).single$;
		forkJoin([sellerInformartionFieldsObservable, activeChannelQueryObservable])
		.subscribe({
			next: ([sellerInformationFieldQueryResult, activeChannelQueryResult]) => {
				const activeChannelSeller= (activeChannelQueryResult as any).activeChannel?.seller.customFields;
				const sellerAlreadyVerified= activeChannelSeller.isVerified;
				this.sellerInformation= JSON.parse(activeChannelSeller.information);
				this.sellerId= (activeChannelQueryResult as any).activeChannel?.seller.id;
				if((sellerInformationFieldQueryResult as any)?.getSellerInformationFields?.length){
					this.fields= (sellerInformationFieldQueryResult as any).getSellerInformationFields
				}else{
					this.fields= []
				}
				this.detailForm= this.formBuilder.group({fields: new FormArray(this.fields.map((f:SellerInformationField)=> new FormControl({value: this.sellerInformation?.[f.fieldName]?.value??undefined, disabled: sellerAlreadyVerified}, Validators.required)))})
				this.changeDetector.markForCheck()
			},
			error: (e) => console.error(e),
			complete: () => console.info('complete') 
		})
	}

	save() {
		const rawData= this.detailForm.getRawValue().fields;
		let data={}
		for(let fieldIndex in this.fields){
			const field= this.fields[fieldIndex].fieldName;
			data[field as any]=rawData[fieldIndex];
		}
		this.dataService.mutate(REQUEST_VERIFICATION,{sellerInformation: data, sellerId: this.sellerId}).subscribe((response:any)=>{
			if(response?.requestVerification?.success){
				this.notificationService.success('Verification Request Sent')
			}else{
			    this.notificationService.error('Verification Request not sent')	
			}
			this.detailForm.markAsPristine()
		})
	}

	
}
