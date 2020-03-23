import { Expense } from '../models/Expense';
import { State, Action, StateContext, Selector, NgxsOnInit, NgxsSimpleChange } from '@ngxs/store';
import { ExpensesService } from '../services/expenses.service';
import { TranslationService } from '../services/translation.service';
import {
  GetExpenses,
  SetFilterType,
  SetFilterValue,
  SetLanguageCode,
  SetCurrentPage,
  GetLanguageJSON,
  SetTotalExpenses,
  SetExpenses,
} from './expense.actions';
import { map } from 'rxjs/operators';
import { Injectable } from '@angular/core';

export class ExpensesStateModel {
  expenses: Expense[];
  filter: {
    type: any[];
    value: any[];
  };
  langCode: string;
  totalExpenses: number;
  currentPage: number;
}

@State<ExpensesStateModel>({
  name: 'expenses',
  defaults: {
    expenses: [],
    totalExpenses: 0,
    filter: {
      type: [
        { value: 'default', name: 'All entries', selected: true },
        { value: 'date', name: 'Date', selected: false },
        { value: 'currency', name: 'Currency', selected: false },
      ],
      value: [{ value: 'default', name: 'All entries', selected: true }],
    },
    langCode: 'en',
    currentPage: 1,
  },
})
@Injectable()
export class ExpenseState implements NgxsOnInit {
  constructor(private expensesService: ExpensesService, private i18nService: TranslationService) {}
  @Selector()
  static getExpenses(state: ExpensesStateModel): Expense[] {
    return state.expenses;
  }

  @Selector()
  static getTotalExpenses(state: ExpensesStateModel): number {
    return state.totalExpenses;
  }

  @Selector()
  static getCurrentPage(state: ExpensesStateModel): number {
    return state.currentPage;
  }

  @Selector()
  static getFilterType(state: ExpensesStateModel): any[] {
    return state.filter.type;
  }

  @Selector()
  static getFilterValue(state: ExpensesStateModel): any[] {
    return state.filter.value;
  }

  @Selector()
  static getLanguageCode(state: ExpensesStateModel) {
    return state.langCode;
  }

  public ngxsOnInit({ dispatch, setState, getState }: StateContext<ExpensesStateModel>): void {
    const localState = localStorage.getItem('state');
    const state = getState();

    if (localState) {
      // if we already saved a local state, get that state
      const savedState = JSON.parse(localState);
      setState({
        ...state,
        ...savedState,
      });
    } else {
      // initialize state

      dispatch([GetExpenses, GetLanguageJSON]);
    }
  }

  public ngxsOnChanges(change: NgxsSimpleChange) {
    if (change) {
      const { currentValue, previousValue } = change;
      if (previousValue && currentValue) {
        console.log('state', currentValue);

        // saving state on every change to localStorage for recovery
        localStorage.setItem('state', JSON.stringify(currentValue));
      }
    }
  }

  @Action(GetExpenses)
  getExpenses({ patchState, dispatch }: StateContext<ExpensesStateModel>, action: GetExpenses) {
    return this.expensesService.getExpenses(action.payload).pipe(
      map((getExpensesResponse: any) => {
        const { expenses, total } = getExpensesResponse;

        patchState({ expenses });
        dispatch(new SetTotalExpenses(total));
      }),
    );
  }

  @Action(SetExpenses)
  setExpenses({ patchState }: StateContext<ExpensesStateModel>, { expenses }: SetExpenses) {
    patchState({ expenses });
  }

  @Action(SetTotalExpenses)
  setTotalExpenses({ patchState }: StateContext<ExpensesStateModel>, { total }: SetTotalExpenses) {
    patchState({ totalExpenses: total });
  }

  @Action(SetFilterType)
  setFilterType(ctx: StateContext<ExpensesStateModel>, { filterType }: SetFilterType) {
    const state = ctx.getState();
    ctx.patchState({
      filter: {
        ...state.filter,
        type: filterType,
      },
    });
  }

  @Action(SetFilterValue)
  setFilterValue({ getState, patchState }: StateContext<ExpensesStateModel>, { filterValue }: SetFilterValue) {
    const state = getState();
    patchState({
      filter: {
        ...state.filter,
        value: filterValue,
      },
    });
  }

  @Action(SetLanguageCode)
  setLanguageCode({ patchState, dispatch }: StateContext<ExpensesStateModel>, { langCode }: SetLanguageCode) {
    patchState({ langCode });

    return dispatch(new GetLanguageJSON());
  }

  @Action(GetLanguageJSON)
  async getLanguageJSON({ getState }: StateContext<ExpensesStateModel>) {
    const { langCode } = getState();

    try {
      const langObj = await this.i18nService.getLanguageJSON(langCode);
      this.i18nService.setLanguageJSON(langObj);
    } catch (e) {
      // errors are caught by the global error handler
      throw e;
    }
  }

  @Action(SetCurrentPage)
  setCurrentPage({ patchState }: StateContext<ExpensesStateModel>, { currentPage }: SetCurrentPage) {
    patchState({ currentPage });
  }
}
