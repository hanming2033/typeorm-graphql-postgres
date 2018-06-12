import { v4 } from 'uuid'
import { Redis } from 'ioredis'

// http://my-site.com/confirm/<id>
export const createConfirmEmailLink = async (url: string, userId: string, redis: Redis) => {
  // instead of using the user id as the id in the link, a unique id is generated here
  // so as to not disclose the user id
  const id = v4()
  // *setting up redis
  // click on id will confirm user with userId
  // the link expires in 24 hours
  await redis.set(id, userId, 'ex', 60 * 60 * 48)
  return `${url}/confirm/${id}`
}
