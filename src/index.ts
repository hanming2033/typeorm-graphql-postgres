import 'reflect-metadata'
import { GraphQLServer } from 'graphql-yoga'
import { resolvers } from './resolvers'
import { createConnection } from 'typeorm'

const server = new GraphQLServer({ typeDefs: 'src/schema.graphql', resolvers })

// createConnection will sync our schema to the database
// because "synchronize": true in ormconfig
createConnection().then(() => {
  server.start(() => console.log('Server is running on localhost:4000'))
})

// TODO:https://www.youtube.com/watch?v=XyqV-kE08Yo
