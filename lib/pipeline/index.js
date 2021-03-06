import {
  assign,
  invoke,
  reply
} from './actions'

export default (service) => {
  const actions = getActions(service.pipeline)
  return async (request, reply) => {
    try {
      const ctx = buildContext(request, reply, service)
      for(let i in actions) {
        await actions[i](ctx)
      }
      console.log(ctx.variables)
    } catch (err) {
      console.error(err)
      reply(JSON.stringify(err))
    }
  }
}

function buildContext (request, reply, service) {
  return {
    variables: {
      req: {
        query: request.url.query,
        payload: request.payload
      },
    },
    res: reply,
    serviceDir: service.dir
  }
}

function getActions (pipeline) {
  const actions = []
  for (const prop in pipeline) {
    if (pipeline.hasOwnProperty(prop)) {
      actions.push(createAction(prop, pipeline[prop]))
    }
  }
  return actions
}

function createAction (type, action) {
  if (type.startsWith('invoke')) {
    return invoke(action)
  } else if (type.startsWith('assign')) {
    return assign(action)
  } else if (type === 'reply') {
    return reply(action)
  }
}
