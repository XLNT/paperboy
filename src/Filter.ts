
export interface IFilterOptions {
  fromBlock?: string,
  // ^ the block from which to monitor events
  // (defaults to latest block at call time)
  addresses?: string[]
  // ^ a set of addresses to filter against
  event?: string
  // ^ Transfer(address,address,uint256)
  eventName?: string
  // ^ Transfer
  args?: object
  // ^ filter your events by arguments
  // supports EQ and IN constraints
  // ex: { to: '0x1' } = WHERE to = '0x1'
  // ex: { to: [ '0x1', '0x2' ] } = WHERE to IN [ ... ]
  confirmations?: number
  // ^ number of confirmations required (defaults to 0)
}

export interface IFilter {
  options: IFilterOptions
  onMatch: (events: any[]) => Promise<void>
}
