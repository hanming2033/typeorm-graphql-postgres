import { request } from 'graphql-request'
import { User } from '../../entity/User'
import { startServer } from '../../startServer'

let host = ''

// before all is a Jest command which means that it will
// do whatever that is inside the call back before any test
beforeAll(async () => {
  await startServer()
  host = `http://localhost:4001`
})

const email = 'tom@gmail.com'
const password = 'asdf'

const mutation = `
mutation {
  register(email: "${email}", password: "${password}") {
    path
    message
  }
}
`

// this test requires the server to start and run in the background
test('Register User', async () => {
  // send register mutation
  const response1 = await request(host, mutation)
  // check if register null ==> successful
  expect(response1).toEqual({ register: null })
  // try to find all users with the email
  const users = await User.find({ where: { email } })
  // check if users return only have 1 user
  expect(users).toHaveLength(1)
  // check if user returned is same as the user we created
  const user = users[0]
  expect(user.email).toEqual(email)
  expect(user.password).not.toEqual(password)

  // send register again
  // error ==> {register:[{path:'email', message:'...'},{}]}
  const response2: any = await request(host, mutation)
  // check if mutation return exactly 1 object
  expect(response2.register).toHaveLength(1)
  // check if the first error's path is email
  expect(response2.register[0].path).toEqual('email')
})
