import { createElement } from '../../install/neep';

export function getKey(key: any) {
	if (typeof key === 'string') { return ` key=${JSON.stringify(key)}`; }
	if (typeof key === 'number') { return ` key=${key}`; }
	if (typeof key === 'boolean') { return ` key=${key}`; }
	if (typeof key === 'bigint') { return ` key=${key}`; }
	if (typeof key === 'symbol') { return ` key=${String(key)}`; }
	if (key === null) { return ` key=${key}`; }
	if (key !== undefined) { return ` key=${String(key)}`; }
}

export function getLabels(labels: ([string, string] | undefined)[]) {
	return (labels.filter(Boolean) as [string, string][])
		.map(([v, color]) => <span style={`color: ${color || '#000'}`}>
			{v}
		</span>);
}
