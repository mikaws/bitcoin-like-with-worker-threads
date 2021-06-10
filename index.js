const { payloads } = require('./payloads.json')
const { crypto } = require('crypto')
const { Worker, isMainThread, parentPort } = require('worker_threads')

const LEADING_ZEROES = 4
const final = []
let finishedWorkers = 0

if(isMainThread){
  for(let payload of payloads){
    const worker = new Worker(__filename, {env: { LEADING_ZEROES } })
      worker.once('message', (message) => {
        final.push(message)
        finishedWorkers++
        if(finishedWorkers === payloads.length) console.log(final)
      })
      worker.on('error', console.error)

      console.log(`Iniciando worker de ID ${worker.threadId} e enviando o payload "${payload}"`)
  }
} else {
  parentPort.once('message', (message) => {
    const payload = message
    let nonce = 0
    let generatedHash = ''

    do {
      generatedHash = crypto.createHash('sha256').update(payload + nonce).digest('hex')
      nonce++
    } while (generatedHash.slice(0, process.env.LEADING_ZEROES) !== '0'.repeat(process.env.LEADING_ZEROES))

    parentPort.postMessage({ payload: message, nonce, hash: generatedHash})
  })
}