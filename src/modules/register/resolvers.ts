import * as bcrypt from 'bcryptjs'
import * as yup from 'yup'
import { User } from '../../entity/User'
import { IResolverMap } from '../../types/graphql-utils'
import { formatYupError } from '../../utils/formatYupError'
import { EMAIL_DUPLICATE, EMAIL_TOO_SHORT } from './errorMessages'
import { createConfirmEmailLink } from '../../utils/createConfirmEmailLink'

// *schema for email pattern validation using yup
const schema = yup.object().shape({
  email: yup
    .string()
    .min(3, EMAIL_TOO_SHORT)
    .max(255)
    .email(),
  password: yup
    .string()
    .min(3)
    .max(255)
})

export const resolvers: IResolverMap = {
  Query: {
    bye: () => 'bye'
  },
  Mutation: {
    register: async (_, args: GQL.IRegisterOnMutationArguments, { redis, url }) => {
      try {
        await schema.validate(args, { abortEarly: false })
      } catch (error) {
        return formatYupError(error)
      }

      const { email, password } = args

      // *Check user exist
      // check if user already exist
      const userAlreadyExist = await User.findOne({ where: { email }, select: ['id'] })
      // return error object if user taken
      if (userAlreadyExist) return [{ path: 'email', message: EMAIL_DUPLICATE }]

      // *process user creation after checking
      // store the password that the user entered as a hash
      const hashedPassword = await bcrypt.hash(password, 10)
      // User.create simply creates an object
      const user = User.create({
        email,
        password: hashedPassword
      })
      // save user to database
      await user.save()

      // generate a link for confirmation.
      // custom function: takes the url of the site http://my-site.com, user id in db and redis client
      const link = await createConfirmEmailLink(url, user.id, redis)

      return null
    }
  }
}
