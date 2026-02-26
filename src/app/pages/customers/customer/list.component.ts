import { Component, OnInit } from '@angular/core';
import { LocalDataSource } from 'ng2-smart-table';
import { Router } from '@angular/router';
import { StorageService } from '../../shared/services/storage.service';
import { CustomersService } from '../services/customer.service';
import { StoreService } from '../../store-management/services/store.service';
import { TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { ErrorService } from '../../shared/services/error.service';

@Component({
  selector: 'ngx-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss']
})
export class ListComponent implements OnInit {
  source: any = new LocalDataSource();
  settings = {};
  search_text: string = '';
  loadingList = false;
  perPage = 20;
  currentPage = 1;
  totalCount;
  stores: Array<any> = [];
  selectedStore: String = '';
  searchValue: string = '';
  searchEmail: string = '';
  searchCity: string = '';
  searchPhone: string = '';
  searchCompany: string = '';
  searchTimeout: any;
  searchTags: Array<{field: string, value: string, label: string}> = [];
  showFilterDropdown: boolean = false;
  params = this.loadParams();
  constructor(
    private customersService: CustomersService,
    public router: Router,
    private toastr: ToastrService,
    private storageService: StorageService,
    private storeService: StoreService,
    private translate: TranslateService,
    private errorService: ErrorService
  ) {
    this.getStoreList()
    this.selectedStore = this.storageService.getMerchant();

    this.translate.onLangChange.subscribe((lang) => {
      this.params.lang = this.storageService.getLanguage();
      this.getCustomers();
    });
  }
  ngOnInit() {
    this.getCustomers();
  }
  getStoreList() {
    this.storeService.getListOfMerchantStoreNames({ 'store': '' })
      .subscribe(res => {
        res.forEach((store) => {
          this.stores.push({ value: store.code, label: store.code });
        });
      });
  }
  loadParams() {

    return {
      store: this.storageService.getMerchant(),
      lang: this.storageService.getLanguage(),
      count: this.perPage,
      page: 0
    };
  }
  getCustomers() {
    this.params.page = this.currentPage - 1;
    this.loadingList = true;

    const hasSearchParams = this.searchTags.length > 0;
    
    const apiCall = hasSearchParams 
      ? this.customersService.searchCustomers(this.params)
      : this.customersService.getCustomers(this.params);

    apiCall.subscribe(customer => {
        this.loadingList = false;
        const customers = customer.customers.map(c => ({
          ...c,
          fullName: `${c.firstName || ''} ${c.lastName || ''}`.trim(),
          city: c.billing?.city || '',
          phone: c.billing?.phone || '',
          company: c.billing?.company || '',
          storeCode: c.storeCode || c.store || c.storeName || ''
        }));
        this.source.load(customers);
        this.totalCount = customer.totalPages;
      }, error => {
        this.errorService.error('ERROR.SYSTEM_ERROR', error);
      });
    this.setSettings();
  }
  setSettings() {
    this.settings = {

      actions: {
        columnTitle: this.translate.instant('ORDER.ACTIONS'),
        add: false,
        edit: false,
        delete: false,
        position: 'right',
        custom: [
          {
            name: 'edit',
            title: '<i class="nb-edit"></i>'
          },
          {
            name: 'delete',
            title: '<i class="nb-trash"></i>'
          }
        ]
      },
      pager: {
        display: false
      },
      columns: {
        id: {
          title: this.translate.instant('COMMON.ID'),
          type: 'number',
          filter: false
        },
        fullName: {
          title: this.translate.instant('COMMON.NAME'),
          type: 'string',
          filter: false
        },
        emailAddress: {
          title: this.translate.instant('USER_FORM.EMAIL_ADDRESS'),
          type: 'string',
          filter: false
        },
        city: {
          title: this.translate.instant('COMMON.CITY'),
          type: 'string',
          filter: false
        },
        phone: {
          title: this.translate.instant('COMMON.PHONE'),
          type: 'string',
          filter: false
        },
        company: {
          title: this.translate.instant('CUSTOMERS.COMPANY'),
          type: 'string',
          filter: false
        },
        storeCode: {
          title: this.translate.instant('STORE.MERCHANT_STORE'),
          type: 'string',
          filter: false
        }
      },
    };
  }

  changePage(event) {
    switch (event.action) {
      case 'onPage': {
        this.currentPage = event.data;
        break;
      }
      case 'onPrev': {
        this.currentPage--;
        break;
      }
      case 'onNext': {
        this.currentPage++;
        break;
      }
      case 'onFirst': {
        this.currentPage = 1;
        break;
      }
      case 'onLast': {
        this.currentPage = event.data;
        break;
      }
    }
    this.getCustomers()
  }
  onSearch(query: string = '') {
    clearTimeout(this.searchTimeout);
    
    if (query.length == 0) {
      this.searchValue = null;
      delete this.params["name"];
      this.currentPage = 1;
      this.getCustomers();
    } else {
      this.params["name"] = query;
      this.searchValue = query;
      this.searchTimeout = setTimeout(() => {
        this.currentPage = 1;
        this.getCustomers();
      }, 500);
    }
  }
  
  onSearchEmail(query: string = '') {
    clearTimeout(this.searchTimeout);
    
    if (query.length == 0) {
      this.searchEmail = null;
      delete this.params["email"];
      this.currentPage = 1;
      this.getCustomers();
    } else {
      this.params["email"] = query;
      this.searchEmail = query;
      this.searchTimeout = setTimeout(() => {
        this.currentPage = 1;
        this.getCustomers();
      }, 500);
    }
  }

  onSearchCity(query: string = '') {
    clearTimeout(this.searchTimeout);
    
    if (query.length == 0) {
      this.searchCity = null;
      delete this.params["city"];
      this.currentPage = 1;
      this.getCustomers();
    } else {
      this.params["city"] = query;
      this.searchCity = query;
      this.searchTimeout = setTimeout(() => {
        this.currentPage = 1;
        this.getCustomers();
      }, 500);
    }
  }

  onSearchPhone(query: string = '') {
    clearTimeout(this.searchTimeout);
    
    if (query.length == 0) {
      this.searchPhone = null;
      delete this.params["phone"];
      this.currentPage = 1;
      this.getCustomers();
    } else {
      this.params["phone"] = query;
      this.searchPhone = query;
      this.searchTimeout = setTimeout(() => {
        this.currentPage = 1;
        this.getCustomers();
      }, 500);
    }
  }

  onSearchCompany(query: string = '') {
    clearTimeout(this.searchTimeout);
    
    if (query.length == 0) {
      this.searchCompany = null;
      delete this.params["company"];
      this.currentPage = 1;
      this.getCustomers();
    } else {
      this.params["company"] = query;
      this.searchCompany = query;
      this.searchTimeout = setTimeout(() => {
        this.currentPage = 1;
        this.getCustomers();
      }, 500);
    }
  }
  resetSearch() {
    this.searchValue = null;
    this.searchEmail = null;
    this.searchCity = null;
    this.searchPhone = null;
    this.searchCompany = null;
    this.searchTags = [];
    this.params = this.loadParams();
    this.currentPage = 1;
    this.getCustomers();
  }

  addSearchTag(field: string, value: string, label: string) {
    if (!value || value.trim() === '') return;
    
    // Remove existing tag for same field
    this.searchTags = this.searchTags.filter(tag => tag.field !== field);
    
    // Add new tag
    this.searchTags.push({ field, value: value.trim(), label });
    
    // Update params
    this.params[field] = value.trim();
    
    // Clear individual search field
    switch(field) {
      case 'name': this.searchValue = ''; break;
      case 'email': this.searchEmail = ''; break;
      case 'city': this.searchCity = ''; break;
      case 'phone': this.searchPhone = ''; break;
      case 'company': this.searchCompany = ''; break;
    }
    
    this.showFilterDropdown = false;
    this.currentPage = 1;
    this.getCustomers();
  }

  removeSearchTag(field: string) {
    this.searchTags = this.searchTags.filter(tag => tag.field !== field);
    delete this.params[field];
    this.currentPage = 1;
    this.getCustomers();
  }

  toggleFilterDropdown() {
    this.showFilterDropdown = !this.showFilterDropdown;
  }

  closeDropdown(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (!target.closest('.search-bar-wrapper')) {
      this.showFilterDropdown = false;
    }
  }
  addCustomer() {
    localStorage.setItem('customerid', '');
    this.router.navigate(['/pages/customer/add']);
  }
  onSelectStore(e) {
    this.params["store"] = e.value;
    this.getCustomers();
  }

  onClickAction(event) {
    switch (event.action) {
      case 'edit':
        this.onEdit(event);
        break;
      case 'delete':
        this.onDelete(event);
        break;

    }
  }

  onEdit(event) {
    localStorage.setItem('customerid', event.data.id);
    this.router.navigate(['/pages/customer/add']);
  }



  onDelete(event) {
    console.log('DELETE');
    localStorage.setItem('customerid', null);
    //TODO dialog
    
    this.customersService.deleteCustomer(event.data.id,localStorage.getItem('merchant'))
    .subscribe(data => {
      this.loadingList = false;
    }, error => {
      this.errorService.error('ERROR.SYSTEM_ERROR', error);
    });
    this.errorService.success('COMMON.SUCCESS_REMOVE');
    this.router.navigate(['/pages/customer/list']);
  }
}
