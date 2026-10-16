import { readFileSync, readdirSync, statSync } from 'node:fs'
import { extname, join } from 'node:path'

const codeExtensions = new Set(['.ts', '.tsx', '.js', '.mjs', '.cjs', '.vue', '.css', '.scss'])
const ignoredDirs = new Set(['node_modules', '.nuxt', '.output', '.git', 'dist'])
const stringLiteral = /'(?:\\.|[^'\\])*'|"(?:\\.|[^"\\])*"|`(?:\\.|[^`\\])*`/g
const commentMarker = new RegExp(['//', '/\\*', '<!' + '--'].join('|'))
const blockCommentLine = new RegExp(['^\\s*\\*/', '^\\s*\\*\\s+[^\\s{,]'].join('|'))

function findComments(source) {
	return source.split('\n').flatMap((line, index) => {
		const code = line.replace(stringLiteral, '""')
		const isComment = commentMarker.test(code) || blockCommentLine.test(line)
		return isComment ? [{ line: index + 1, text: line.trim() }] : []
	})
}

function walk(path) {
	const stats = statSync(path)
	if (stats.isFile()) return codeExtensions.has(extname(path)) ? [path] : []
	return readdirSync(path)
		.filter(name => !ignoredDirs.has(name))
		.flatMap(name => walk(join(path, name)))
}

if (process.argv[2] === '--scan') {
	const files = process.argv.slice(3).flatMap(walk)
	let total = 0
	for (const file of files) {
		for (const hit of findComments(readFileSync(file, 'utf8'))) {
			total++
			console.log(`${file}:${hit.line}  ${hit.text}`)
		}
	}
	process.exit(total ? 1 : 0)
}

const input = JSON.parse(readFileSync(0, 'utf8'))
const toolInput = input.tool_input ?? {}
const filePath = toolInput.file_path ?? ''

if (!codeExtensions.has(extname(filePath))) process.exit(0)

const written = [
	toolInput.content,
	toolInput.new_string,
	...(toolInput.edits ?? []).map(edit => edit.new_string),
].filter(Boolean).join('\n')

const hits = findComments(written)
if (hits.length) {
	console.error([
		`Blocked: ${filePath} would contain code comments. This project does not allow comments in code (AGENTS.md).`,
		'Remove them and express intent through naming instead:',
		...hits.slice(0, 10).map(hit => `  ${hit.text}`),
	].join('\n'))
	process.exit(2)
}
