export default function pm3 (config, ts, data, opts) {
  if (!window.Worker) // {{{1
  {
    console.log('This browser doesn\'t support web workers.')
    return;
  }

  // Select base-quote asset pair {{{1
  let pairs = document.getElementById('pairs')
  let cogs = document.getElementById('cogs')
  let msgCount = 0 // TODO Developer Tools -> Network: Disable Cache
  let intersection = null, index = 0
  for (let exchange of config.exchanges) {
    exchange.index = index++
    exchange.worker = new Worker(exchange.name + '.js')
    exchange.worker.onmessage = e => {
      colorX(exchange)
      intersectionUpdate(e.data)
      if (++msgCount == config.exchanges.length) {
        intersection.sort((a, b) => a.pair > b.pair)
        showPairSelectionUI()
      }
    }
  }

  let plot, historyEdge, freezing = false, freeze = false
  let commandWindows = []

  function colorX (x) // {{{1
  {
    let head = document.createElement('span')
    head.style.color = x.colors[0]
    head.style.fontWeight = 'bold'
    head.textContent = x.name
    if (intersection == null) {
      pairs.firstChild.data = ''
    } else {
      let u = document.createElement('span')
      u.textContent = ' ∩ '
      pairs.insertBefore(u, cogs)
    }
    pairs.insertBefore(head, cogs)
  }

  function showPairSelectionUI () // {{{1
  {
    cogs.hidden = true
    let tail = document.createElement('span')
    tail.textContent = ' base-quote asset pairs:'
    pairs.insertBefore(tail, cogs)
    let pair  = document.getElementById('pair')
    let base  = document.getElementById('base')
    let quote = document.getElementById('quote')
    for (let p of intersection) {
      let d = p.pair.indexOf('-'), b = p.pair.slice(0, d), q = p.pair.slice(d + 1)
      if (!found(base, o => o.text == b)) {
        let bo = document.createElement("option")
        bo.value = bo.text = b; base.add(bo)
      }
      if (!found(quote, o => o.text == q)) {
        let qo = document.createElement("option")
        qo.value = qo.text = q; quote.add(qo)
      }
    }
    for (let o of base) {
      o.onclick = baseSelected
    }
    for (let o of quote) {
      o.onclick = quoteSelected
    }

    function quoteSelected (e) // {{{2
    {
      let b = pairCheck(base, (b, q, v) => b == v && q == e.target.value, e)
      if (b > 0) {
        base.disabled = quote.disabled = true
        plotInit(base[b].value, e.target.value)
      }
    }

    function pairCheck (counterpart, cb, e) // {{{2
    {
      if (e.target.value.length == 0) {
        for (let o of e.target.parentElement) {
          o.disabled = false
        }
        for (let o of counterpart) {
          o.disabled = false
        }
        counterpart.selectedIndex = 0
        return 0;
      }
      if (counterpart.selectedIndex > 0) {
        return counterpart.selectedIndex;
      }
      for (let o of counterpart) {
        if (!intersection.find(p => {
          let separator = p.pair.indexOf('-'),
            base  = p.pair.slice(0, separator),
            quote = p.pair.slice(1 + separator)
          return cb(base, quote, o.value);
        })) {
          if (o.value.length > 0) {
            o.disabled = true
          }
        }
      }
      return 0;
    }

    function baseSelected (e) // {{{2
    {
      let q = pairCheck(quote, (b, q, v) => q == v && b == e.target.value, e)
      if (q > 0) {
        base.disabled = quote.disabled = true
        plotInit(e.target.value, quote[q].value)
      }
    } // }}}2

    pair.hidden = false
  }

  function found (c, p) // {{{1
  {
    for (const item of c) {
      if (p(item)) {
        return true
      }
    }
    return false;
  }

  function intersectionUpdate (pairs) // {{{1
  {
    if (intersection == null) {
      intersection = pairs
      return;
    }
    intersection = intersection.filter(p => pairs.find(q => p.pair == q.pair))
  }
  
  function plotUpdate () // {{{1
  {
    const now   = Date.now()
    const scale = {min: now - config.timeFrameMs, max: now}
    historyEdge = scale.min

    plot.setData(data)
    plot.setScale('x', scale)

    if (!freeze) {
      requestAnimationFrame(plotUpdate)
    } else {
      console.log('😅', 'frozen')
    }
  }

  function plotAddData (m) // {{{1
  {
    if (m.data == null) {
      if (!freezing) {
        freezing = true
        console.log('😅', 'freezing...')
        setTimeout(() => { freeze = true }, config.rateLimitMs)
      }
      return;
    }
    ts.obAdd(data, m.data, historyEdge)
    for (const cw of commandWindows) {
      cw.postMessage(m.data, '*') // FIXME
    }
  }

  function plotInit (base, quote) // {{{1
  {
    plot = new uPlot(opts, data, document.getElementById('plot'))

    for (const command of config.commands) {
      commandWindows.push(command.init(command))
    }
    for (let exchange of config.exchanges) {
      exchange.worker.onmessage = plotAddData
      exchange.worker.postMessage([base, quote, exchange.index])
    }
    plotUpdate()
  } // }}}1

}
