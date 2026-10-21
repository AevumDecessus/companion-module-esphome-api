import type ModuleInstance from './main.js'
import { CompanionFeedbackDefinitions } from '@companion-module/base'
import { EntityAdapters } from './entityAdapters/index.js'
import { EsphomeWrapper } from './esphomeWrapper.js'

export type FeedbacksSchema = Record<string, any>

export function UpdateFeedbacks(_: ModuleInstance): void {}

export function GetFeedbacksList(client: EsphomeWrapper): CompanionFeedbackDefinitions {
	const feedbacks = {}

	Object.values(EntityAdapters).forEach((adapter) => {
		Object.assign(feedbacks, adapter.createFeedbacks(client))
	})

	return feedbacks
}
