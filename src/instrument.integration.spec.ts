import { executeScriptInShell } from "@runbook/scripts";
import { fileNameNormalise, findDirectoryHoldingFileOrThrow, readTestFile } from "@runbook/files";
import path from "path";
import { toForwardSlash } from "@runbook/utils";

export const inCi = process.env[ 'CI' ] === 'true'
export async function executeRunbook ( cwd: string, cmd: string ): Promise<string> {
  const fullCmd = `runbook  ${cmd}`;
  // console.log ( 'executeRunbook', cwd, fullCmd )
  return fileNameNormalise ( rootDir ) ( toForwardSlash ( await executeScriptInShell ( cwd, fullCmd ) ) )
}
export const rootDir = findDirectoryHoldingFileOrThrow ( process.cwd (), "index.ts" );
export const rootTestDir = path.join ( rootDir, 'tests' )

interface TestResult {
  actual: string
  expected: string
}
const testIn = ( dir: string ) => async ( dirOffset: string, cmd: string ): Promise<TestResult> => {
  const testDir = path.join ( dir, dirOffset )
  const actual = await executeRunbook ( testDir, 'instrument ls' )
  const expected = readTestFile ( testDir, 'expected.txt' )
  return { actual, expected }
};

describe ( 'ls', () => {
  const test = testIn ( path.join ( rootTestDir, 'ls' ) )
  it ( "should list files - default output", async () => {
    const { actual, expected } = await test ( 'default', 'instrument ls' )
    expect ( expected ).toEqual ( actual )
  } )
  it ( "should list files - --raw", async () => {
    const { actual, expected } = await test ( 'default', 'instrument ls --raw' )
    expect ( expected ).toEqual ( actual )
  } )
  it ( "should list files - dir specified", async () => {
    const { actual, expected } = await test ( 'default', `instrument ls --dir ${(path.join ( rootDir, 'dirForLs' ))}` )
    expect ( expected ).toEqual ( actual )
  } )
} )