import { Expense } from '../models/Expense';

export enum ActionsType {
  GET_EXPENSES = '[Expense] GetExpenses',
  GET_LANGUAGE_JSON = '[Expense] GetLanguageJSON',
  TOGGLE_EXPENSE = '[Expense] ToggleExpense',
  UPDATE_EXPENSE = '[Expense] UpdateExpense',
  ADD_EXPENSE_COMMENT = '[Expense] AddComment',
  ADD_EXPENSE_RECEIPT = '[Expense] AddReceipt',
  SET_EXPENSE_FILTER_TYPE = '[Expense] SetFilterType',
  SET_EXPENSE_FILTER_VALUE = '[Expense] SetFilterValue',
  SET_LANGUAGE_CODE = '[Expense] SetLanguageCode',
  SET_CURRENT_PAGE = '[Expense] SetCurrentPage',
  SET_TOTAL_EXPENSES = '[Expense] SetTotalExpenses',
}

export class GetExpenses {
  public static readonly type = ActionsType.GET_EXPENSES;
  constructor(public payload: { limit: number; offset: number }) {}
}

export class AddComment {
  public static readonly type = ActionsType.ADD_EXPENSE_COMMENT;
  constructor(public payload: { comment: string; expenseId: string }) {}
}

export class AddReceipt {
  public static readonly type = ActionsType.ADD_EXPENSE_RECEIPT;
  constructor(public payload: { receipt: File; expenseId: string }) {}
}

export class SetFilterType {
  public static readonly type = ActionsType.SET_EXPENSE_FILTER_TYPE;
  constructor(public filterType: string) {}
}

export class SetFilterValue {
  public static readonly type = ActionsType.SET_EXPENSE_FILTER_VALUE;
  constructor(public filterValue: string) {}
}

export class SetLanguageCode {
  public static readonly type = ActionsType.SET_LANGUAGE_CODE;
  constructor(public lang: string) {}
}

export class GetLanguageJSON {
  public static readonly type = ActionsType.GET_LANGUAGE_JSON;
  constructor() {}
}

export class SetCurrentPage {
  public static readonly type = ActionsType.SET_CURRENT_PAGE;
  constructor(public currentPage: number) {}
}

export class SetTotalExpenses {
  public static readonly type = ActionsType.SET_TOTAL_EXPENSES;
  constructor(public total: number) {}
}

export class ToggleExpense {
  public static readonly type = ActionsType.TOGGLE_EXPENSE;
  constructor(public expense: Expense) {}
}

export class UpdateExpense {
  public static readonly type = ActionsType.UPDATE_EXPENSE;
  constructor(public expense: Expense) {}
}
