import { select } from 'd3-selection';
import { roundTo20 } from './utils/math';

function render(g, node, isSelected) {
	node.width = node.width || 120;
	node.height = node.height || 60;
	let header = null;
	let title = null;

	const theme = !node.theme ? {} : node.theme;
	const headerBackgroundColor = theme.headerBackgroundColor ? theme.headerBackgroundColor : '#f1f3f4';
	const bodyBackgroundColor = theme.bodyBackgroundColor ? theme.bodyBackgroundColor : 'white';
	const bodyTextColor = theme.bodyTextColor ? theme.bodyTextColor : 'black';
	const headerTextColor = theme.headerTextColor ? theme.headerTextColor : 'black';

	let borderColor = isSelected ? '#666666' : '#bbbbbb';
	if (theme.borderColor) {
		if (isSelected) {
			borderColor = theme.borderColorSelected;
		} else {
			borderColor = theme.borderColor;
		}
	}

	if (node.type !== 'start' && node.type !== 'end') {
		// title
		header = g
			.append('rect')
			.attr('x', node.x)
			.attr('y', node.y)
			.attr('stroke', borderColor)
			.attr('class', 'title')
			.style('height', '20px')
			.style('fill', headerBackgroundColor)
			.style('stroke-width', '1px')
			.style('width', node.width + 'px');
		title = g
			.append('text')
			.attr('fill', headerTextColor)
			.attr('x', node.x + 4)
			.attr('y', node.y + 15)
			.attr('class', 'unselectable')
			.text(() => node.name)
			.each(function wrap() {
				let self = select(this);
				let textLength = self.node().getComputedTextLength();
				let text = self.text();
				while (textLength > node.width - 2 * 4 && text.length > 0) {
					text = text.slice(0, -1);
					self.text(`${text}...`);
					textLength = self.node().getComputedTextLength();
				}
			});
	}
	// body
	let body = g.append('rect').attr('class', 'body');
	body.style('width', `${node.width}px`).style('fill', bodyBackgroundColor).style('stroke-width', '1px');
	if (node.type !== 'start' && node.type !== 'end') {
		body.attr('x', node.x).attr('y', node.y + 20);
		body.style('height', `${roundTo20(node.height - 20)}px`);
	} else {
		body.attr('x', node.x).attr('y', node.y).classed(node.type, true).attr('rx', 30);
		body.style('height', `${roundTo20(node.height)}px`);
	}
	body.attr('stroke', borderColor);

	// body text
	let text =
		node.type === 'start'
			? 'Start'
			: node.type === 'end'
				? 'End'
				: !node.approvers || node.approvers.length === 0
					? 'No approver'
					: node.approvers.length > 1
						? `${node.approvers[0].name}...`
						: node.approvers[0].name;
	let bodyTextY;
	if (node.type !== 'start' && node.type !== 'end') {
		bodyTextY = node.y + 25 + roundTo20(node.height - 20) / 2;
	} else {
		bodyTextY = node.y + 5 + roundTo20(node.height) / 2;
	}
	let content = g
		.append('text')
		.attr('fill', bodyTextColor)
		.attr('x', node.x + node.width / 2)
		.attr('y', bodyTextY)
		.attr('class', 'unselectable')
		.attr('text-anchor', 'middle')
		.text(() => text)
		.each(function wrap() {
			let self = select(this);
			let textLength = self.node().getComputedTextLength();
			let text = self.text();
			while (textLength > node.width - 2 * 4 && text.length > 0) {
				text = text.slice(0, -1);
				self.text(`${text}...`);
				textLength = self.node().getComputedTextLength();
			}
		});
	return { header, title, body, content };
}

export default render;
