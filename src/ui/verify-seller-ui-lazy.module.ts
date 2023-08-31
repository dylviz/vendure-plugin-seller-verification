import { NgModule, inject } from "@angular/core";
import { RouterModule } from "@angular/router";
import { SharedModule, DataService } from "@vendure/admin-ui/core";
import { VerifySellerComponent } from "./components/seller-enable-disable/verify-seller.component";

import { Observable, of } from "rxjs";
import { map } from "rxjs/operators";

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
