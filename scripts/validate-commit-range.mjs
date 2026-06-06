import { execFileSync } from 'node:child_process'

const [base, head] = process.argv.slice(2)
const zeroSha = /^0+$/.test(base || '')
const range = base && head && !zeroSha ? `${base}..${head}` : (head || 'HEAD')
const pattern = /^(new|change|fixe|refact|del)(\([^)]+\))?:\s.+$/

const output = execFileSync('git', ['log', '--format=%s', range], { encoding: 'utf8' }).trim()
const subjects = output ? output.split('\n').map((line) => line.trim()).filter(Boolean) : []

for (const subject of subjects) {
  if (!pattern.test(subject)) {
    console.error(
      `Invalid commit message: "${subject}"\nExpected: new|change|fixe|refact|del(optional-scope): description`
    )
    process.exit(1)
  }
}

console.log(`Validated ${subjects.length} commit(s)`)
