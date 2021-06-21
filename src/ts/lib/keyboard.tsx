import { I, Util, DataUtil, crumbs, Storage, focus, history as historyPopup } from 'ts/lib';
import { authStore, blockStore, menuStore, popupStore } from 'ts/store';

const { ipcRenderer } = window.require('electron');

const $ = require('jquery');
const KeyCode = require('json/key.json');
const Constant = require('json/constant.json');

class Keyboard {
	
	history: any = null;
	mouse: any = { 
		page: { x: 0, y: 0 },
		client: { x: 0, y: 0 },
	};
	timeoutPin: number = 0;
	pressed: string[] = [];
	match: any = {};
	matchPopup: any = {};
	source: any = null;
	
	isDragging: boolean = false;
	isResizing: boolean = false;
	isFocused: boolean = false;
	isPreviewDisabled: boolean = false;
	isMouseDisabled: boolean = false;
	isPinChecked: boolean = false;
	isContextDisabled: boolean = false;
	isBlurDisabled: boolean = false;
	
	init (history: any) {
		this.history = history;
		this.unbind();
		
		let win = $(window); 
		win.on('keydown.common', (e: any) => { this.onKeyDown(e); });
		win.on('keyup.common', (e: any) => { this.onKeyUp(e); });

		ipcRenderer.removeAllListeners('commandGlobal');
		ipcRenderer.on('commandGlobal', (e: any, cmd: string, arg: any) => { this.onCommand(cmd, arg); });
	};
	
	unbind () {
		$(window).unbind('keyup.common keydown.common');
	};
	
	onKeyDown (e: any) {
		const { account } = authStore;
		const rootId = this.getRootId();
		const platform = Util.getPlatform();
		const key = e.key.toLowerCase();
		const cmd = this.ctrlKey();
		const isMain = this.isMain();

		this.pressed.push(key);

		// Go back
		this.shortcut('backspace', e, (pressed: string) => {
			if (!isMain || (isMain && !this.isMainIndex()) || this.isFocused) {
				return;
			};
			this.back();
		});

		if (platform == I.Platform.Mac) {
			this.shortcut('cmd+[', e, (pressed: string) => { this.back(); });
			this.shortcut('cmd+]', e, (pressed: string) => { this.forward(); });
		} else {
			this.shortcut('alt+arrowleft', e, (pressed: string) => { this.back(); });
			this.shortcut('alt+arrowright', e, (pressed: string) => { this.forward(); });
		};

		// Close popups
		this.shortcut('escape', e, (pressed: string) => {
			e.preventDefault();
			popupStore.closeAll();
			menuStore.closeAll();
			Util.linkPreviewHide(false);
		});

		if (isMain) {
			// Print
			keyboard.shortcut(`${cmd}+p`, e, (pressed: string) => {
				e.preventDefault();
				this.onPrint();
			});

			// Navigation search
			this.shortcut(`${cmd}+s`, e, (pressed: string) => {
				if (popupStore.isOpen('search') || !this.isPinChecked) {
					return;
				};
				popupStore.open('search', { 
					preventResize: true,
					data: { 
						type: I.NavigationType.Go, 
						disableFirstKey: true,
						rootId: rootId,
					}, 
				});
			});

			// Text search
			this.shortcut(`${cmd}+f`, e, (pressed: string) => {
				this.onSearch();
			});

			// Navigation links
			this.shortcut(`${cmd}+o`, e, (pressed: string) => {
				popupStore.open('navigation', { 
					data: { 
						type: I.NavigationType.Go, 
						rootId: rootId,
					}, 
				});
			});

			// Go to dashboard
			this.shortcut('cmd+enter, alt+h', e, (pressed: string) => {
				let check = platform == I.Platform.Mac ? pressed == 'cmd+enter' : true;
				if (!check || !authStore.account) {
					return;
				};

				this.history.push('/main/index');
			});

			// Create new page
			this.shortcut(`${cmd}+n`, e, (pressed: string) => {
				e.preventDefault();
				this.pageCreate();
			});
		};

		this.initPinCheck();
	};

	pageCreate () {
		const { focused } = focus.state;
		const rootId = this.getRootId();
		const isMainIndex = this.isMainIndex();
		const isMainEditor = this.isMainEditor();

		if (!isMainIndex && !isMainEditor) {
			return;
		};

		let targetId = '';
		let position = I.BlockPosition.Bottom;
		
		if (this.isMainEditor()) {
			const fb = blockStore.getLeaf(rootId, focused);
			if (fb) {
				if (fb.isTextTitle()) {
					const first = blockStore.getFirstBlock(rootId, 1, (it: I.Block) => { return it.isFocusable() && !it.isTextTitle(); });
					if (first) {
						targetId = first.id;
						position = I.BlockPosition.Top;
					};
				} else 
				if (fb.isFocusable()) {
					targetId = fb.id;
				};
			};
		};
		
		DataUtil.pageCreate(rootId, targetId, {}, position, '', (message: any) => {
			if (isMainIndex) {
				DataUtil.objectOpen({ id: message.targetId });
			} else {
				DataUtil.objectOpenPopup({ id: message.targetId });
			};
		});
	};

	getRootId (): string {
		return this.isMainEditor() ? this.match.params.id : blockStore.root;
	};

	onKeyUp (e: any) {
		const key = e.key.toLowerCase();

		this.pressed = this.pressed.filter((it: string) => { return it != key; });
	};

	back () {
		const { account } = authStore;
		const isPopup = popupStore.isOpen('page');

		crumbs.restore(I.CrumbsType.Page);
		
		if (isPopup) {
			historyPopup.goBack((match: any) => { 
				popupStore.updateData('page', { matchPopup: match }); 
			});
		} else {
			const prev = this.history.entries[this.history.index - 1];
			if (prev) {
				let route = Util.getRoute(prev.pathname);
				if ((route.page == 'auth') && account) {
					return;
				};
				if ((route.page == 'main') && !account) {
					return;
				};
			};

			this.history.goBack();
		};

		this.restoreSource();
	};

	forward () {
		const isPopup = popupStore.isOpen('page');

		crumbs.restore(I.CrumbsType.Page);

		if (isPopup) {
			historyPopup.goForward((match: any) => { 
				popupStore.updateData('page', { matchPopup: match }); 
			});
		} else {
			this.history.goForward();
		};
	};

	onCommand (cmd: string, arg: any) {
		if (!this.isMain()) {
			return;
		};

		switch (cmd) {
			case 'search':
				this.onSearch();
				break;

			case 'print':
				this.onPrint();
				break;
		};
	};

	onPrint () {
		focus.clearRange(true);
		window.print();
	};

	onSearch () {
		const isPopup = popupStore.isOpen();
		const popup = $('.popup').last().find('#innerWrap');
		const scrollable = popup.find('.scrollable');

		window.setTimeout(() => {
			menuStore.open('searchText', {
				element: '#header',
				type: I.MenuType.Horizontal,
				horizontal: I.MenuDirection.Right,
				classNameWrap: 'fromHeader',
				data: {
					searchContainer: isPopup ? popup : $('.page'),
					scrollContainer: isPopup ? (scrollable.length ? scrollable : popup) : $('html, body'),
					isPopup: isPopup,
				},
			});
		}, Constant.delay.menu);
	};

	ctrlByPlatform (e: any) {
		const platform = Util.getPlatform();
		if (platform == I.Platform.Mac) {
			return e.metaKey;
		} else {
			return e.ctrlKey;
		};
	};

	isMain () {
		return this.match?.params?.page == 'main';
	};
	
	isMainEditor () {
		return this.isMain() && (this.match?.params?.action == 'edit');
	};

	isMainIndex () {
		return this.isMain() && (this.match?.params?.action == 'index');
	};
	
	setFocus (v: boolean) {
		this.isFocused = v;
	};
	
	setResize (v: boolean) {
		this.isResizing = v;
	};
	
	setDrag (v: boolean) {
		this.isDragging = v;
	};

	setPinChecked (v: boolean) {
		this.isPinChecked = v;
	};

	initPinCheck () {
		const { account } = authStore;
		const pin = Storage.get('pin');
		
		if (!pin) {
			this.setPinChecked(true);
		};
		
		if (!pin || !account) {
			return;
		};
		
		window.clearTimeout(this.timeoutPin);
		this.timeoutPin = window.setTimeout(() => {
			const pin = Storage.get('pin');
			if (pin) {
				this.setPinChecked(false);
				this.history.push('/auth/pin-check');
			};
		}, 5 * 60 * 1000);
	};

	setMatch (match: any) {
		this.match = match;
	};

	setSource (source: any) {
		this.source = Util.objectCopy(source);
	};

	restoreSource () {
		if (!this.source) {
			return;
		};

		const { type, data } = this.source;

		switch (type) {
			case I.Source.Popup:
				window.setTimeout(() => {
					popupStore.open(data.id, data.param);
				}, Constant.delay.popup);
				break;
		};

		this.setSource(null);
	};
	
	disableMouse (v: boolean) {
		this.isMouseDisabled = v;
	};

	// Flag to prevent blur events
	disableBlur (v: boolean) {
		this.isBlurDisabled = v;
	};

	// Flag to prevent menuBlockContext from closing
	disableContext (v: boolean) {
		this.isContextDisabled = v;
	};
	
	disablePreview (v: boolean) {
		this.isPreviewDisabled = v;
	};
	
	setCoords (e: any) {
		this.mouse = {
			page: { x: e.pageX, y: e.pageY },
			client: { x: e.clientX, y: e.clientY },
		};
	};
	
	isArrow (k: string): boolean {
		const keys: string[] = [ Key.up, Key.down, Key.left, Key.right ];
		return keys.indexOf(k) >= 0;
	};
	
	isSpecial (k: string): boolean {
		const keys: string[] = [ Key.backspace, Key.tab, Key.enter ];
		return this.isArrow(k) || keys.indexOf(k) >= 0;
	};

	shortcut (s: string, e: any, callBack: (pressed: string) => void) {
		if (!e || !e.key) {
			return;
		};

		const a = s.split(',').map((it: string) => { return it.trim(); });
		const key = e.key.toLowerCase();
		const which = e.which;

		let pressed = [];
		let res = '';

		if (e.shiftKey) {
			pressed.push('shift');
		};
		if (e.altKey) {
			pressed.push('alt');
		};
		if (e.ctrlKey) {
			pressed.push('ctrl');
		};
		if (e.metaKey) {
			pressed.push('cmd');
		};

		for (let item of a) {
			const keys = item.split('+').sort();
			for (let k of keys) {
				if (which == KeyCode[k]) {
					pressed.push(k);
				} else
				if (k == key) {
					pressed.push(key);
				};
			};

			pressed = [ ...new Set(pressed) ];

			const check = pressed.sort().join('+');
			if (check == keys.join('+')) {
				res = check;
			};
		};

		if (res) {
			callBack(res);
		};
	};

	ctrlSymbol () {
		const platform = Util.getPlatform();
		return platform == I.Platform.Mac ? '&#8984;' : 'Ctrl';
	};

	ctrlKey () {
		const platform = Util.getPlatform();
		return platform == I.Platform.Mac ? 'cmd' : 'ctrl';
	};
	
};

export enum Key {
	backspace	 = 'backspace',
	tab			 = 'tab',
	enter		 = 'enter',
	shift		 = 'shift',
	escape		 = 'escape',
	space		 = 'space',
	left		 = 'arrowleft',
	up			 = 'arrowup',
	right		 = 'arrowright',
	down		 = 'arrowdown',
	a			 = 'a',
	b			 = 'b',
	c			 = 'c',
	d			 = 'd',
	e			 = 'e',
	i			 = 'i',
	k			 = 'k',
	l			 = 'l',
	n			 = 'n',
	o			 = 'o',
	p			 = 'p',
	s			 = 's',
	v			 = 'v',
	x			 = 'x',
	y			 = 'y',
	z			 = 'z',
	slash		 = '/',
};

export let keyboard: Keyboard = new Keyboard();