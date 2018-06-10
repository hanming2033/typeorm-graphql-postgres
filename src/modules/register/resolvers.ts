import * as bcrypt from 'bcryptjs'
import { User } from '../../entity/User'
import { IResolverMap } from '../../types/graphql-utils'

export const resolvers: IResolverMap = {
  Query: {
    bye: () => 'bye'
  },
  Mutation: {
    register: async (_, { email, password }: GQL.IRegisterOnMutationArguments) => {
      // check if user already exist
      const userAlreadyExist = await User.findOne({ where: { email }, select: ['id'] })
      // return error object if user taken
      if (userAlreadyExist) return [{ path: 'email', message: 'already taken' }]

      // store the password that the user entered as a hash
      const hashedPassword = await bcrypt.hash(password, 10)
      // User.create simply creates an object
      const user = User.create({
        email,
        password: hashedPassword
      })
      // TODO: confirmation email
      await user.save()
      return null
    }
  }
}
