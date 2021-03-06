const log = document.querySelector('.event-log')
let xhr = new XMLHttpRequest()
const url = 'https://api.pro.coinbase.com/products/XLM-USD/trades'
let before = '', count = 0, requestInProgress = false

let feed = setInterval(feedReq, 2500)

xhr.addEventListener('load', feedResp)

function feedReq () { // {{{1
  if (requestInProgress) {
    log.textContent = '- REQUEST IN PROGRESS\n'+log.textContent
  } else {
    let suffix = before == '' ? '' : '?before='+before
    xhr.open('GET', url+suffix)
    xhr.responseType = 'json'
    xhr.send()
  }
  if (++count > 99) {
    clearInterval(feed); feed = null
    if (requestInProgress) {
      document.write("That's all, folks!.. 😅")
    }
  }
  requestInProgress = true
}

function feedResp () { // {{{1
  requestInProgress = false
  consumeTrades(this.response)
  if (feed == null) {
    log.textContent = "That's all, folks!.. 😅\n"+log.textContent
    freeze = true
    return;
  }
  let cbbefore = this.getResponseHeader('cb-before')
  if (cbbefore != null) {
    before = cbbefore
  }
}

const toUMF = [ // {{{1
  jsonArray => console.log(jsonArray),
  jsonArray => console.log(jsonArray),
  jsonArray => { // {{{2
    let umf = []
    while (jsonArray.length > 0) {
      let trade    = jsonArray.pop()
      trade.price  = +trade.price
      trade.amount = trade.side == 'buy' ? +trade.size : -trade.size
      trade.time   = new Date(trade.time).getTime() // ms, UTC
      delete trade.side
      delete trade.size
      delete trade.trade_id
      umf.push(trade) // latest last
    }
    return umf;
  }, // }}}2
]

function consumeTrades (jsonArray) { // latest first, if any {{{1
  let l = jsonArray.length
  if (l > 0) {
    log.textContent = 'XLM-USD coinbase latest price '+jsonArray[0].price+
      ', '+l+' trades since '+jsonArray[l-1].time+'\n'+log.textContent
    sendTradesXLM(2, toUMF[2](jsonArray)) // TODO worker thread
  }
}

function sendTradesXLM (exchangeIdx, umf) { // {{{1
  recvTradesXLM(exchangeIdx, umf) // TODO send data to the UI channel
}
