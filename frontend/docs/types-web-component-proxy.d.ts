declare module '@wippy-fe/proxy' {
    import * as nanoevents from 'nanoevents';
    import { ConfirmationOptions } from 'primevue/confirmationoptions';
    import * as primevue_toast from 'primevue/toast';
    import * as axios from 'axios';
    import { AxiosDefaults } from 'axios';
    import { addCollection } from '@iconify/vue';

    namespace PageApi {
        interface Page {
            icon: string;
            id: string;
            name: string;
            title: string;
            internal?: string;
            order: number;
            placement?: 'default' | 'bottom';
            hidden?: boolean;
            badge?: string | number;
            badge_icon?: string;
            group?: string;
            group_order?: number;
            group_icon?: string;
            group_placement?: 'default' | 'bottom';
            content_version?: string;
            /** The content of the page artifact, which can be HTML, Markdown, or JSON with wippy specific package.json info */
            content_type?: 'text/html' | 'text/markdown' | 'application/json';
        }
        interface PagesResponse {
            count: number;
            pages: Page[];
            success: boolean;
        }
        interface PageContentResponse {
            content: string;
            success: boolean;
        }
    }

    namespace UploadApi {
        interface Meta {
            filename: string;
            content_sample?: string;
        }
        interface Upload {
            uuid: string;
            created_at: string;
            updated_at: string;
            mime_type: string;
            size: number;
            /**
             * Note `@@local` is not part of the API response, it's a local state when file is still only on user PC
             */
            status: '@@local' | 'uploaded' | 'completed' | 'error' | 'processing';
            meta: Meta;
            error?: string;
        }
        interface ListResponse {
            success: boolean;
            meta: {
                limit: number;
                offset: number;
                total: number;
            };
            uploads: Upload[];
        }
        interface GetResponse {
            success: boolean;
            upload: Upload;
        }
        interface UploadResponse {
            success: boolean;
            uuid: string;
        }
    }

    enum ArtifactStatus {
        PROCESSING = "processing",
        RUNNING = "running",
        IDLE = "idle",
        BUILDING = "building",
        TESTING = "testing",
        ERROR = "error"
    }

    enum ArtifactType {
        INLINE = "inline",
        INLINE_INTERACTIVE = "inline-interactive",
        STANDALONE = "standalone"
    }

    interface Artifact {
        uuid: string;
        title: string;
        description?: string;
        icon?: string;
        type: ArtifactType;
        content_type: 'text/html' | 'text/markdown' | 'application/json';
        content_version?: string;
        status: ArtifactStatus;
    }

    type ArtifactUUID = string;
    type PageUUID = string;
    type SessionUUID = string;
    type EntryUUID = string;
    type MessageUUID = string;
    type ActionCommand = 'navigate' | 'sidebar';

    const WsTopicPrefixes: {
        readonly Pages: "pages";
        readonly Page: "page";
        readonly Artifact: "artifact";
        readonly Welcome: "welcome";
        readonly Update: "update";
        readonly Session: "session";
        readonly SessionOpen: "session.opened";
        readonly SessionClosed: "session.closed";
        readonly Error: "error";
        readonly Upload: "upload";
        readonly Action: "action";
        readonly Registry: "registry";
        readonly RegistryEntry: "entry";
    };

    interface WsTopicTypes {
        Welcome: typeof WsTopicPrefixes.Welcome;
        Artifact: `${typeof WsTopicPrefixes.Artifact}:${ArtifactUUID}`;
        Pages: typeof WsTopicPrefixes.Pages;
        Page: `${typeof WsTopicPrefixes.Page}:${PageUUID}`;
        SessionOpened: typeof WsTopicPrefixes.SessionOpen;
        SessionClosed: typeof WsTopicPrefixes.SessionClosed;
        Session: `${typeof WsTopicPrefixes.Session}:${SessionUUID}`;
        Registry: `${typeof WsTopicPrefixes.Registry}:${string}`;
        RegistryEntry: `${typeof WsTopicPrefixes.RegistryEntry}:${EntryUUID}`;
        Action: `${typeof WsTopicPrefixes.Action}:${ActionCommand}`;
        SessionMessage: `${typeof WsTopicPrefixes.Session}:${SessionUUID}:message:${MessageUUID}`;
        Error: typeof WsTopicPrefixes.Error;
        Upload: `${typeof WsTopicPrefixes.Upload}:${string}`;
    }

    type WsTopic = WsTopicTypes[keyof WsTopicTypes];

    enum WsMessageType {
        CONTENT = "content",
        CHUNK = "chunk",
        USER = "received",
        RESPONSE_STARTED = "response_started",
        INVALIDATE = "invalidate",
        DELEGATION = "delegation",
        TOOL_CALL = "tool_call",
        FUNCTION_CALL = "function_call",
        TOOL_SUCCESS = "tool_success",
        FUNCTION_SUCCESS = "function_success",
        TOOL_ERROR = "tool_error",
        FUNCTION_ERROR = "function_error",
        ERROR = "error",
        ARTIFACT = "artifact"
    }

    interface WsMessageBase {
        topic: WsTopic;
        data?: {
            request_id?: string;
        };
    }

    interface WsMessage_Welcome extends WsMessageBase {
        topic: WsTopicTypes['Welcome'];
        data: {
            request_id?: string;
            active_session_ids: Array<string>;
            active_sessions: number;
            client_count: number;
            user_id: string;
        };
    }

    interface WsMessage_Action extends WsMessageBase {
        topic: WsTopicTypes['Action'];
        data: {
            request_id?: string;
            artifact_uuid?: string;
            artifact_content_type?: string;
            session_uuid?: string;
            path?: string;
        };
    }

    interface WsMessage_Registry extends WsMessageBase {
        topic: WsTopicTypes['Registry'];
        data: {
            request_id?: string;
        };
    }

    interface WsMessage_RegistryEntry extends WsMessageBase {
        topic: WsTopicTypes['RegistryEntry'];
        data: {
            request_id?: string;
            content_version?: string;
        };
    }

    interface WsMessage_Pages extends WsMessageBase {
        topic: WsTopicTypes['Pages'];
    }

    interface WsMessage_Page extends WsMessageBase {
        topic: WsTopicTypes['Page'];
        data: PageApi.Page & {
            request_id?: string;
        };
    }

    interface WsMessage_SessionOpen extends WsMessageBase {
        topic: WsTopicTypes['SessionOpened'];
        data: {
            request_id?: string;
            active_session_ids: Array<string>;
            session_id: string;
        };
    }

    interface WsMessage_Error extends WsMessageBase {
        topic: WsTopicTypes['Error'];
        data: {
            request_id?: string;
            error: string;
            message: string;
        };
    }

    interface WsMessage_SessionClosed extends WsMessageBase {
        topic: WsTopicTypes['SessionClosed'];
        data: {
            request_id?: string;
            active_session_ids: Array<string>;
            session_id: string;
        };
    }

    interface WsMessageDataBase {
        type: WsMessageType;
    }

    interface WsMessageDataChunk extends WsMessageDataBase {
        type: WsMessageType.CHUNK;
        content: string;
    }

    interface WsMessageDataContent extends WsMessageDataBase {
        type: WsMessageType.CONTENT;
        content: string;
        message_id: MessageUUID;
        file_uuids?: string[];
    }

    interface WsMessageDataUser extends WsMessageDataBase {
        type: WsMessageType.USER;
        text: string;
        message_id: MessageUUID;
        file_uuids?: string[];
    }

    interface WsMessageDataDelegation extends WsMessageDataBase {
        type: WsMessageType.DELEGATION;
        from: string;
        to: string;
    }

    interface WsMessageDataInvalidate extends WsMessageDataBase {
        type: WsMessageType.INVALIDATE;
    }

    interface WsMessageDataStarted extends WsMessageDataBase {
        type: WsMessageType.RESPONSE_STARTED;
        message_id: MessageUUID;
    }

    interface WsMessageDataToolCall extends WsMessageDataBase {
        type: WsMessageType.TOOL_CALL | WsMessageType.FUNCTION_CALL;
        function_name: string;
        artifact_id?: string;
    }

    interface WsMessageDataArtifact extends WsMessageDataBase {
        type: WsMessageType.ARTIFACT;
        artifact_id?: string;
    }

    interface WsMessageDataToolSuccess extends WsMessageDataBase {
        type: WsMessageType.TOOL_SUCCESS | WsMessageType.FUNCTION_SUCCESS;
        function_name: string;
        artifact_id?: string;
    }

    interface WsMessageDataToolError extends WsMessageDataBase {
        type: WsMessageType.TOOL_ERROR | WsMessageType.FUNCTION_ERROR;
        function_name: string;
        artifact_id?: string;
    }

    interface WsMessageDataError extends WsMessageDataBase {
        type: WsMessageType.ERROR;
        message: string;
        code: string;
    }

    interface WsMessage_SessionMessage extends WsMessageBase {
        topic: WsTopicTypes['SessionMessage'];
        data: (WsMessageDataUser | WsMessageDataContent | WsMessageDataChunk | WsMessageDataDelegation | WsMessageDataToolCall | WsMessageDataError | WsMessageDataInvalidate | WsMessageDataStarted | WsMessageDataToolSuccess | WsMessageDataArtifact | WsMessageDataToolError) & {
            request_id?: string;
        };
    }

    interface WsMessage_Session extends WsMessageBase {
        topic: WsTopicTypes['Session'];
        data: {
            request_id?: string;
            agent?: string;
            last_message_date?: number;
            model?: string;
            status?: string;
            title?: string;
            type: 'update';
            public_meta?: Array<{
                icon?: string;
                id: string;
                title: string;
                url?: string;
            }>;
        };
    }

    interface WsMessage_Artifact extends WsMessageBase {
        topic: WsTopicTypes['Artifact'];
        data: Partial<Artifact> & {
            request_id?: string;
        };
    }

    interface WsMessage_Upload extends WsMessageBase {
        topic: WsTopicTypes['Upload'];
        data: UploadApi.Upload & {
            request_id?: string;
        };
    }

    type WsMessage = WsMessage_Welcome | WsMessage_Pages | WsMessage_Page | WsMessage_SessionMessage | WsMessage_Session | WsMessage_SessionClosed | WsMessage_Error | WsMessage_Artifact | WsMessage_SessionOpen | WsMessage_Action | WsMessage_Registry | WsMessage_RegistryEntry | WsMessage_Upload;

    type KnownTopics = '@history' | '@visibility' | '@message';
    type Events = {
        '@history': (data: { path: string }) => void;
        '@visibility': (visible: boolean) => void;
        '@message': (data: WsMessage) => void;
    } & {
        [K in string as K extends KnownTopics ? never : K]: (data: WsMessage) => void;
    };

    interface AppFeatures {
        session: {
            type: 'non-persistent' | 'cookie';
        };
        history: 'browser' | 'hash';
        env: {
            APP_API_URL: string;
            APP_AUTH_API_URL: string;
            APP_WEBSOCKET_URL: string;
        };
        axiosDefaults?: Partial<AxiosDefaults>;
        routePrefix?: string;
        showAdmin?: boolean;
        allowSelectModel?: boolean;
        startNavOpen?: boolean;
        hideNavBar?: boolean;
        disableRightPanel?: boolean;
    }

    interface AppAuthConfig {
        token: string;
        expiresAt: string;
    }

    interface AppCustomization {
        customCSS?: string;
        cssVariables?: Record<string, string>;
        i18n?: Record<string, unknown>;
        icons?: Record<string, {
            body: string;
            width: number;
            height: number;
        }>;
    }

    interface AppConfig {
        artifactId?: string;
        path?: string;
        feature?: AppFeatures;
        auth: AppAuthConfig;
        customization?: AppCustomization;
    }

    interface FormState {
        data?: Record<string, unknown>;
        status: 'active' | 'inactive';
    }

    interface FormResult {
        success: boolean;
        message?: string;
        errors?: Record<string, string>;
    }

    type LimitedConfirmationOptions = Omit<ConfirmationOptions, 'target' | 'appendTo' | 'onShow' | 'onHide'>;

    // Host CSS URLs
    const fontCssUrl: string;
    const iframeCssUrl: string;
    const markdownCssUrl: string;
    const primeVueCssUrl: string;
    const themeConfigUrl: string;

    namespace hostCssRaw {
        export { fontCssUrl, iframeCssUrl, markdownCssUrl, primeVueCssUrl, themeConfigUrl };
    }

    // Main exports
    const resolvers: {
        readonly api: axios.AxiosInstance;
        readonly host: {
            toast: (message: primevue_toast.ToastMessageOptions) => void;
            confirm: (options: LimitedConfirmationOptions) => Promise<boolean>;
            startChat: (start_token: string, options?: { sidebar?: boolean }) => void;
            openSession: (sessionUUID: string, options?: { sidebar?: boolean }) => void;
            openArtifact: (artifactUUID: string, options?: { target: "modal" | "sidebar" }) => void;
            navigate: (url: string) => void;
            onRouteChanged: (internalRoute: string) => void;
            handleError: (code: ("auth-expired" | "other"), error: Record<string, unknown>) => void;
            setContext: (context: Record<string, unknown>, sessionUUID?: string, source?: {
                type: "page" | "artifact";
                uuid: string;
                instanceUUID?: string;
            }) => void;
            formatUrl: (relativeUrl: string) => string;
            logout: () => void;
        };
        /** @deprecated, use `host` instead */
        readonly iframe: {
            toast: (message: primevue_toast.ToastMessageOptions) => void;
            confirm: (options: LimitedConfirmationOptions) => Promise<boolean>;
            startChat: (start_token: string, sidebar?: boolean) => void;
            openSession: (sessionUUID: string, sidebar?: boolean) => void;
            openArtifact: (artifactUUID: string, target: "modal" | "sidebar") => void;
            navigate: (url: string) => void;
            handleError: (code: ("auth-expired" | "other"), error: Record<string, unknown>) => void;
            setContext: (context: Record<string, unknown>, source?: {
                type: "page" | "artifact";
                uuid: string;
            }) => void;
            formatUrl: (relativeUrl: string) => string;
            logout: () => void;
        };
        readonly on: <T extends string>(topicPattern: T, callback: T extends "@history" | "@visibility" | "@message" ? Events[T] : Events["@message"]) => nanoevents.Unsubscribe;
        readonly config: AppConfig;
        /** @deprecated, use direct api calls instead */
        readonly form: {
            get: () => Promise<FormState>;
            submit: (data: FormData | Record<string, unknown>) => Promise<FormResult>;
        };
        readonly loadWebComponent: (componentId: string, tagName?: string) => Promise<void>;
        hostCss: typeof hostCssRaw;
        tailwindConfig: {
            content: string[];
            theme: {
                extend: {
                    colors: {
                        secondary: Record<string, string>;
                    };
                };
            };
            plugins: unknown[];
        };
        /**
         * Automatically defines a web component based on the import meta URL if imported with `declare-tag` in the query parameters.
         */
        define: (importMetaUrl: string, ComponentClass: typeof HTMLElement) => void;
        loadCss: (cssUrl: string) => Promise<string>;
        addIcons: (addCollectionFn: typeof addCollection) => void;
    };

    // Named exports
    const define: (importMetaUrl: string, ComponentClass: typeof HTMLElement) => void;
    const api: axios.AxiosInstance;
    const host: {
        toast: (message: primevue_toast.ToastMessageOptions) => void;
        confirm: (options: LimitedConfirmationOptions) => Promise<boolean>;
        startChat: (start_token: string, options?: { sidebar?: boolean }) => void;
        openSession: (sessionUUID: string, options?: { sidebar?: boolean }) => void;
        openArtifact: (artifactUUID: string, options?: { target: "modal" | "sidebar" }) => void;
        navigate: (url: string) => void;
        onRouteChanged: (internalRoute: string) => void;
        handleError: (code: ("auth-expired" | "other"), error: Record<string, unknown>) => void;
        setContext: (context: Record<string, unknown>, sessionUUID?: string, source?: {
            type: "page" | "artifact";
            uuid: string;
            instanceUUID?: string;
        }) => void;
        formatUrl: (relativeUrl: string) => string;
        logout: () => void;
    };
    const iframe: {
        toast: (message: primevue_toast.ToastMessageOptions) => void;
        confirm: (options: LimitedConfirmationOptions) => Promise<boolean>;
        startChat: (start_token: string, sidebar?: boolean) => void;
        openSession: (sessionUUID: string, sidebar?: boolean) => void;
        openArtifact: (artifactUUID: string, target: "modal" | "sidebar") => void;
        navigate: (url: string) => void;
        handleError: (code: ("auth-expired" | "other"), error: Record<string, unknown>) => void;
        setContext: (context: Record<string, unknown>, source?: {
            type: "page" | "artifact";
            uuid: string;
        }) => void;
        formatUrl: (relativeUrl: string) => string;
        logout: () => void;
    };
    const on: <T extends string>(topicPattern: T, callback: T extends "@history" | "@visibility" | "@message" ? Events[T] : Events["@message"]) => nanoevents.Unsubscribe;
    const config: AppConfig;
    const form: {
        get: () => Promise<FormState>;
        submit: (data: FormData | Record<string, unknown>) => Promise<FormResult>;
    };
    const hostCss: typeof hostCssRaw;
    const loadCss: (cssUrl: string) => Promise<string>;
    const tailwindConfig: {
        content: string[];
        theme: {
            extend: {
                colors: {
                    secondary: Record<string, string>;
                };
            };
        };
        plugins: unknown[];
    };
    const loadWebComponent: (componentId: string, tagName?: string) => Promise<void>;
    const addIcons: (addCollectionFn: typeof addCollection) => void;

    export {
        addIcons,
        api,
        config,
        resolvers as default,
        define,
        form,
        host,
        hostCss,
        iframe,
        loadCss,
        loadWebComponent,
        on,
        tailwindConfig
    };
}
