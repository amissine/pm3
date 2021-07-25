class TimeSeries // {{{1
{
  constructor (xCount, obDepth) // {{{2
  {
    this.xCount  = xCount
    this.obDepth = obDepth
    this.xIndex = []
    for (let i = 0; i < xCount; i++) {
      this.xIndex.push(1 + i * 4 * obDepth) // asks and bids, price/amount
    }
    this.total = xCount * 4 * obDepth + 1
    this.timestamp = 0
  }
  _ts (count) // {{{2
  {
    let a = [ [] ]
    for (let i = 0; i < count; i++) {
      a.push([])
    }
    return a;
  }
  pane () // {{{2
  {
    return {
      width: window.innerWidth - 20,
      height: window.innerHeight  - 100,
    };
  }
  get ob() // {{{2
  {
    return this._ts(this.xCount * 4 * this.obDepth); // asks and bids, price/amount
  }
  obAdd(a, item, he) // {{{2
  {
    let xIndex = item[0], bids = item[1], asks = item[2], timestamp = item[3]
    item.push(this.timestamp) // to use when assert fails
    console.assert(
      timestamp >= this.timestamp &&
      bids.length == this.obDepth && asks.length == this.obDepth, item)
    this.timestamp = timestamp

    // Order Book Item arrival time
    let size = a[0].push(timestamp)

    // Add item data
    let xo = this.xIndex[xIndex]
    for (let i = 0; i < asks.length; i++) {
      a[xo++].push(+asks[asks.length - 1 - i][0]) // price
      a[xo++].push(-asks[asks.length - 1 - i][1]) // amount < 0
    }
    for (let i = 0; i < bids.length; i++) {
      a[xo++].push(+bids[i][0]) // price
      a[xo++].push(+bids[i][1]) // amount > 0
    }
  
    // Add nulls
    for (let i = 1; i < this.total; i++) {
      if (a[i].length < size) {
        a[i].push(null)
      }
    }
  
    // Shift out the old data beyond history edge
    while (a[0].length > 1 && he > a[0][0]) {
      for (let i = 0; i < this.total; i++) {
        a[i].shift()
      }
    }
  } // }}}2
}

// This configuration, combined with config values in binance.js, bitfinex.js, {{{1
// and coinbase.js, feeds and plots order books of depth 5 each 2500 ms. The data 
// visibility duration (the time frame) is 120000 ms.
export const config = // {{{1
{
  timeFrameMs: 120000,
  exchanges: [
    { name: 'binance', // {{{2
      colors: ['#008000', '#98FB9880'], // green, palegreen
// see also https://css-tricks.com/snippets/css/named-colors-and-hex-equivalents/
    },
    { name: 'bitfinex', // {{{2
      colors: ['#0000FF', '#6495ED80'], // blue, cornflowerblue
    },
    { name: 'coinbase', // {{{2
      colors: ['#800080', '#EEE8AA80'], // purple, palegoldenrod
    } // }}}2
  ],
  orderBookDepth: 5,
  rateLimitMs: 2500, // TODO correlate with workers
  commands: [
    {
      name: 'arbitrage',
      init: c => {
        console.log('- init', c.name)
        let width = 400, height = 200,
          left = window.innerWidth - width + 25, top = 40
        let windowObjectReference = window.open(
          'http://localhost:5001', '_blank',
          `width=${width},height=${height},left=${left},top=${top}`)
      },
    },
  ],
}

export let ts2plot = new TimeSeries(config.exchanges.length, config.orderBookDepth)
export let data2plot = ts2plot.ob

export const opts = // {{{1
{
  title: 'Order Books',
  ...ts2plot.pane(),
  ms: 1,
  plugins: [labelPlugin(), obPlugin()],
  scales: { x: {}, amount: {} },
  axes: [
    {}, // x, time
    {}, // y, price
    {   // amount
      side: 1, scale: 'amount', grid: { show: false }
    }
  ],
  series: [ // {{{2
    { label: 'time', value: (u, v) => v },
    { label: 'X0 asks price 5', value: (u, v) => v }, // {{{3
    { label: 'X0 asks amount 5', scale: 'amount' },
    { label: 'X0 asks price 4', value: (u, v) => v },
    { label: 'X0 asks amount 4', scale: 'amount' },
    { label: 'X0 asks price 3', value: (u, v) => v },
    { label: 'X0 asks amount 3', scale: 'amount' },
    { label: 'X0 asks price 2', value: (u, v) => v },
    { label: 'X0 asks amount 2', scale: 'amount' },
    { label: 'X0 asks price 1', value: (u, v) => v },
    { label: 'X0 asks amount 1', scale: 'amount' },
    { label: 'X0 bids price 1', value: (u, v) => v },
    { label: 'X0 bids amount 1', scale: 'amount' },
    { label: 'X0 bids price 2', value: (u, v) => v },
    { label: 'X0 bids amount 2', scale: 'amount' },
    { label: 'X0 bids price 3', value: (u, v) => v },
    { label: 'X0 bids amount 3', scale: 'amount' },
    { label: 'X0 bids price 4', value: (u, v) => v },
    { label: 'X0 bids amount 4', scale: 'amount' },
    { label: 'X0 bids price 5', value: (u, v) => v },
    { label: 'X0 bids amount 5', scale: 'amount' },
    { label: 'X1 asks price 5', value: (u, v) => v }, // {{{3
    { label: 'X1 asks amount 5', scale: 'amount' },
    { label: 'X1 asks price 4', value: (u, v) => v },
    { label: 'X1 asks amount 4', scale: 'amount' },
    { label: 'X1 asks price 3', value: (u, v) => v },
    { label: 'X1 asks amount 3', scale: 'amount' },
    { label: 'X1 asks price 2', value: (u, v) => v },
    { label: 'X1 asks amount 2', scale: 'amount' },
    { label: 'X1 asks price 1', value: (u, v) => v },
    { label: 'X1 asks amount 1', scale: 'amount' },
    { label: 'X1 bids price 1', value: (u, v) => v },
    { label: 'X1 bids amount 1', scale: 'amount' },
    { label: 'X1 bids price 2', value: (u, v) => v },
    { label: 'X1 bids amount 2', scale: 'amount' },
    { label: 'X1 bids price 3', value: (u, v) => v },
    { label: 'X1 bids amount 3', scale: 'amount' },
    { label: 'X1 bids price 4', value: (u, v) => v },
    { label: 'X1 bids amount 4', scale: 'amount' },
    { label: 'X1 bids price 5', value: (u, v) => v },
    { label: 'X1 bids amount 5', scale: 'amount' },
    { label: 'X2 asks price 5', value: (u, v) => v }, // {{{3
    { label: 'X2 asks amount 5', scale: 'amount' },
    { label: 'X2 asks price 4', value: (u, v) => v },
    { label: 'X2 asks amount 4', scale: 'amount' },
    { label: 'X2 asks price 3', value: (u, v) => v },
    { label: 'X2 asks amount 3', scale: 'amount' },
    { label: 'X2 asks price 2', value: (u, v) => v },
    { label: 'X2 asks amount 2', scale: 'amount' },
    { label: 'X2 asks price 1', value: (u, v) => v },
    { label: 'X2 asks amount 1', scale: 'amount' },
    { label: 'X2 bids price 1', value: (u, v) => v },
    { label: 'X2 bids amount 1', scale: 'amount' },
    { label: 'X2 bids price 2', value: (u, v) => v },
    { label: 'X2 bids amount 2', scale: 'amount' },
    { label: 'X2 bids price 3', value: (u, v) => v },
    { label: 'X2 bids amount 3', scale: 'amount' },
    { label: 'X2 bids price 4', value: (u, v) => v },
    { label: 'X2 bids amount 4', scale: 'amount' },
    { label: 'X2 bids price 5', value: (u, v) => v },
    { label: 'X2 bids amount 5', scale: 'amount' }, // }}}3
  ] // }}}2
}

function obPlugin () // {{{1
{
  function obDraw (u) // {{{2
  {
    if (u.data[0].length == 0) {
      return;
    }
    u.ctx.save()
    let [iMin, iMax] = u.series[0].idxs, timeP = 0
    for (let i = iMin; i < iMax; i++) {
      let xoP = 0, time = u.data[0][i]
      for (let xi = 0; xi < ts2plot.xIndex.length; xi++) {
        let xo = ts2plot.xIndex[xi]
        if (u.data[xo][i] != null) {
          obDrawPricesAmounts(u, xi, xo, i, xoP != xo && time < timeP + 1500)
          xoP = xo; timeP = time
        }
      }
    }
    u.ctx.restore()
  }

  function obDrawPricesAmounts (u, xi, xo, i, mirror) // {{{2
  {
    let tX  = u.valToPos(u.data[0][i], 'x', true)
    let prices = [], amounts = [], xoLimit = xo + ts2plot.obDepth * 4
    while (xo < xoLimit) {
      prices.push(u.valToPos(u.data[xo++][i], 'y', true))
      amounts.push(u.valToPos(u.data[xo++][i], 'amount', true))
    }
    u.ctx.strokeStyle = config.exchanges[xi].colors[0] // price color
    for (let price of prices) {
      u.ctx.beginPath()
      u.ctx.moveTo(tX, price)
      u.ctx.lineTo(tX + 6, price)
      u.ctx.stroke()
    }
    let minAsks = prices[ts2plot.obDepth - 1], maxBids = prices[ts2plot.obDepth]
    u.ctx.beginPath()
    if (mirror) {
      u.ctx.moveTo(tX + 6, minAsks)
      u.ctx.lineTo(tX + 6, maxBids)
    } else {
      u.ctx.moveTo(tX, minAsks)
      u.ctx.lineTo(tX, maxBids)
    }
    u.ctx.stroke()

    u.ctx.strokeStyle = config.exchanges[xi].colors[1] // amount color
    for (let k = 0; k < ts2plot.obDepth; k++) {
      let amountAsks = amounts[k], amountBids = amounts[2 * ts2plot.obDepth - 1 - k]
      u.ctx.beginPath()
      u.ctx.moveTo(tX + 10 + 6 * k, amountAsks)
      u.ctx.lineTo(tX + 10 + 6 * k, amountBids)
      u.ctx.stroke()
    }
  } // }}}2

  return {
    hooks: { draw: obDraw }
  };
}

function labelPlugin () // {{{1
{
  let legendEl

  function init (u, opts) {
    legendEl = u.root.querySelector('.u-legend')
    legendEl.classList.remove('u-inline')
    uPlot.assign(legendEl.style, { display: 'none' })
  }

  function update (u) {
  }

  return {
    hooks: {
      init: init,
      setCursor: update
    }
  };
}
