# 📰 Paperboy

[![standard-readme compliant](https://img.shields.io/badge/readme%20style-standard-brightgreen.svg?style=flat-square)](https://github.com/RichardLitt/standard-readme)


> Paperboy is a replacement for web3's subscriptions/filters. It uses the output of `@xlnt/gnarly-reducer-events` which means it's highly reliable, resilient to downtime, single-delivery (best effort), etc.

**Basically, it'll solve your event watching problems.**

> ## 🛠 Status: In Development
> paperboy is currently in development. If you'd like to play around with it, check out the usage instructions below. We'll be making `XLNT/scry-one` into a paperboy client in the near future.

## Background

web3 filter subscriptions are notably fragile. they also don't provide a bunch of features that modern clients expect, namely, filtering by `confirmation` threshold and decoded event `args`.

**📰 XLNT/paperboy** is a approximate re-implementation of the `eth_newFilter` endpoint that is designed to be more reliable and more fully featured. It works by sourcing events from the output of **@xlnt/gnarly-reducer-events**.

Your websocket client connects to **paperboy** and then can create and clear filters by issing pseudo-rpc calls. See below for specific usage details.

## Usage

### Running

To use paperboy, first start a [gnarly](https://github.com/XLNT/gnarly) instance that's configured with the **@xlnt/gnarly-reducer-events** reducer. For more info on how to do that, see the [gnarly docs](https://github.com/XLNT/gnarly).

Then, run **paperboy** in your preferred manner, perhaps as a docker container:

```bash
docker run --rm --name paperboy \
  -e "DEBUG=paperboy*" \
  -e "GNARLY_DATABASE_URL=postgres://postgres@127.0.0.1:5432/default" \
  -e "PORT=3000" \
  -p 3000:3000 \
  shrugs/paperboy:latest
```

(make sure your postgres instance is available and paperboy is pointed to it correctly)

### Interacting

By default, paperboy exposes a websocket on port 3000, so you can use something like [Simple Websocket Client](https://chrome.google.com/webstore/detail/simple-websocket-client/pfdhoblngboilpfeibdedpjgfnlcodoo) to connect to it.

**paperboy** expects JSON-formatted requests. You can create a filter using the call:

```json
{
    "path": "/filter",
    "args": {
        "addresses": [ "0x06012c8cf97bead5deae237070f9587f8e7a266d" ],
        "fromBlock": "4606121",
        "args": {
            "address": "0xtest"
        },
        "confirmations": 10
    }
}
```

Where `args` conforms to `IFilterOptions`:

```ts
  fromBlock?: string,
  // ^ the block from which to monitor events
  // (defaults to latest block at call time)
  addresses?: string[]
  // ^ a set of addresses to filter against
  args?: object
  // ^ filter your events by arguments
  // supports EQ and IN constraints
  // ex: { to: '0x1' } = WHERE to = '0x1'
  // ex: { to: [ '0x1', '0x2' ] } = WHERE to IN [ ... ]
  confirmations?: number
  // ^ number of confirmations required (defaults to 0)
```

**paperboy** will then return a `filter_id` message

```json
{
    "type": "filter_id",
    "data": "1f8ff02a-8619-4c18-a0f2-3a1a4d9277c3"
}
```

and then start delivering events that match your filter

```json
{
  "type": "match",
  "data": {
    "id": "1f8ff02a-8619-4c18-a0f2-3a1a4d9277c3",
    "event": {
      "uuid": "f731cda9-ba98-4ada-9a85-482751ed5f05",
      "address": "0x06012c8cf97bead5deae237070f9587f8e7a266d",
      "event": "Transfer(address,address,uint256)",
      "eventName": "Transfer",
      "signature": "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef",
      "args": {
        "address": "0xtest"
      },
      "createdAt": "2018-05-25T18:24:41.449Z",
      "patchId": "ace0fcaa-f60e-46a1-8719-6aab595459ee"
    }
  }
}
```

### Examples

Here are some example requests:

**find all CryptoKitty Transfer events with 2 confirmations**

```json
{
  "path": "/filter",
  "args": {
    "addresses": [
      "0x06012c8cf97bead5deae237070f9587f8e7a266d"
    ],
    "eventName": "Transfer",
    "confirmations": 2
  }
}
```

**find all CryptoKitty Transfer events to a specific address with no confirmations**

```json
{
  "path": "/filter",
  "args": {
    "addresses": [
      "0x06012c8cf97bead5deae237070f9587f8e7a266d"
    ],
    "eventName": "Transfer",
    "args": {
        "to": "0xaddr"
    }
  }
}
```


## Install

> Want to know more about running paperboy and developing it locally?

```bash
# install deps
yarn install

# optionally use default environment variables
cp .env.example .env

# run the app
yarn run dev
```

Then connect to the endpoint at port `:3000` using a websocket and issue websocket messages.

## Developers

> wondering what all the package.json command do?

- `build-ts` builds typescript files
- `watch-ts` watches and builds typescript files
- `dev` watches files and runs index.ts using `ts-node`
- `test` runs the tests that don't currently exist
- `pkg` build a binary for linux and macos
- `docker-build` builds a docker container from the `pkg` binaries
- `docker-push` pushes the previously built docker container
- `deploy` does `build + pkg + docker-build + docker-push`


## TODO

- [ ] needs better input validation before being exposed to the wild
- [ ] redis pubsub for websockets instead of in-memory
  - [ ] or perhaps even use the new postgres pubsub features
