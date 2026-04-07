#!/usr/bin/env bun
import React from 'react';
import { render } from 'ink';
import App from './app.js';
import { loadAll } from './data/loader.js';

const args = process.argv.slice(2);
const projectIdx = args.indexOf('--project');
const projectRoot = projectIdx !== -1 ? args[projectIdx + 1] : process.cwd();

const data = await loadAll(projectRoot);

render(<App data={data} />);
