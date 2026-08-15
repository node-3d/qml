import { Image, gl, glfw, Document } from '@node-3d/core';
import { View } from '@node-3d/qml';

type TKeyEvent = Parameters<View['keydown']>[0] & { keyCode?: unknown };
type TMouseMoveEvent = Parameters<View['mousemove']>[0];
type TMousePressEvent = Parameters<View['mousedown']>[0];
type TMouseWheelEvent = Parameters<View['wheel']>[0];

const doc = new Document({
	vsync: true,
	ignoreQuit: true,
	autoFullscreen: true,
	title: 'QML',
});

const icon = new Image(`${import.meta.dirname}/qml.png`);
icon.on('load', () => {
	doc.icon = icon as unknown as typeof doc.icon;
});

View.init(process.cwd(), doc.platformWindow, doc.platformContext, doc.platformDevice);

const ui = new View({ width: doc.w, height: doc.h, file: 'qml/gui.qml' });
doc.makeCurrent();

let isCloseRequested = false;
let isDestroyed = false;

const requestClose = (): void => {
	isCloseRequested = true;
};

const destroy = (): void => {
	if (isDestroyed) {
		return;
	}

	isDestroyed = true;
	ui.destroy();
	doc.makeCurrent();
	doc.destroy();
};

doc.on('mousedown', (event: TMousePressEvent) => ui.mousedown(event));
doc.on('mouseup', (event: TMousePressEvent) => ui.mouseup(event));
doc.on('mousemove', (event: TMouseMoveEvent) => ui.mousemove(event));
doc.on('keydown', (event: TKeyEvent) => {
	if (event.keyCode === glfw.KEY_ESCAPE) {
		requestClose();
	}
	ui.keydown(event);
});
doc.on('keyup', (event: TKeyEvent) => ui.keyup(event));
doc.on('wheel', (event: TMouseWheelEvent) => ui.wheel(event));
doc.on('quit', requestClose);

process.once('SIGINT', requestClose);

doc.on('resize', ({ width, height }) => {
	ui.wh = [width, height] as [number, number];
});

ui.on('mousedown', (e) => console.log('[>mousedown]', e));
ui.on('mouseup', (e) => console.log('[>mouseup]', e));
// ui.on('mousemove', e => console.log('[mousemove]', e));
ui.on('keydown', (e) => console.log('[>keydown]', e));
ui.on('keyup', (e) => console.log('[>keyup]', e));
ui.on('wheel', (e) => console.log('[>wheel]', e));

ui.on('press-button1', (data) => {
	console.log('press-button1:', data);
	ui.set('myButton1', 'text', `${Date.now()}`);
	const ret = ui.invoke('myButton1', 'func', [{ uid: 'dwad2312414', value: 17 }]);
	console.log('ret:', ret);
});

ui.on('press-button2', (data) => {
	const ret = ui.invoke('myButton2', 'func', []);
	console.log('press-button2:', data, '->', ret);
});

let texture = ui.textureId === null ? gl.createTexture() : new gl.WebGLTexture(ui.textureId);
ui.on('reset', (texId: number) => {
	doc.makeCurrent();
	texture = texId ? new gl.WebGLTexture(texId) : gl.createTexture();
});

type TProgramInfo = {
	vertexPositionAttribute: number;
	texUniform: WebGLUniformLocation;
	sizeUniform: WebGLUniformLocation;
};

const programInfo: TProgramInfo = {
	vertexPositionAttribute: 0,
	texUniform: new gl.WebGLUniformLocation(0),
	sizeUniform: new gl.WebGLUniformLocation(1),
};

const cubeVertexPositionBuffer = gl.createBuffer();
const cubeVertexIndexBuffer = gl.createBuffer();
const shaderProgram = gl.createProgram();

const shaders = {
	'shader-vs': `
		attribute vec3 pos;
		void main() {
			gl_Position = vec4(pos, 1.0);
		}
	`,
	'shader-fs': `
		uniform sampler2D tex;
		uniform vec2 size;
		void main() {
			vec2 uv = gl_FragCoord.xy / size.xy;
			gl_FragColor = texture2D(tex, uv);
		}
	`,
} as const;

const getShader = (id: keyof typeof shaders): WebGLShader | null => {
	let shader = null;

	if (!shaders[id]) {
		return null;
	}
	const str = shaders[id];

	if (id.includes('-fs')) {
		shader = gl.createShader(gl.FRAGMENT_SHADER);
	} else if (id.includes('-vs')) {
		shader = gl.createShader(gl.VERTEX_SHADER);
	} else {
		return null;
	}

	gl.shaderSource(shader, str);
	gl.compileShader(shader);

	if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
		console.log(gl.getShaderInfoLog(shader));
		return null;
	}

	return shader;
};

// Init resources
(() => {
	gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
	gl.blendEquation(gl.FUNC_ADD);
	gl.enable(gl.BLEND);

	const fragmentShader = getShader('shader-fs');
	const vertexShader = getShader('shader-vs');

	if (!fragmentShader || !vertexShader) {
		return;
	}

	gl.attachShader(shaderProgram, vertexShader);
	gl.attachShader(shaderProgram, fragmentShader);
	gl.linkProgram(shaderProgram);

	if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
		console.log('Could not initialise shaders');
	}

	gl.useProgram(shaderProgram);

	programInfo.vertexPositionAttribute = gl.getAttribLocation(shaderProgram, 'pos');
	gl.enableVertexAttribArray(programInfo.vertexPositionAttribute);

	programInfo.texUniform = gl.getUniformLocation(shaderProgram, 'tex');
	programInfo.sizeUniform = gl.getUniformLocation(shaderProgram, 'size');

	gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexPositionBuffer);
	const vertices = [
		// Front face
		-1.0, -1.0, 0.5, 1.0, -1.0, 0.5, 1.0, 1.0, 0.5, -1.0, 1.0, 0.5,
	];
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
	(cubeVertexPositionBuffer as unknown as { itemSize: number }).itemSize = 3;
	(cubeVertexPositionBuffer as unknown as { numItems: number }).numItems = 4;

	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, cubeVertexIndexBuffer);
	const cubeVertexIndices = [
		0,
		1,
		2,
		0,
		2,
		3, // Front face
	];
	gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(cubeVertexIndices), gl.STATIC_DRAW);
	(cubeVertexIndexBuffer as unknown as { itemSize: number }).itemSize = 1;
	(cubeVertexIndexBuffer as unknown as { numItems: number }).numItems = 6;
})();

const drawScene = () => {
	gl.viewport(0, 0, doc.width, doc.height);
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

	gl.useProgram();
	(glfw.testScene as (w: number, h: number) => void)(doc.width, doc.height);

	gl.useProgram(shaderProgram);
	gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexPositionBuffer);
	gl.vertexAttribPointer(
		programInfo.vertexPositionAttribute,
		(cubeVertexPositionBuffer as unknown as { itemSize: number }).itemSize,
		gl.FLOAT,
		false,
		0,
		0,
	);

	gl.activeTexture(gl.TEXTURE0);
	gl.bindTexture(gl.TEXTURE_2D, texture);
	gl.uniform1i(programInfo.texUniform, 0);
	gl.uniform2fv(programInfo.sizeUniform, [doc.width, doc.height]);

	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, cubeVertexIndexBuffer);
	gl.drawElements(
		gl.TRIANGLES,
		(cubeVertexIndexBuffer as unknown as { numItems: number }).numItems,
		gl.UNSIGNED_SHORT,
		0,
	);
};

const loopFunc = (): void => {
	View.update();
	doc.makeCurrent();

	if (isCloseRequested || doc.shouldClose) {
		destroy();
		return;
	}

	drawScene();
	doc.requestAnimationFrame(loopFunc);
};
doc.requestAnimationFrame(loopFunc);
