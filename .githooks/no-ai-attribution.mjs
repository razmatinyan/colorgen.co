import { readFileSync } from 'node:fs'

const aiNames = [
	'claude',
	'anthropic',
	'chatgpt',
	'openai',
	'gpt-\\d',
	'codex',
	'copilot',
	'cursor',
	'gemini',
	'aider',
	'devin',
	'windsurf',
	'codeium',
].join('|')

const attributionPatterns = [
	new RegExp(`co-authored-by:[^\\n]*(${aiNames})`, 'i'),
	new RegExp(`(generated|written|created|made)\\s+(with|by|using)[^\\n]*(${aiNames})`, 'i'),
	/noreply@anthropic\.com/i,
	/🤖/u,
]

const gitWriteCommand = /(^|[;&|(]\s*|\n\s*)(git(\s+-c\s+\S+|\s+-\S+)*\s+(commit|tag|notes)|gh\s+(pr|release))\b/

function findAttribution(text) {
	return text
		.split('\n')
		.filter((line) => attributionPatterns.some((pattern) => pattern.test(line)))
		.map((line) => line.trim())
}

function report(lines, source) {
	console.error(
		[
			`Blocked: ${source} contains AI attribution. This project does not allow it (AGENTS.md, Git).`,
			'Remove these lines and try again:',
			...lines.slice(0, 10).map((line) => `  ${line}`),
		].join('\n'),
	)
}

if (process.argv[2] === '--commit-msg') {
	const message = readFileSync(process.argv[3], 'utf8')
		.split('\n')
		.filter((line) => !line.startsWith('#'))
		.join('\n')
	const lines = findAttribution(message)
	if (lines.length) {
		report(lines, 'the commit message')
		process.exit(1)
	}
	process.exit(0)
}

const input = JSON.parse(readFileSync(0, 'utf8'))
const command = input.tool_input?.command ?? ''
if (!gitWriteCommand.test(command)) process.exit(0)

const lines = findAttribution(command)
if (lines.length) {
	report(lines, 'this git command')
	process.exit(2)
}
