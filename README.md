> ## 🛠 Status: In Development
> paperboy is currently in development. If you'd like to play around with it, check out the usage instructions below.

# 📰 Paperboy

> Paperboy is a replacement for web3's subscriptions/filters. It uses the output of @xlnt/gnarly-reducer-events which means it's highly reliable, resilient to downtime, single-delivery (best effort), etc.

**Basically, it'll solve your event watching problems.**

## Usage

To use paperboy, first start a [gnarly](https://github.com/XLNT/gnarly) instance that's configured with the **@xlnt/gnarly-reducer-events** reducer. Then simply point paperboy at the output of this reducer and have yourself a good time.

🛠 Better docs are incoming, as well as a docker container, etc.

But until then, you can play around with paperboy by

```bash
# install deps
yarn install

# optionally use default environment variables
cp .env.example .env

# run the app
yarn run ts-start
```

Then connect to the endpoint at port `:3000` using a websocket and issue a filter request.

Request -->

```json
{
    "path": "/filter",
    "args": {
        "addresses": [ "0x06012c8cf97bead5deae237070f9587f8e7a266d" ],
        "fromBlock": "4606121",
        "args": {
            "to": [ "0xba52c75764d6F594735dc735Be7F1830CDf58dDf" ]
        }
    }
}
```

Response <--

```json
{"type":"filter_id","data":"1a976e0b-4586-4282-ade1-17c7c52cdd74"}

{
    "type": "match",
    "data": {
        "uuid": "2df459ce-a8c3-48a2-b875-3f8bb7f6503e",
        "address": "0x06012c8cf97bead5deae237070f9587f8e7a266d",
        "event": "Transfer(address,address,uint256)",
        "eventName": "Transfer",
        "signature": "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef",
        "args": {
            "0": "0x0000000000000000000000000000000000000000",
            "1": "0xba52c75764d6F594735dc735Be7F1830CDf58dDf",
            "2": "1007",
            "to": "0xba52c75764d6F594735dc735Be7F1830CDf58dDf",
            "from": "0x0000000000000000000000000000000000000000",
            "tokenId": "1007",
            "__length__":3
        },
        "createdAt": "2018-05-24T06:43:16.375Z",
        "patchId": "c576c8ed-09c4-4faa-adfb-047634b997ed"
    }
}
```
