import { NgModule } from "@angular/core";
import { RouterModule } from "@angular/router";
import { SharedModule } from "@vendure/admin-ui/core";
import { VerifySellerComponent } from "./components/seller-enable-disable/verify-seller.component";
import { SellerInformationModal } from "./components/seller-information-modal/seller-information-modal.component";
import { SellerInformationCellComponent } from "./components/seller-information-cell/seller-information-cell.component";
import { SellerInformationComponent } from "./components/seller-information/seller-information.component";
import {CatalogModule} from '@vendure/admin-ui/catalog';

@NgModule({
	imports: [
		SharedModule,
		CatalogModule,
		RouterModule.forChild([
			{
				path: "",
				pathMatch: "full",
				component: VerifySellerComponent,
				data: { breadcrumb: "Request Verification" },
			},
		]),
	],
	declarations: [SellerInformationComponent,VerifySellerComponent,SellerInformationModal,SellerInformationCellComponent],
})
export class VerifySellerUIModule {}
