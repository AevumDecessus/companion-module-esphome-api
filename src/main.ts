import { InstanceBase, InstanceStatus, type SomeCompanionConfigField } from '@companion-module/base'
import { EsphomeWrapper } from './esphomeWrapper.js'
import { ModuleConfig, GetConfigFields } from './config.js'
import { ActionsSchema, GetActionsList, UpdateActions } from './actions.js'
import { UpdateFeedbacks, GetFeedbacksList, type FeedbacksSchema } from './feedback.js'
import { UpdateVariableDefinitions, type VariablesSchema } from './variables.js'
import { UpdatePresets } from './presets.js'

export type ModuleSchema = {
	config: ModuleConfig
	secrets: undefined
	actions: ActionsSchema
	feedbacks: FeedbacksSchema
	variables: VariablesSchema
}

export default class ESPHomeInstance extends InstanceBase<ModuleSchema> {
	private readonly wrapper: EsphomeWrapper = new EsphomeWrapper('127.0.0.1', 6053)
	private config!: ModuleConfig

	constructor(internal: unknown) {
		super(internal)

		this.setupEventListeners()
	}

	setupEventListeners(): void {
		// Subscribe to wrapper events for lifecycle management
		this.wrapper.on('connected', () => {
			this.updateStatus(InstanceStatus.Ok)
			console.log('[ESPHome] Connected successfully')
			void this.initClient(this.config)
		})

		this.wrapper.on('disconnected', (reason?: string) => {
			this.updateStatus(InstanceStatus.Disconnected)
			console.log('[ESPHome] Disconnected:', reason)
		})

		this.wrapper.on('refreshEntities', async () => {
			await this.refreshCompanionInstances()
		})

		// Use wrapper's built-in warn/error methods instead of event listeners
	}

	updateFeedbacks(): void {
		UpdateFeedbacks(this)
	}

	updateActions(): void {
		UpdateActions(this)
	}

	updatePresets(): void {
		UpdatePresets(this)
	}

	updateVariableDefinitions(): void {
		UpdateVariableDefinitions(this)
	}

	getConfigFields(): SomeCompanionConfigField[] {
		return GetConfigFields()
	}

	async init(config: ModuleConfig): Promise<void> {
		this.config = config
		await this.initClient(config)
		this.updateActions()
		this.updateFeedbacks()
		this.updateVariableDefinitions()
		this.updatePresets()
	}

	private async initClient(config: ModuleConfig): Promise<void> {
		if (config.host && config.port && config.password) {
			console.log('[ESPHome] Connecting to', config.host, 'port', config.port)
			await this.wrapper.connect(config.host, config.port, config.password).catch((err) => {
				console.error('[ESPHome] Connection failed:', err)
			})
		} else {
			this.wrapper.disconnect()
		}
	}

	private async refreshCompanionInstances(): Promise<void> {
		this.setActionDefinitions(GetActionsList(this.wrapper))
		this.setFeedbackDefinitions(GetFeedbacksList(this.wrapper))
	}

	public async configUpdated(config: ModuleConfig): Promise<void> {
		let resetConnection = false

		if (
			!this.config ||
			this.config.host != config.host ||
			this.config.port != config.port ||
			this.config.password != config.password
		) {
			resetConnection = true
		}

		this.config = config

		if (resetConnection === true) {
			console.log('[ESPHome] Config changed, reconnecting')
			await this.initClient(config)
		}
	}

	public async destroy(): Promise<void> {
		console.log('[ESPHome] Destroying wrapper')
		this.wrapper.disconnect()
		this.log('debug', 'destroy')
	}
}
