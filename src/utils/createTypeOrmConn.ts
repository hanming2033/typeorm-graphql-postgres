import { getConnectionOptions, createConnection } from 'typeorm'

export const createTypeOrmConn = async () => {
  // this sets the type of connection to create
  // type of connection is specified in .env or package.json set NODE_ENV=test&& ...
  // actual details of each connection type is specified in ormconfig
  const connectionOptions = await getConnectionOptions(process.env.NODE_ENV)
  // workaround typeorm uses default when making queries
  return createConnection({ ...connectionOptions, name: 'default' })
}
