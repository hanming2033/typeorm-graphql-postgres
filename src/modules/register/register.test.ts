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
  register(email: "${email}", password: "${password}")
}
`

// this test requires the server to start and run in the background
test('Register User', async () => {
  const response = await request(host, mutation)
  expect(response).toEqual({ register: true })
  const users = await User.find({ where: { email } })
  expect(users).toHaveLength(1)
  const user = users[0]
  expect(user.email).toEqual(email)
  expect(user.password).not.toEqual(password)
})
