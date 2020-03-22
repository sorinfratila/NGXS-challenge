import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { Subject, Observable } from 'rxjs';
import { ExpensesService } from 'src/app/services/expenses.service';
import { Expense } from 'src/app/models/Expense';
import { Store, Select } from '@ngxs/store';
import {
  GetExpenses,
  SetTotalExpenses,
  SetFilterValue,
  SetFilterType,
  SetExpenses,
  SetCurrentPage,
} from 'src/app/store/expense.actions';
import { takeUntil } from 'rxjs/operators';
import { ToastrService } from 'ngx-toastr';
import { ExpenseState } from 'src/app/store/expense.state';

@Component({
  selector: 'app-filter',
  templateUrl: './filter.component.html',
  styleUrls: ['./filter.component.scss'],
})
export class FilterComponent implements OnInit, OnDestroy {
  /** total expenses from BE */
  @Input() totalEntries: number;

  destroy$: Subject<any>;

  /** keeps the total of expenses when filtering */
  expenses: Expense[];

  /** the array of filter values generated from BE data */
  filterValues: any[];

  /** the static array of filters types based on the BE data */
  filterTypes: any[];

  date: Set<any>; // holds all the years found in DB expenses
  currency: Set<any>; // holds all the currencies found in DB expenses
  selectedFilterType: string; // keeps track in component which filter is selected

  @Select(ExpenseState.getFilterType)
  public filterType$: Observable<string>;

  // @Select(ExpenseState.getFilterValue)
  // public filterValue$: Observable<string>;

  constructor(private store: Store, private expensesService: ExpensesService, private toast: ToastrService) {
    this.destroy$ = new Subject<any>();
    this.date = new Set();
    this.currency = new Set();
    this.filterValues = [];
    this.filterTypes = [
      { value: 'default', name: 'All entries' },
      { value: 'date', name: 'Date' },
      { value: 'currency', name: 'Currency' },
    ];
  }

  ngOnInit(): void {
    this.getAllExpenses({ limit: this.totalEntries, offset: 0 });
  }

  ngOnDestroy(): void {
    if (this.destroy$) {
      this.destroy$.next();
      this.destroy$.complete();
    }
  }

  /**
   * get all expenses for filterting
   * set up date Set and currency Set
   */
  private getAllExpenses({ limit, offset }) {
    this.expensesService
      .getExpenses({ limit, offset })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: result => {
          const { expenses } = result;

          this.expenses = expenses;
          expenses.forEach((ex: Expense) => {
            this.date.add(new Date(ex.date).getFullYear());
            this.currency.add(ex.amount.currency);
          });
        },
        error: err => this.toast.error(err.message),
      });
  }

  /**
   * on every change in the filter value, update the filteredExpenses array
   * also dispatching actions to handle all the state updates
   */
  public onFilterValueChange = (ev: any) => {
    const {
      target: { value: filterValue },
    } = ev;

    let filteredExpenses = [];

    switch (this.selectedFilterType) {
      case 'currency': {
        filteredExpenses = this.expenses.filter((ex: Expense) => ex.amount.currency === filterValue);
        break;
      }

      case 'date': {
        filteredExpenses = this.expenses.filter((ex: Expense) => {
          const year = new Date(ex.date).getFullYear();
          return year === Number(filterValue);
        });
        break;
      }

      default: {
        break;
      }
    }

    this.store.dispatch([
      new SetFilterValue(filterValue),
      filteredExpenses.length ? new SetExpenses(filteredExpenses) : new GetExpenses(),
    ]);

    if (filteredExpenses.length) {
      // if there is an active filter
      // setting totaExpenses to 1 to force only one page in the pagination footer
      // also selecting the first page in case there was another one selected
      this.store.dispatch([new SetTotalExpenses(1), new SetCurrentPage(1)]);
    }
  };

  /**
   *
   */
  public onFilterTypeChange = (ev: any) => {
    const {
      target: { value: filterType },
    } = ev;

    this.selectedFilterType = filterType;

    if (filterType !== 'default') {
      this.filterValues = Array.from(this[filterType].values()).map(val => ({ value: val, name: val }));

      // adding the default values always the first array item
      this.filterValues.unshift({ value: 'default', name: 'All entries' });
    } else this.filterValues = [];

    this.store.dispatch([new SetFilterType(filterType), new GetExpenses()]);
  };
}
