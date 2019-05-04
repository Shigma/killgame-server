import chalk from 'chalk'

export function getTimeInfo () {
  return chalk`{gray [${new Date().toTimeString().slice(0, 8)}]}`
}
