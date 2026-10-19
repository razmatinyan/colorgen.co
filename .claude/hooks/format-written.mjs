import { existsSync, readFileSync } from 'node:fs'
import { extname, isAbsolute, relative, resolve } from 'node:path'
import { spawnSync } from 'node:child_process'

const supportedExtensions = new Set([
	'.css',
	'.html',
	'.js',
	'.json',
	'.jsx',
	'.md',
	'.mjs',
	'.scss',
	'.ts',
	'.tsx',
	'.vue',
	'.yaml',
	'.yml',
])

const input = JSON.parse(readFileSync(0, 'utf8'))
const filePath = input.tool_input?.file_path ?? ''
const projectDir = process.env.CLAUDE_PROJECT_DIR ?? process.cwd()
const absolutePath = resolve(projectDir, filePath)
const projectRelativePath = relative(projectDir, absolutePath)

if (!filePath || !supportedExtensions.has(extname(filePath)) || !existsSync(absolutePath)) process.exit(0)
if (projectRelativePath.startsWith('..') || isAbsolute(projectRelativePath)) process.exit(0)

const prettierPath = resolve(projectDir, 'node_modules', 'prettier', 'bin', 'prettier.cjs')
const result = spawnSync(process.execPath, [prettierPath, '--write', absolutePath], {
	cwd: projectDir,
	stdio: 'inherit',
})

process.exit(result.status ?? 1)
