import { CompanionActionDefinitions, CompanionFeedbackDefinitions } from '@companion-module/base'
import { EsphomeWrapper } from '../esphomeWrapper.js'

export interface EntityAdapter<T> {
	is(instance: unknown): instance is T
	createActions(client: EsphomeWrapper): CompanionActionDefinitions
	createFeedbacks(client: EsphomeWrapper): CompanionFeedbackDefinitions
}
