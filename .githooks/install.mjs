import { execFileSync } from 'node:child_process'
import { existsSync } from 'node:fs'

if (existsSync('.git')) {
	try {
		execFileSync('git', ['config', 'core.hooksPath', '.githooks'], { stdio: 'ignore' })
	} catch {
		process.exit(0)
	}
}
