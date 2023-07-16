const util = require('util');
const { SpanStatusCode } = require('@opentelemetry/api');

/**
  * @implements {import('@opentelemetry/api').SpanProcessor}
  */
class PrettyConsoleProcessor {
  shutdown() {
    return Promise.resolve();
  }
  /**
   * Forces to export all finished spans
   */
  forceFlush() {
    return Promise.resolve();
  }
  /**
   * Called when a {@link Span} is started, if the `span.isRecording()`
   * returns true.
   * @param span the Span that just started.
   */
  onStart() { }
  /**
   * Called when a {@link ReadableSpan} is ended, if the `span.isRecording()`
   * returns true.
   * @param {import('@opentelemetry/sdk-trace-base').ReadableSpan} span the Span that just ended.
   */
  onEnd(span) {
    logSpan(span);
    for (const event of span.events) {
      logEvent(event);
    }
  }
}

module.exports = { ConsolePrettySpanProcessor }

const colors = {
  Text: "\x1b[38;5;0253m",
  SecondaryText: "\x1b[38;5;0246m",
  TertiaryText: "\x1b[38;5;0242m",
  Invalid: "\x1b[33;1m",
  Null: "\x1b[38;5;0038m",
  Name: "\x1b[38;5;0081m",
  String: "\x1b[38;5;0216m",
  Number: "\x1b[38;5;151m",
  Boolean: "\x1b[38;5;0038m",
  Scalar: "\x1b[38;5;0079m",
  LevelVerbose: "\x1b[37m",
  LevelDebug: "\x1b[37m",
  LevelInformation: "\x1b[37;1m",
  LevelWarning: "\x1b[38;5;0229m",
  LevelError: "\x1b[38;5;0197m\x1b[48;5;0238m",
  LevelFatal: "\x1b[38;5;0197m\x1b[48;5;0238m"
}

const close = "\x1b[0m"

const chalk = Object.fromEntries(Object.entries(colors).map(([key, value]) => [key, (str) => `${value}${str}${close}`]))

function renderValue(value) {
  switch (typeof value) {
    case 'string': return chalk.String(util.inspect(value))
    case 'number': return chalk.Number(util.inspect(value))
    case 'boolean': return chalk.Boolean(value ? 'True' : 'False')
    case 'object':
      if (value == null) {
        valueString = chalk.Null(String(value))
      } else if (Array.isArray(value)) {
        return chalk.SecondaryText('[') + value.map(renderValue).join(chalk.TertiaryText(', ')) + chalk.SecondaryText(']')
      } else {
        return renderAttributes(value)
      }
  }

  return chalk.Invalid(valueString)
}


function renderAttributes(attributes) {
  const keys = Object.keys(attributes)
  let logStr = ''
  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    logStr += `${chalk.Name(key)}${chalk.TertiaryText('=')}${renderValue(attributes[key])}`
    if (i !== keys.length - 1) logStr += chalk.TertiaryText(', ')
  }

  return `${chalk.TertiaryText('{')}${logStr}${chalk.TertiaryText('}')}`
}


/**
  * @param {import('@opentelemetry/sdk-trace-base').ReadableSpan} span
  */
function logSpan(span) {
  const duration_ms = span.duration[0] * 1000 + span.duration[1] / 1000000;
  const startTime = new Date(
    span.startTime[0] * 1000 + Math.round(span.startTime[1] / 1000000),
  ).toISOString()
  const level = span.status.code === SpanStatusCode.ERROR ? chalk.LevelError('ERR') : chalk.SecondaryText('INF');
  console.log(`[${chalk.SecondaryText(startTime)} ${level}] ${chalk.Text(span.name)} (${chalk.Number(duration_ms)}${chalk.Text('ms')}) ${renderAttributes(span.attributes)}`);
}


/**
  * @param {import('@opentelemetry/sdk-trace-base').TimedEvent} event 
  */
function logEvent(event) {
  const startTime = new Date(
    event.time[0] * 1000 + Math.round(event.time[1] / 1000000),
  ).toISOString()

  if ('exception.type' in event.attributes) {
    console.log(`[${chalk.SecondaryText(startTime)} ${chalk.LevelError('ERR')}] ${chalk.LevelError(event.attributes['exception.stacktrace'])}`)
    return
  }
  const level = chalk.SecondaryText('INF');
  console.log(`[${chalk.SecondaryText(startTime)} ${level}] ${chalk.Text(span.name)} ${renderAttributes(event.attributes)}`)
}
