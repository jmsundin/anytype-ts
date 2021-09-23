import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { I, Util } from 'ts/lib';

interface Props {
	id?: string;
	icon?: string;
	className?: string;
	arrow?: boolean;
	tooltip?: string;
	tooltipY?: I.MenuDirection;
	inner?: any;
	draggable?: boolean;
	style?: any;
	onClick?(e: any): void;
	onMouseDown?(e: any): void;
	onMouseEnter?(e: any): void;
	onMouseLeave?(e: any): void;
	onDragStart?(e: any): void;
	onContextMenu?(e: any): void;
};

const $ = require('jquery');

class Icon extends React.Component<Props, {}> {
	
	public static defaultProps = {
		tooltipY: I.MenuDirection.Bottom,
	};
	
	constructor (props: any) {
		super(props);

		this.onMouseDown = this.onMouseDown.bind(this);
		this.onMouseEnter = this.onMouseEnter.bind(this);
		this.onMouseLeave = this.onMouseLeave.bind(this);
		this.onContextMenu = this.onContextMenu.bind(this);
	};
	
	render () {
		const { id, icon, arrow, draggable, className, inner, onClick, onDragStart } = this.props;
		
		let style = this.props.style || {};
		let cn = [ 'icon' ];
		
		if (className) {
			cn.push(className);
		};
		
		if (icon) {
			style.backgroundImage = 'url("' + icon + '")';
		};
		
		return (
			<div id={id} draggable={draggable} onMouseDown={this.onMouseDown} onContextMenu={this.onContextMenu} onMouseEnter={this.onMouseEnter} onMouseLeave={this.onMouseLeave} onClick={onClick} onDragStart={onDragStart} className={cn.join(' ')} style={style}>
				{arrow ? <div className="icon arrow" /> : ''}
				{inner ? inner : null}
			</div>
		);
	};
	
	componentWillUnmount () {
		Util.tooltipHide(false);
	};
	
	onMouseEnter (e: any) {
		const { tooltip, tooltipY, onMouseEnter } = this.props;
		const node = $(ReactDOM.findDOMNode(this));
		
		if (tooltip) {
			Util.tooltipShow(tooltip, node, I.MenuDirection.Center, tooltipY);
		};
		
		if (onMouseEnter) {
			onMouseEnter(e);
		};
	};
	
	onMouseLeave (e: any) {
		const { onMouseLeave } = this.props;
		
		Util.tooltipHide(false);
		
		if (onMouseLeave) {
			onMouseLeave(e);
		};
	};
	
	onMouseDown (e: any) {
		const { onMouseDown } = this.props;
		
		Util.tooltipHide(true);
		
		if (onMouseDown) {
			onMouseDown(e);
		};
	};

	onContextMenu (e: any) {
		const { onContextMenu } = this.props;
		
		Util.tooltipHide(true);
		
		if (onContextMenu) {
			onContextMenu(e);
		};
	};
	
};

export default Icon;