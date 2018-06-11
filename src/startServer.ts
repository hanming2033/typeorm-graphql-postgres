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

  // read all folders in modules folder into an array
  const folders = fs.readdirSync(path.join(__dirname, './modules'))

  // loop through each folder, get the resolvers and schema.graphql and make it a schema array
  folders.forEach(folder => {
    const { resolvers } = require(`./modules/${folder}/resolvers`)
    const typeDefs = importSchema(path.join(__dirname, `./modules/${folder}/schema.graphql`))
    schemas.push(makeExecutableSchema({ resolvers, typeDefs }))
  })

  // create redis instance
  const redis = new Redis()

  // create the graphql server by merging all the schemas
  const server = new GraphQLServer({ schema: mergeSchemas({ schemas }), context: ({request}) => ({ redis,url: `${request.protocol}://${request.get('host')}` }) })

  server.express.get('confirm/:id', async (req, res) => {
    const { id } = req.params
    const userId = await redis.get(id)
    await User.update({ id: userId }, { confirmed: true })
    res.send('ok')
  })

  // createConnection will sync our schema to the database
  // because "synchronize": true in ormconfig
  await createTypeOrmConn()
  // passing 0 into port is for testing
  const app = await server.start({
    // 4001 is test port
    port: process.env.NODE_ENV === 'test' ? 4001 : 4000
  })
  console.log('Server is running on localhost:4000')
  return app
}

// !! pro tip - if there is a function call in a file and this file is imported by another
// !! it will by default run the function call on import
// !! startServer()
