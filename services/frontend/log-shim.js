function formatValue(value) {
  if (value instanceof Error) {
    return JSON.stringify({
      name: value.name,
      message: value.message,
      stack: value.stack,
    })
  }

  if (typeof value === 'string') {
    return value
  }

  try {
    return JSON.stringify(value)
  } catch (_err) {
    return String(value)
  }
}

function patchConsoleMethod(methodName) {
  const original = console[methodName]

  console[methodName] = (...args) => {
    const line = args.map(formatValue).join(' ')
    original.call(console, line)
  }
}

patchConsoleMethod('log')
patchConsoleMethod('info')
patchConsoleMethod('warn')
patchConsoleMethod('error')
