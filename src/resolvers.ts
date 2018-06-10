import * as bcrypt from 'bcryptjs'
import { User } from './entity/User'
interface ResolverMap {
  [key: string]: {
    [key: string]: (parent: any, args: any, context: {}, info: any) => any
  }
}

export const resolvers: ResolverMap = {
  Query: {
    hello: (_, { name }: GQL.IHelloOnQueryArguments) => `Bye ${name || 'World'}`
  },
  Mutation: {
    register: async (_, { email, password }: GQL.IRegisterOnMutationArguments) => {
      // store the password that the user entered as a hash
      const hashedPassword = await bcrypt.hash(password, 10)
      // User.create simply creates an object
      const user = User.create({
        email,
        password: hashedPassword
      })
      // TODO: conditional return true or false
      // TODO: confirmation email
      // TODO: no duplicate email
      await user.save()
      return true
    }
  }
}
