import { readFileSync } from 'node:fs'

const messagePath = process.argv[2]
const message = messagePath ? readFileSync(messagePath, 'utf8') : process.env.COMMIT_MESSAGE || ''
const subject = message.split(/\r?\n/, 1)[0].trim()
const pattern = /^(new|change|fixe|refact|del)(\([^)]+\))?:\s.+$/

if (!pattern.test(subject)) {
  console.error(
    `Invalid commit message: "${subject}"\nExpected: new|change|fixe|refact|del(optional-scope): description`
  )
  process.exit(1)
}

console.log(`OK: ${subject}`)
