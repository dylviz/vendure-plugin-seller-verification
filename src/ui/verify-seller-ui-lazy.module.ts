import { NgModule } from "@angular/core";
import { RouterModule } from "@angular/router";
import { SharedModule } from "@vendure/admin-ui/core";
import { VerifySellerComponent } from "./components/seller-enable-disable/verify-seller.component";
import { SellerInformationModal } from "./components/seller-information-modal/seller-information-modal.component";
import { SellerInformationCellComponent } from "./components/seller-information-cell/seller-information-cell.component";

@NgModule({
	imports: [
		SharedModule,
		RouterModule.forChild([
			{
				path: "",
				pathMatch: "full",
				component: VerifySellerComponent,
				data: { breadcrumb: "Verify Seller" },
			},
		]),
	],
	declarations: [VerifySellerComponent,SellerInformationModal,SellerInformationCellComponent],
})
export class VerifySellerUIModule {}
