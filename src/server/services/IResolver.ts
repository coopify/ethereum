export interface IResolver {
    createAccountAsync(): any
    getAccountsAsync(): any
    getBalanceAsync(of: string): any
    getFuelBalanceAsync(of: string): any
    addFreeFuelAmountAsync(to: string, amount: number): any
    transferCoopiesAsync(to: string, amount: number, from?: string, frompk?: string): any
    getTransactionsByAccount(address: string): any
}
