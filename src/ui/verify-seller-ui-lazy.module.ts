import { NgModule } from "@angular/core";
import { RouterModule } from "@angular/router";
import { SharedModule } from "@vendure/admin-ui/core";
import { VerifySellerComponent } from "./components/seller-enable-disable/verify-seller.component";

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
	declarations: [VerifySellerComponent],
})
export class VerifySellerUIModule {}
