import * as fs from 'fs'
import { importSchema } from 'graphql-import'
import { GraphQLServer } from 'graphql-yoga'
import * as path from 'path'
import { createTypeOrmConn } from './utils/createTypeOrmConn'
import { mergeSchemas, makeExecutableSchema } from 'graphql-tools'
import { GraphQLSchema } from 'graphql'
import * as Redis from 'ioredis'
import { User } from './entity/User'

// export the function so Jest can test it
export const startServer = async () => {
  // create a holder to keep all the schemas
  const schemas: GraphQLSchema[] = []

  // *create schemas from modules folder
  // read all folders in modules folder into an array
  const folders = fs.readdirSync(path.join(__dirname, './modules'))
  // loop through each folder, get the resolvers and schema.graphql and make it a schema array
  folders.forEach(folder => {
    const { resolvers } = require(`./modules/${folder}/resolvers`)
    const typeDefs = importSchema(path.join(__dirname, `./modules/${folder}/schema.graphql`))
    schemas.push(makeExecutableSchema({ resolvers, typeDefs }))
  })

  // *create the graphql server by merging all the schemas
  // when server is started, also connects to redis instance
  const redis = new Redis()
  const server = new GraphQLServer({
    // merged schema
    schema: mergeSchemas({ schemas }),
    // whatever in injected into context can be used in resolvers
    // url from the server
    context: ({ request }) => ({ redis, url: `${request.protocol}://${request.get('host')}` })
  })

  // *create a REST api for email confirmation
  // when user click on the confirmation link. trigger this get request
  server.express.get('confirm/:id', async (req, res) => {
    // get the id from the url
    const { id } = req.params
    // get userId using redis, because the id and userId is mapped in createConfirmationEmailLink.ts
    const userId = await redis.get(id)
    // update db through typeOrm
    if (!userId) return res.send('invalid link')
    await User.update({ id: userId }, { confirmed: true })
    res.send('ok')
  })

  // *create a connection to database through typeOrm
  // createConnection will sync our schema to the database
  // because "synchronize": true in ormconfig
  await createTypeOrmConn()

  // *start the server with different Env variables
  const app = await server.start({
    // 4001 is test port
    port: process.env.NODE_ENV === 'test' ? 4001 : 4000
  })
  console.log('Server is running on localhost:4000')
  return app
}
// TODO: https://www.youtube.com/watch?v=7XUFVQh6XAQ&t=197s start

// !! pro tip - if there is a function call in a file and this file is imported by another
// !! it will by default run the function call on import
// !! startServer()
