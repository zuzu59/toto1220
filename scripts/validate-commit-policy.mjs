import { execFileSync } from 'node:child_process'

const pattern = /^(new|change|fixe|refact|del)(\([^)]+\))?:\s.+$/

function validate(subject) {
  const line = String(subject || '').split(/\r?\n/, 1)[0].trim()
  if (!pattern.test(line)) {
    throw new Error(
      `Invalid commit message: "${line}"\nExpected: new|change|fixe|refact|del(optional-scope): description`
    )
  }
  return line
}

const payload = process.env.COMMIT_MESSAGES_JSON
if (payload) {
  const commits = JSON.parse(payload)
  const subjects = commits.map((commit) => validate(commit.message || commit))
  console.log(`Validated ${subjects.length} push commit(s)`)
  process.exit(0)
}

const base = process.env.BASE_SHA || process.argv[2] || ''
const head = process.env.HEAD_SHA || process.argv[3] || 'HEAD'
const zeroSha = /^0+$/.test(base)
const range = base && head && !zeroSha ? `${base}..${head}` : head
const output = execFileSync('git', ['log', '--format=%s', range], { encoding: 'utf8' }).trim()
const subjects = output ? output.split('\n').map((line) => validate(line)) : []
console.log(`Validated ${subjects.length} commit(s)`)
