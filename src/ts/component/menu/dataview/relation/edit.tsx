import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { I, C, M, DataUtil, Util, translate } from 'ts/lib';
import { Icon, Input, MenuItemVertical, Button } from 'ts/component';
import { blockStore, dbStore, menuStore } from 'ts/store';
import { observer } from 'mobx-react';
import { observable } from 'mobx';

interface Props extends I.Menu {
	history: any;
};

const Constant = require('json/constant.json');
const $ = require('jquery');

const MenuRelationEdit = observer(class MenuRelationEdit extends React.Component<Props, {}> {

	format: I.RelationType = null;
	objectTypes: string[] = [];
	ref: any = null;
	
	constructor(props: any) {
		super(props);
		
		this.onRelationType = this.onRelationType.bind(this);
		this.onObjectType = this.onObjectType.bind(this);
		this.onDateSettings = this.onDateSettings.bind(this);
		this.onSubmit = this.onSubmit.bind(this);
		this.onChange = this.onChange.bind(this);
		this.onClick = this.onClick.bind(this);
	};

	render () {
		const { param } = this.props;
		const { data } = param;
		const { rootId, blockId } = data;
		const relation = this.getRelation();
		const viewRelation = this.getViewRelation();
		const isDate = this.format == I.RelationType.Date;
		const isObject = this.format == I.RelationType.Object;
		const allowed = blockStore.checkFlags(rootId, blockId, [ I.RestrictionDataview.Relation ]);
		const canDelete = allowed && relation && Constant.systemRelationKeys.indexOf(relation.relationKey) < 0;
		const isReadonly = this.isReadonly();
		const sections = this.getSections();

		let opts = null;
		let typeProps: any = { name: 'Select object type' };
		let ccn = [ 'item' ];
		
		if (relation) {
			ccn.push('disabled');
		};

		if (isObject) {
			const l = this.objectTypes.length;
			const type = l ? this.objectTypes[0] : '';
			const objectType = dbStore.getObjectType(type);

			if (objectType) {
				typeProps.name = objectType.name || DataUtil.defaultName('page');
				typeProps.object = { ...objectType, layout: I.ObjectLayout.Type };
			};

			typeProps.caption = l > 1 ? '+' + (l - 1) : '';
			if (typeProps.caption) {
				typeProps.withCaption = true;
			};

			opts = (
				<div className="section">
					<div className="name">Limit object Types</div>
					<MenuItemVertical
						id="object-type"
						onMouseEnter={this.onObjectType}
						arrow={!isReadonly}
						{...typeProps}
					/>
				</div>
			);

			if (isReadonly && !objectType) {
				opts = null;
			};
		};

		if (isDate && relation) {
			opts = (
				<div className="section">
					<MenuItemVertical 
						id="includeTime" 
						icon="clock" 
						name="Include time" 
						onMouseEnter={this.menuClose}
						withSwitch={true}
						switchValue={viewRelation?.includeTime}
						onSwitch={(e: any, v: boolean) => { this.onChangeTime(v); }}
					/>

					<MenuItemVertical 
						id="date-settings" 
						icon="settings" 
						name="Preferences" 
						arrow={true} 
						onMouseEnter={this.onDateSettings} 
					/>
				</div>
			);
		};

		return (
			<form onSubmit={this.onSubmit}>
				<div className="section">
					<div className="name">Relation name</div>
					{!isReadonly ? (
						<div className="inputWrap">
							<Input 
								ref={(ref: any) => { this.ref = ref; }} 
								value={relation ? relation.name : ''} 
								onChange={this.onChange}
								onMouseEnter={this.menuClose}
							/>
						</div>
					) : (
						<div className="item isReadonly">
							<Icon className="lock" />
							{relation ? relation.name : ''}
						</div>
					)}
				</div>

				<div className={[ 'section', (!opts && !isReadonly ? 'noLine' : '') ].join(' ')}>
					<div className="name">Relation type</div>
					<MenuItemVertical 
						id="relation-type" 
						icon={this.format === null ? undefined : 'relation ' + DataUtil.relationClass(this.format)} 
						name={this.format === null ? 'Select relation type' : translate('relationName' + this.format)} 
						onMouseEnter={this.onRelationType} 
						readonly={isReadonly}
						arrow={!relation}
					/>
				</div>
				
				{opts}

				{!isReadonly ? (
					<div className="section" onMouseEnter={this.menuClose}>
						<div className="inputWrap">
							<Button id="button" type="input" text={relation ? 'Save' : 'Create'} color="grey" className="filled c28" />
						</div>
					</div>
				) : ''}

				{sections.map((section: any, i: number) => (
					<div key={i} className="section">
						{section.children.map((action: any, c: number) => (
							<MenuItemVertical 
								key={c}
								{...action}
								onClick={(e: any) => { this.onClick(e, action); }} 
								onMouseEnter={this.menuClose} 
							/>
						))}
					</div>
				))}
			</form>
		);
	};

	componentDidMount() {
		const { param } = this.props;
		const { data } = param;
		const { filter } = data;
		const relation = this.getRelation();

		if (relation) {
			this.format = relation.format;
			this.objectTypes = relation.objectTypes;
			this.forceUpdate();
		};

		if (this.ref && filter) {
			this.ref.setValue(filter);
		};

		this.rebind();
		this.focus();
		this.checkButton();
	};

	componentDidUpdate () {
		this.focus();
		this.checkButton();
	};

	componentWillUnmount () {
		this.menuClose();
		this.unbind();
	};

	rebind () {
		const { getId } = this.props;

		this.unbind();

		$(`#${getId()}`).on('click.menu', () => { this.menuClose(); });
	};

	unbind () {
		const { getId } = this.props;

		$(window).unbind('keydown.menu');
		$(`#${getId()}`).unbind('click.menu');
	};

	focus () {
		window.setTimeout(() => {
			if (this.ref) {
				this.ref.focus();
			};
		}, 15);
	};

	getSections () {
		const { param } = this.props;
		const { data } = param;
		const { rootId, blockId, extendedOptions } = data;
		const relation = this.getRelation();
		const allowed = relation && blockStore.checkFlags(rootId, blockId, [ I.RestrictionDataview.Relation ]);
		const canDelete = allowed && Constant.systemRelationKeys.indexOf(relation.relationKey) < 0;

		let sections: any[] = [
			{
				children: [
					// { id: 'open', icon: 'expand', name: 'Open relation' },
					allowed ? { id: 'copy', icon: 'copy', name: 'Duplicate' } : null,
					canDelete ? { id: 'remove', icon: 'remove', name: 'Delete' } : null,
				]
			}
		];

		if (extendedOptions) {
			sections.push({
				children: [
					{ id: 'filter', icon: 'relation-filter', name: 'Add filter' },
					{ id: 'sort', icon: 'sort0', name: 'Sort ascending', type: I.SortType.Asc },
					{ id: 'sort', icon: 'sort1', name: 'Sort descending', type: I.SortType.Desc },
					{ id: 'insert', icon: 'insert-left', name: 'Insert left', dir: -1 },
					{ id: 'insert', icon: 'insert-right', name: 'Insert right', dir: 1 },
					{ id: 'hide', icon: 'hide', name: 'Hide relation' },
				]
			});
		};

		sections = sections.filter((s: any) => {
			s.children = s.children.filter(c => c);
			return s.children.length > 0;
		});

		return sections;
	};

	getItems () {
		const sections = this.getSections();

		let items: any[] = [];
		for (let section of sections) {
			items = items.concat(section.children);
		};

		return items;
	};

	onClick (e: any, item: any) {
		const { param } = this.props;
		const { data } = param;
		const { rootId, blockId, relationKey, getView, getData } = data;
		const relation = this.getRelation();
		const view = getView();

		if (!relation) {
			return;
		};

		let close = true;
		let viewUpdate = false;
		let updateData = false;

		switch (item.id) {
			case 'open':
				DataUtil.objectOpenPopup({ id: relation.objectId, layout: I.ObjectLayout.Relation });
				break;

			case 'copy':
				this.add({ name: relation.name, format: relation.format });
				break;

			case 'remove':
				DataUtil.dataviewRelationDelete(rootId, blockId, relationKey, view);		
				break;

			case 'filter':
				break;

			case 'sort':
				view.sorts = [ { relationKey: relation.relationKey, type: item.type } ];
				viewUpdate = true;
				updateData = true;
				break;

			case 'insert':
				break;

			case 'hide':
				const idx = view.relations.findIndex((it: I.ViewRelation) => { return it.relationKey == relationKey; });

				view.relations[idx].isVisible = false;
				viewUpdate = true;
				updateData = false;
				break;
		};

		if (viewUpdate) {
			C.BlockDataviewViewUpdate(rootId, blockId, view.id, view, (message: any) => {
				if (updateData) {
					getData(view.id, 0);
				};
			});
		};

		if (close) {
			this.props.close();
		};

	};

	onRelationType (e: any) {
		const { param, getId } = this.props;
		const { data } = param;
		const relation = this.getViewRelation();
		
		if (relation) {
			return;
		};

		this.menuOpen('select', { 
			element: `#${getId()} #item-relation-type`,
			data: {
				...data,
				filter: '',
				value: this.format,
				options: DataUtil.menuGetRelationTypes(),
				noFilter: true,
				onSelect: (e: any, item: any) => {
					this.format = item.id;
					this.forceUpdate();
				},
			}
		});
	};

	onObjectType (e: any) {
		const { param } = this.props;
		const { data } = param;
		const { rootId, blockId } = data;

		if (this.isReadonly()) {
			return;
		};

		const { getId } = this.props;
		
		let relation: any = this.getRelation();
		if (!relation) {
			relation = { format: this.format };
		};

		this.menuOpen('dataviewObjectValues', { 
			element: `#${getId()} #item-object-type`,
			className: 'single',
			width: 256,
			data: {
				rootId,
				blockId,
				nameAdd: 'Add object type',
				placeholderFocus: 'Filter object types...',
				value: this.objectTypes, 
				types: [ Constant.typeId.type ],
				relation: observable.box(relation),
				valueMapper: (it: any) => {
					const type = dbStore.getObjectType(it.id);
					return { ...type, layout: I.ObjectLayout.Type };
				},
				onChange: (value: any, callBack?: () => void) => {
					const vr = this.getViewRelation();

					this.objectTypes = value;
					this.forceUpdate();

					if (vr) {
						this.save();
					};

					if (callBack) {
						callBack();
					};
				},
			}
		});
	};

	onDateSettings (e: any) {
		const { param, getId } = this.props;
		const { data } = param;

		this.menuOpen('dataviewDate', { 
			element: `#${getId()} #item-date-settings`,
			onClose: () => {
				menuStore.close('select');
			},
			data: data
		});
	};

	menuOpen (id: string, options: I.MenuParam) {
		const { getSize, param } = this.props;
		const { classNameWrap } = param;

		options.isSub = true;
		options.passThrough = true;
		options.offsetX = getSize().width;
		options.vertical = I.MenuDirection.Center;
		options.classNameWrap = classNameWrap;

		if (!menuStore.isOpen(id)) {
			menuStore.closeAll(Constant.menuIds.relationEdit, () => {
				menuStore.open(id, options);
			});
		};
	};

	menuClose () {
		menuStore.closeAll(Constant.menuIds.relationEdit);
	};

	onChangeTime (v: boolean) {
		const { param } = this.props;
		const { data } = param;
		const { rootId, blockId, relationKey, getView } = data;
		const view = getView();
		const relation = this.getViewRelation();
		const idx = view.relations.findIndex((it: I.ViewRelation) => { return it.relationKey == relationKey; });

		relation.includeTime = v;
		view.relations[idx] = relation;
		C.BlockDataviewViewUpdate(rootId, blockId, view.id, view);
	};

	onSubmit (e: any) {
		e.preventDefault();

		const node = $(ReactDOM.findDOMNode(this));
		const button = node.find('#button');

		if (button.hasClass('grey')) {
			return;
		};

		this.save();
		this.menuClose();
		this.props.close();
	};

	onChange () {
		this.checkButton();
	};

	checkButton () {
		const node = $(ReactDOM.findDOMNode(this));
		const name = this.ref ? this.ref.getValue() : '';
		const button = node.find('#button');
		const canSave = name.length && !this.isReadonly();

		if (canSave) {
			button.addClass('orange').removeClass('grey');
		} else {
			button.removeClass('orange').addClass('grey');
		};
	};

	isReadonly () {
		const { param } = this.props;
		const { data } = param;
		const { readonly, rootId, blockId } = data;
		const relation = this.getRelation();
		const allowed = blockStore.checkFlags(rootId, blockId, [ I.RestrictionDataview.Relation ]);

		return readonly || !allowed || (relation && relation.isReadonlyRelation);
	};

	save () {
		const { param, close } = this.props;
		const { data } = param;
		const { rootId, blockId } = data;
		const name = this.ref ? this.ref.getValue() : '';
		const block = blockStore.getLeaf(rootId, blockId);

		if (!name || !block) {
			return;
		};

		const relation = this.getViewRelation();
		const newRelation: any = { name: name, format: this.format };

		if (this.format == I.RelationType.Object) {
			newRelation.objectTypes = this.objectTypes;
		};

		relation ? this.update(newRelation) : this.add(newRelation);
	};

	add (newRelation: any) {
		const { param } = this.props;
		const { data } = param;
		const { rootId, blockId, addCommand, onChange } = data;

		if (addCommand) {
			addCommand(rootId, blockId, newRelation, onChange);
		};
	};

	update (newRelation: any) {
		const { param } = this.props;
		const { data } = param;
		const { rootId, blockId, updateCommand } = data;
		const relation = this.getViewRelation();

		if (updateCommand) {
			updateCommand(rootId, blockId, Object.assign(relation, newRelation));
		};
	};

	getRelation (): I.Relation {
		const { param } = this.props;
		const { data } = param;
		const { rootId, blockId, relationKey } = data;

		return dbStore.getRelation(rootId, blockId, relationKey);
	};

	getViewRelation (): I.ViewRelation {
		const { param } = this.props;
		const { data } = param;
		const { relationKey, getView } = data;

		return getView()?.getRelation(relationKey);
	};

});

export default MenuRelationEdit;