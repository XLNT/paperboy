import { IFilter } from './Filter'

import Sequelize = require('sequelize')

import {
  makeSequelizeModels as makeGnarlyModels,
} from '@xlnt/gnarly-core'

import {
  sequelizeModels as makeEventsModels,
} from '@xlnt/gnarly-reducer-events'

import {
  sequelizeModels as makeBlockMetaModels,
} from '@xlnt/gnarly-reducer-block-meta'

/**
 * Assumes that connectionString is pointing to a gnarly instance's output.
 * Gnarly must be configured with the `@xlnt/gnarly-reducer-events` reducer.
 */
class Monitor {
  private activeFilters: { [_: string]: IFilter } = {}
  private sequelize: any
  private FilterDelivery: any
  private Transaction: any
  private Events: any
  private Block: any
  private stopChecking: NodeJS.Timer

  constructor (
    connectionString: string,
    private interval: number = 1000,
  ) {
    this.sequelize = new Sequelize(connectionString, {
      logging: false,
      pool: {
        max: 5,
        min: 0,
        idle: 20000,
        acquire: 20000,
      },
      retry: {
        max: 1,
      },
    })

    // @TODO(shrugs) - share this stuff with gnarly somehow (@xlnt/gnarly-models-sequelize)?

    const { DataTypes } = Sequelize
    const { Transaction } = makeGnarlyModels(Sequelize, this.sequelize)
    const { Events } = makeEventsModels(Sequelize, this.sequelize)
    const { Block } = makeBlockMetaModels(Sequelize, this.sequelize)

    this.Transaction = Transaction
    this.Events = Events
    this.Block = Block
    this.FilterDelivery = this.sequelize.define('filter_delivery', {
      filterId: { type: DataTypes.STRING },
      delivered: { type: DataTypes.BOOLEAN, defaultValue: false },
    })

    this.FilterDelivery.belongsTo(this.Events)
    this.Events.hasMany(this.FilterDelivery)

    this.start()
  }

  public addFilter = async (id: string, filter: IFilter) => {
    this.activeFilters[id] = {
      ...filter,
      options: {
        ...filter.options,
        addresses: filter.options.addresses.map((a) => a.toLowerCase()),
      },
    }
  }

  public removeFilter = async (id: string) => {
    await this.FilterDelivery.destroy({
      where: {
        filterId: { [Sequelize.Op.eq]: id },
      },
    })
    delete this.activeFilters[id]
  }

  public stop = async () => {
    clearInterval(this.stopChecking)
  }

  private start = async () => {
    // if this process ever crashes, the clients need to handle recovery
    this.FilterDelivery.sync({ force: true })
    this.stopChecking = setInterval(this.tick, this.interval)
  }

  private tick = async () => {
    // every interval, check each of the filters in turn
    for (const k of Object.keys(this.activeFilters)) {
      await this.handleFilter(k, this.activeFilters[k])
    }
  }

  private handleFilter = async (id: string, filter: IFilter) => {
    const { Op } = Sequelize

    const where: any = {}
    const include: any = []
    // if there are addresess to filter by, include those as an IN condition
    if (filter.options.addresses) {
      where.address = { [Op.in]: filter.options.addresses }
    }

    // if (filter.fromBlock) {
    //   include.push({
    //     model: this.Transaction,
    //     include: [{
    //       model: this.Block,
    //       where: this.sequelize.where(
    //         this.sequelize.cast('block.number', 'integer'),
    //         { [Op.gte]: filter.fromBlock },
    //       ),
    //     }],
    //   })
    // }

    // if (filter.args) {

    // }

    // include delivery status
    // and filter for events that have not been delivered
    where['$filter_deliveries.delivered$'] = { [Op.eq]: null }
    include.push({
      model: this.FilterDelivery,
      where: { filterId: { [Op.eq]: id } },
      required: false,
    })

    // fetch
    // @TODO(shrugs) - throttle with batch*()
    const undelivered = await this.Events.findAll({
      where,
      include,
    })

    if (!undelivered.length) {
      // no events to consider
      return
    }

    const plain = undelivered.map((ud) => ud.get({ plain: true }))
    await filter.onMatch(plain)

    await this.FilterDelivery.bulkCreate(undelivered.map((ud) => ({
      filterId: id,
      eventId: ud.get('id'),
      delivered: true,
    })))
  }

}

export default Monitor
