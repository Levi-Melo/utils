import fs from 'fs'
import { ClientOptions } from '@elastic/elasticsearch'

export const elasticsearchOptions: ClientOptions = {
  node: process.env.ELASTICSEARCH_HOST,
  tls: {
    ca: fs.readFileSync(__dirname + '/certs/ca/ca.crt'),
    cert: fs.readFileSync(__dirname + '/certs/client/client.crt'),
    key: fs.readFileSync(__dirname + '/certs/client/client.key')
  },
  auth: {
    username: process.env.ELASTICSEARCH_USERNAME!,
    password: process.env.ELASTICSEARCH_PASSWORD!,
  }
}