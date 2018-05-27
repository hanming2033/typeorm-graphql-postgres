import * as bycrypt from 'bcryptjs'
import { User } from './entity/User'
interface ResolverMap {
  [key: string]: {
    [key: string]: (parent: any, args: any, context: {}, info: any) => any
  }
}

export const resolvers: ResolverMap = {
  Query: {
    hello: (_, args: GQL.IHelloOnQueryArguments) => `Hi ${args.name || 'World'}`
  },
  Mutation: {
    register: async (_, args: GQL.IRegisterOnMutationArguments) => {
      // store the password that the user entered as a hash
      const hashedPassword = await bycrypt.hash(args.password, 10)
      // User.create simply creates an object
      const user = await User.create({
        email: args.email,
        password: hashedPassword
      })
      // ! object.save then is the actual saving to DB
      await user.save()
      // TODO: conditional return true or false
      // TODO: confirmation email
      // TODO: no duplicate email
      return true
    }
  }
}
