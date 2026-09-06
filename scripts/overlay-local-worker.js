#!/usr/bin/env node
'use strict';

/**
 * 把本仓库的本地功能叠到上游 _worker.js 上。
 * 当前本地功能：proxyip / 路径反代 支持逗号分隔多 IP，运行时随机抽一个。
 *
 * 用法: node scripts/overlay-local-worker.js [_worker.js]
 * 可重复执行：已叠加则跳过。锚点找不到则失败，避免静默丢掉功能。
 */

const fs = require('fs');

const file = process.argv[2] || '_worker.js';
let src = fs.readFileSync(file, 'utf8');

if (src.includes('LOCAL-CUSTOM: random-proxyip')) {
	console.log('overlay already applied, skip');
	process.exit(0);
}

const queryAnchor = [
	"\tconst 查询反代IP = searchParams.get('proxyip');",
	'\tif (查询反代IP !== null) {',
	'\t\tif (!解析代理URL(查询反代IP)) {',
	'\t\t\t设置反代IP(查询反代IP);',
].join('\n');

const pathAnchor = [
	'\t\t\tconst 路径反代值 = 提取路径值(匹配[2]);',
	'\t\t\tif (!解析代理URL(路径反代值)) {',
	'\t\t\t\t设置反代IP(路径反代值);',
].join('\n');

if (!src.includes(queryAnchor)) {
	console.error('overlay failed: 找不到查询反代IP锚点，上游可能改了 反代参数获取()');
	process.exit(1);
}
if (!src.includes(pathAnchor)) {
	console.error('overlay failed: 找不到路径反代值锚点，上游可能改了 反代参数获取()');
	process.exit(1);
}

const queryReplaced = [
	'\t// >>> LOCAL-CUSTOM: random-proxyip',
	'\tconst 随机抽取IP = (值) => {',
	"\t\tif (值 == null || 值 === '') return 值;",
	'\t\t值 = String(值);',
	"\t\tif (值.includes('?')) 值 = 值.split('?')[0].trim();",
	"\t\tif (值.includes(',')) {",
	"\t\t\tconst ipArray = 值.split(',').map((item) => item.trim()).filter(Boolean);",
	'\t\t\tif (ipArray.length > 1) {',
	'\t\t\t\treturn ipArray[Math.floor(Math.random() * ipArray.length)];',
	'\t\t\t}',
	'\t\t}',
	'\t\treturn 值.trim();',
	'\t};',
	'\t// <<< LOCAL-CUSTOM: random-proxyip',
	'',
	"\tlet 查询反代IP = searchParams.get('proxyip');",
	'\tif (查询反代IP !== null) {',
	'\t\t查询反代IP = 随机抽取IP(查询反代IP);',
	'\t\tif (!解析代理URL(查询反代IP)) {',
	'\t\t\t设置反代IP(查询反代IP);',
].join('\n');

const pathReplaced = [
	'\t\t\tlet 路径反代值 = 提取路径值(匹配[2]);',
	'\t\t\t路径反代值 = 随机抽取IP(路径反代值);',
	'\t\t\tif (!解析代理URL(路径反代值)) {',
	'\t\t\t\t设置反代IP(路径反代值);',
].join('\n');

src = src.replace(queryAnchor, queryReplaced);
src = src.replace(pathAnchor, pathReplaced);

if (!src.includes('LOCAL-CUSTOM: random-proxyip') || !src.includes('路径反代值 = 随机抽取IP')) {
	console.error('overlay failed: 替换后校验未通过');
	process.exit(1);
}

fs.writeFileSync(file, src);
console.log('overlay applied:', file);
