import { Injector } from "@angular/core";
import { DataService, NotificationService } from "@vendure/admin-ui/core";
import { take } from 'rxjs';
import {gql} from 'graphql-tag';
import { Success } from "./generated-admin-types";
import { firstValueFrom } from 'rxjs';

const BULK_SELLER_VERIFICATION=gql`
	mutation SetSellerBulkVerificationStatus($input: SetBulkSellerVerificationStatusInput!){
		setBulkSellerVerificationStatus(input: $input){
			success
		}
	}
`
export function parseId(administratorId: string | undefined | null):string{
	const contents= administratorId?.split('_')??[];
	return contents[contents?.length-1];
}

export function enableOnClickCallBack(injector: Injector, selection: any[]){
	bulkActionOnClickCallBack(injector, selection, true);
}

export function disableOnClickCallBack(injector: Injector, selection: any[]){
	bulkActionOnClickCallBack(injector, selection, false);
}

function bulkActionOnClickCallBack(injector: Injector, selection: any[], areGonnabeVerified: boolean){
	const dataService= injector.get(DataService);
	const modalService= injector.get(NotificationService);
	dataService.mutate<{setBulkSellerVerificationStatus: Success},any>(BULK_SELLER_VERIFICATION,{input:{
		sellerIds: selection.map((s)=> s.id),
		areVerified: areGonnabeVerified
	}})
	.pipe(take(1))
	.subscribe(({setBulkSellerVerificationStatus})=>{
		if(setBulkSellerVerificationStatus.success){
			const action= areGonnabeVerified?'enabled':'disabled';
			modalService
			.success(`${selection.length} seller(s) ${action} successfully`)
		}else{
			const action= areGonnabeVerified?'enable':'disable';
			modalService
			.success(`Couldn't ${action} seller(s)`)
		}
	})
}

export function isSuperAdmin(injector: Injector){
	return firstValueFrom(injector.get(DataService).client
	.userStatus()
	.mapSingle(({ userStatus }) =>'1' === parseId(userStatus.administratorId)));
}