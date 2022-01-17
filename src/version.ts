// Copyright (c) Alexander Rind & the SoniVis team.
// Distributed under the terms of the MIT License (see LICENSE.txt).

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
// eslint-disable-next-line @typescript-eslint/no-var-requires
const data = require('../package.json');

/**
 * The _model_module_version/_view_module_version this package implements.
 *
 * The html widget manager assumes that this is the same as the npm package
 * version number.
 */
export const MODULE_VERSION = data.version;

/*
 * The current package name.
 */
export const MODULE_NAME = data.name;
