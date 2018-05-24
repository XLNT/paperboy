
export interface IFilterOptions {
  fromBlock?: string,
  // ^ the block from which to monitor events
  // (defaults to latest block at call time)
  addresses?: string[]
  // ^ a set of addresses to filter against
  args?: object
  // ^ filter your events by arguments
  // supports EQ and IN constraints
  // {
  //   to: '0x1' | ['0x1']
  // }
  confirmations?: number
  // ^ number of confirmations required (defaults to 1)
}

export interface IFilter {
  options: IFilterOptions
  onMatch: (events: any[]) => Promise<void>
}
