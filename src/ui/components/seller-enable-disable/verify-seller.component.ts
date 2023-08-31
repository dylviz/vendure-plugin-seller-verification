import {
	ChangeDetectionStrategy,
	ChangeDetectorRef,
	Component,
	OnInit,
	OnDestroy,
} from "@angular/core";
import { FormBuilder, FormGroup } from "@angular/forms";
import {
	TypedBaseDetailComponent,
	NotificationService,
} from "@vendure/admin-ui/core";
import { Observable, of } from "rxjs";
import { map, filter } from "rxjs/operators";

import { SET_SELLER_VERIFICATION } from "./verify-seller.graphql";
import {
	SetSellerVerificationStatusInput,
	SetSellerVerificationStatusMutation,
	SetSellerVerificationStatusMutationVariables,
} from "../../../generated/generated-admin-types";

@Component({
	selector: "vdr-store-credit-detail",
	templateUrl: "./store-credit-detail.component.html",
	styleUrls: ["./store-credit-detail.component.scss"],
	changeDetection: ChangeDetectionStrategy.Default,
})
export class VerifySellerComponent
	extends TypedBaseDetailComponent<any, never>
	implements OnInit, OnDestroy
{
	detailForm: FormGroup;
	which = false;

	constructor(
		private formBuilder: FormBuilder,
		private changeDetector: ChangeDetectorRef,
		private notificationService: NotificationService
	) {
		super();
		this.detailForm = this.formBuilder.group({
			key: [""],
			value: [],
		});
	}

	ngOnInit() {
		if (this.router.url != "/extensions/store-credit/create") {
			this.which = false;
			this.init();
		} else {
			this.which = true;
		}
	}

	ngOnDestroy() {
		this.destroy();
	}

	update() {
		this.saveChanges()
			.pipe(filter((result) => !!result))
			.subscribe({
				next: () => {
					this.detailForm.markAsPristine();
					this.changeDetector.markForCheck();
					this.notificationService.success("common.notify-update-success", {
						entity: "StoreCredit",
					});
				},
				error: () => {
					this.notificationService.error("common.notify-update-error", {
						entity: "StoreCredit",
					});
				},
			});
	}

	private saveChanges(): Observable<boolean> {
		if (this.detailForm.dirty) {
			const formValue = this.detailForm.value;
			const input: SetSellerVerificationStatusInput = {
				sellerId: formValue.value,
				isVerified: true,
			};

			this.route.params.forEach((val) => {
				input.sellerId = val.id;
			});

			return this.dataService
				.mutate<
					SetSellerVerificationStatusMutation,
					SetSellerVerificationStatusMutationVariables
				>(SET_SELLER_VERIFICATION, {
					input,
				})
				.pipe(map(() => true));
		} else {
			return of(false);
		}
	}

	protected setFormValues(entity: any) {
		console.log(entity);
		// this.detailForm.patchValue({
		// 	key: entity.key,
		// 	value: entity.value,
		// });
	}
}
