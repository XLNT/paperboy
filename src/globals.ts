import { IFilter } from './Filter'
import Monitor from './Monitor'

class Globals {
  public monitor: Monitor

  public setMonitor = (monitor: Monitor) => {
    this.monitor = monitor
  }

  public get headBlockNumber (): string {
    return this.monitor.headBlockNumber.toString()
  }

  public addFilter = async (id: string, filter: IFilter) => {
    await this.monitor.addFilter(id, filter)
  }

  public removeFilter = async (id: string) => {
    await this.monitor.removeFilter(id)
  }

}

export default new Globals()
