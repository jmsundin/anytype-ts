import { Mapper, Decode } from 'ts/lib';

const DebugSync = (response: any) => {
	return response.toObject();
};

const ConfigGet = (response: any) => {
	return {
		homeBlockId: response.getHomeblockid(),
		profileBlockId: response.getProfileblockid(),
		gatewayUrl: response.getGatewayurl(),
		marketplaceTypeId: response.getMarketplacetypeid(),
		marketplaceTemplateId: response.getMarketplacetemplateid(),
		marketplaceRelationId: response.getMarketplacerelationid(),
		deviceId: response.getMarketplacerelationid(),
	};
};

const Export = (response: any) => {
	return {
		path: response.getPath(),
	};
};

const FileListOffload = (response: any) => {
	return {
		files: response.getFilesoffloaded(),
		bytes: response.getBytesoffloaded(),
	};
};

const LinkPreview = (response: any) => {
	return {
		previewLink: response.hasLinkpreview() ? Mapper.From.PreviewLink(response.getLinkpreview()) : {},
	};
};

const UploadFile = (response: any) => {
	return {
		hash: response.getHash(),
	};
};

const DownloadFile = (response: any) => {
	return {
		path: response.getLocalpath(),
	};
};

const WalletCreate = (response: any) => {
	return {
		mnemonic: response.getMnemonic(),
	};
};

const WalletConvert = (response: any) => {
	return {
		mnemonic: response.getMnemonic(),
		entropy: response.getEntropy(),
	};
};

const AccountCreate = (response: any) => {
	return {
		account: Mapper.From.Account(response.getAccount()),
	};
};

const AccountSelect = (response: any) => {
	return {
		account: Mapper.From.Account(response.getAccount()),
	};
};

const AccountDelete = (response: any) => {
	return {
		status: response.hasStatus() ? Mapper.From.AccountStatus(response.getStatus()) : null,
	};
};

const PageCreate = (response: any) => {
	return {
		pageId: response.getPageid(),
	};
};

const NavigationGetObjectInfoWithLinks = (response: any) => {
	const object = response.getObject();
	const links = object.getLinks();

	return {
		object: {
			id: object.getId(),
			info: Mapper.From.ObjectInfo(object.getInfo()),
			links: {
				inbound: (links.getInboundList() || []).map(Mapper.From.ObjectInfo),
				outbound: (links.getOutboundList() || []).map(Mapper.From.ObjectInfo),
			},
		},
	};
};

const BlockGetPublicWebURL = (response: any) => {
	return {
		url: response.getUrl(),
	};
};

const ObjectShow = (response: any) => {
	return {
		rootId: response.getRootid(),
		blocks: (response.getBlocksList() || []).map(Mapper.From.Block),
		details: (response.getDetailsList() || []).map(Mapper.From.Details),
		objectTypes: (response.getObjecttypesList() || []).map(Mapper.From.ObjectType),
		relations: (response.getRelationsList() || []).map(Mapper.From.Relation),
		restrictions: Mapper.From.Restrictions(response.getRestrictions()),
	};
};

const BlockOpenBreadcrumbs = (response: any) => {
	return {
		blockId: response.getBlockid(),
	};
};

const BlockCreate = (response: any) => {
	return {
		blockId: response.getBlockid(),
	};
};

const BlockCreatePage = (response: any) => {
	return {
		blockId: response.getBlockid(),
		targetId: response.getTargetid(),
	};
};

const BlockCreateSet = (response: any) => {
	return {
		blockId: response.getBlockid(),
		targetId: response.getTargetid(),
	};
};

const BlockSplit = (response: any) => {
	return {
		blockId: response.getBlockid(),
	};
};

const BlockBookmarkCreateAndFetch = (response: any) => {
	return {
		blockId: response.getBlockid(),
	};
};

const BlockFileCreateAndUpload = (response: any) => {
	return {
		blockId: response.getBlockid(),
	};
};

const BlockCopy = (response: any) => {
	return {
		textSlot: response.getTextslot(),
		htmlSlot: response.getHtmlslot(),
		anySlot: response.getAnyslotList(),
	};
};

const BlockCut = (response: any) => {
	return {
		textSlot: response.getTextslot(),
		htmlSlot: response.getHtmlslot(),
		anySlot: response.getAnyslotList(),
	};
};

const BlockPaste = (response: any) => {
	return {
		blockIds: response.getBlockidsList(),
		caretPosition: response.getCaretposition(),
		isSameBlockCaret: response.getIssameblockcaret(),
	};
};

const BlockImportMarkdown = (response: any) => {
	return {
		rootLinkIds: response.getRootlinkidsList(),
	};
};

const BlockListMoveToNewPage = (response: any) => {
	return {
		linkId: response.getLinkid(),
	};
};

const BlockListDuplicate = (response: any) => {
	return {
		blockIds: response.getBlockidsList(),
	};
};

const BlockListConvertChildrenToPages = (response: any) => {
	return {
		linkIds: response.getLinkidsList(),
	};
};

const BlockDataviewViewCreate = (response: any) => {
	return {
		viewId: response.getViewid(),
	};
};

const BlockDataviewRecordCreate = (response: any) => {
	return {
		record: Mapper.From.Record(response.getRecord()),
	};
};

const BlockDataviewRelationAdd = (response: any) => {
	return {
		relationKey: response.getRelationkey(),
	};
};

const BlockDataviewRelationListAvailable = (response: any) => {
	return {
		relations: (response.getRelationsList() || []).map(Mapper.From.Relation),
	};
};

const BlockDataviewRecordRelationOptionAdd = (response: any) => {
	return {
		option: Mapper.From.SelectOption(response.getOption()),
	};
};

const HistoryVersions = (response: any) => {
	return {
		versions: (response.getVersionsList() || []).map(Mapper.From.HistoryVersion),
	};
};

const HistoryShow = (response: any) => {
	const version = response.getVersion();
	return {
		version: version ? Mapper.From.HistoryVersion(response.getVersion()) : null,
		objectShow: ObjectShow(response.getObjectshow()),
	};
};

const ObjectTypeList = (response: any) => {
	return {
		objectTypes: (response.getObjecttypesList() || []).map(Mapper.From.ObjectType),
	};
};

const ObjectTypeCreate = (response: any) => {
	return {
		objectType: Mapper.From.ObjectType(response.getObjecttype()),
	};
};

const ObjectTypeRelationAdd = (response: any) => {
	return {
		relations: (response.getRelationsList() || []).map(Mapper.From.Relation),
	};
};

const SetCreate = (response: any) => {
	return {
		id: response.getId(),
	};
};

const ObjectSearch = (response: any) => {
	return {
		records: (response.getRecordsList() || []).map(Decode.decodeStruct),
	};
};

const ObjectSearchSubscribe = (response: any) => {
	const counters = response.getCounters();
	return {
		counters: {
			total: counters.getTotal(),
			nextCount: counters.getNextcount(),
			prevCount: counters.getPrevcount(),
		},
		records: (response.getRecordsList() || []).map(Decode.decodeStruct),
		dependencies: (response.getDependenciesList() || []).map(Decode.decodeStruct),
	};
};

const ObjectIdsSubscribe = (response: any) => {
	return {
		records: (response.getRecordsList() || []).map(Decode.decodeStruct),
		dependencies: (response.getDependenciesList() || []).map(Decode.decodeStruct),
	};
};

const ObjectGraph = (response: any) => {
	return {
		edges: (response.getEdgesList() || []).map(Mapper.From.GraphEdge),
		nodes: (response.getNodesList() || []).map(Decode.decodeStruct),
	};
};

const ObjectRelationAdd = (response: any) => {
	return {
		relation: Mapper.From.Relation(response.getRelation()),
	};
};

const ObjectRelationListAvailable = (response: any) => {
	return {
		relations: (response.getRelationsList() || []).map(Mapper.From.Relation),
	};
};

const ObjectRelationOptionAdd = (response: any) => {
	return {
		option: Mapper.From.SelectOption(response.getOption()),
	};
};

const ObjectToSet = (response: any) => {
	return {
		id: response.getSetid(),
	};
};

const ObjectShareByLink = (response: any) => {
	return {
		link: response.getLink(),
	};
};

const ObjectListDuplicate = (response: any) => {
	return {
		ids: response.getIdsList(),
	};
};

const MakeTemplate = (response: any) => {
	return {
		id: response.getId(),
	};
};

const MakeTemplateByObjectType = (response: any) => {
	return {
		id: response.getId(),
	};
};

const CloneTemplate = (response: any) => {
	return {
		id: response.getId(),
	};
};

const WorkspaceCreate = (response: any) => {
	return {
		id: response.getWorkspaceid(),
	};
};

const UnsplashSearch = (response: any) => {
	return {
		pictures: (response.getPicturesList() || []).map(Mapper.From.UnsplashPicture),
	};
};

const UnsplashDownload = (response: any) => {
	return {
		hash: response.getHash(),
	};
};

export {
	DebugSync,

	ConfigGet,
	Export,
	UploadFile,
	DownloadFile,
	LinkPreview,
	FileListOffload,

	WalletCreate,
	WalletConvert,

	AccountCreate,
	AccountSelect,
	AccountDelete,

	PageCreate,
	SetCreate,

	NavigationGetObjectInfoWithLinks,

	BlockGetPublicWebURL,

	BlockOpenBreadcrumbs,
	
	BlockSplit,
	BlockCopy,
	BlockCut,
	BlockPaste,

	BlockFileCreateAndUpload,
	BlockBookmarkCreateAndFetch,
	
	BlockImportMarkdown,

	BlockCreate,
	BlockCreatePage,
	BlockDataviewViewCreate,
	BlockCreateSet,

	BlockDataviewRecordCreate,

	BlockDataviewRelationAdd,
	BlockDataviewRelationListAvailable,

	BlockDataviewRecordRelationOptionAdd,

	BlockListMoveToNewPage,
	BlockListDuplicate,
	BlockListConvertChildrenToPages,

	HistoryVersions,
	HistoryShow,

	ObjectShow,

	ObjectTypeList,
	ObjectTypeCreate,
	ObjectTypeRelationAdd,

	ObjectSearch,
	ObjectSearchSubscribe,
	ObjectIdsSubscribe,
	ObjectGraph,
	ObjectRelationAdd,
	ObjectRelationListAvailable,
	ObjectRelationOptionAdd,
	ObjectToSet,
	ObjectShareByLink,

	ObjectListDuplicate,

	MakeTemplate,
	MakeTemplateByObjectType,
	CloneTemplate,

	WorkspaceCreate,

	UnsplashSearch,
	UnsplashDownload,
};
