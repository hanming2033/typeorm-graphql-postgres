import { GraphQLServer } from 'graphql-yoga'
import { resolvers } from './resolvers'
import { createTypeOrmConn } from './utils/createTypeOrmConn'

// export the function so Jest can test it
export const startServer = async () => {
  const server = new GraphQLServer({ typeDefs: 'src/schema.graphql', resolvers })
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
