const { NodeSDK } = require('@opentelemetry/sdk-node')
const { trace } = require('@opentelemetry/api')
const { ConsolePrettySpanProcessor } = require('../index')

const sdk = new NodeSDK({
  spanProcessor: new ConsolePrettySpanProcessor(),
})

sdk.start()


const span = trace.getTracer('my-lib').startSpan('foo', {
  attributes: {
    'app.bool': true,
    'app.string': 'Some string',
    'app.number': 123,
    'app.array': [1, 2, 3],
  }
})

span.recordException(new Error('Something went wrong'))

span.end()

sdk.shutdown()
