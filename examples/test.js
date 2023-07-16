const { NodeSDK } = require('@opentelemetry/sdk-node')
const { randomUUID } = require('crypto')
const { trace } = require('@opentelemetry/api')
const { ConsolePrettySpanProcessor } = require('../index')

const sdk = new NodeSDK({
  spanProcessor: new ConsolePrettySpanProcessor(),
})

sdk.start()


const tracer = trace.getTracer('my-lib')
const span = tracer.startSpan('foo', {
  attributes: {
    'app.bool': true,
    'app.string': 'Some string',
    'app.number': 123,
    'app.array': [1, 2, 3],
  }
})

span.recordException(new Error('Something went wrong'))

span.end()

for (let i = 0; i < 10; i++) {
  tracer.startSpan('GET /whoami', {
    attributes: {
      'app.tenant_id': randomUUID(),
      'app.user_id': randomUUID(),
      'app.cache_hit': true,
      'http.route': '/whoami',
      'http.method': 'GET',
      'http.status_code': 200,
      'http.url': 'https://example.com/whoami',
      'http.host': 'example.com',
      'http.user_agent': 'curl/7.64.1',
      'http.request_content_length': 0,
      'http.response_content_length': 310,
      'http.flavor': '1.1',
    }
  }).end(Date.now() + 16)
}

sdk.shutdown()
