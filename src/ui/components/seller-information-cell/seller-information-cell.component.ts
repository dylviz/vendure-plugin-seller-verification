import { Component, ChangeDetectionStrategy, OnInit, Input } from '@angular/core';
import { CustomColumnComponent, DataService, ModalService } from '@vendure/admin-ui/core';
import { FormBuilder} from '@angular/forms';
import { Seller } from '@vendure/common/lib/generated-types';
import { GET_SELLER_INFORMATION_FIELDS } from '../../queries';
import { SellerInformationModal } from '../seller-information-modal/seller-information-modal.component';
import { SellerInformationField } from '../../types';
@Component({
  selector: 'seller-information-cell',
  templateUrl: "./seller-information-cell.component.html",
  styleUrls: ["./seller-information-cell.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SellerInformationCellComponent implements CustomColumnComponent, OnInit{
  @Input() rowItem: Seller;
  fields: SellerInformationField[];
  constructor(private dataService: DataService, private formBuilder: FormBuilder, private modalService: ModalService){

  }

  ngOnInit(): void {
    this.dataService.query(GET_SELLER_INFORMATION_FIELDS).stream$.subscribe((data:any)=>{
      if(data?.getSellerInformationFields?.length){
        this.fields= data.getSellerInformationFields
      }else{
        this.fields= []
      }
    })
  }

  showData(){
    this.modalService.fromComponent(SellerInformationModal, {locals:{
      fields: this.fields, 
      isAlreadyVerified: this.rowItem.customFields.isVerified,
      sellerId: this.rowItem.id,
      information: this.rowItem.customFields.information
    }}).subscribe()
  }
}