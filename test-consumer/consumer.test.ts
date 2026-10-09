import assert from 'node:assert/strict';
import test from 'node:test';

import { Method, Property, View } from '@node-3d/qml';

test('loads the packed QML addon and its runtime libraries', () => {
	assert.equal(typeof View, 'function');
	assert.equal(typeof Property, 'function');
	assert.equal(typeof Method, 'function');
});
