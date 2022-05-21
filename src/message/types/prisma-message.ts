import { Message } from '@prisma/client'

type name = {
  name: string
}
export type PrismaMessage = Message & {
  user: name
  friend: name
}
