import packageJson from './package.json' with { type: 'json' };
import { getInstallCandidateUrl, install } from '@node-3d/addon-tools';

const prefix = 'https://github.com/node-3d/qml/releases/download';
const tag = '5.0.0';

await install(getInstallCandidateUrl(packageJson.name) || `${prefix}/${tag}`);
