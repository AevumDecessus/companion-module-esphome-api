import { CompanionActionDefinitions, CompanionFeedbackDefinitions } from '@companion-module/base'
import { BinarySensorEntity } from 'esphome-client'
import { EsphomeWrapper } from '../esphomeWrapper.js'
import { EntityAdapter } from './base.js'
import { FeedbackId } from '../util.js'

export const BinarySensorAdapter: EntityAdapter<BinarySensorEntity> = {
	is: (instance: unknown): instance is BinarySensorEntity => {
		return typeof instance === 'object' && instance !== null && (instance as any).type === 'binary_sensor'
	},

	createActions: (_client: EsphomeWrapper): CompanionActionDefinitions => {
		return {}
	},

	createFeedbacks: (client: EsphomeWrapper): CompanionFeedbackDefinitions => {
		const feedbacks: CompanionFeedbackDefinitions = {}
		const binarySensors = client.getAvailableEntityIds()['binary_sensor'] || []
		if (binarySensors.length) {
			binarySensors.forEach((entityId: string) => {
				feedbacks[FeedbackId.BinarySensorState + entityId] = {
					type: 'boolean',
					name: `${entityId}: Change from binary sensor state`,
					description: 'If the binary sensor state matches the rule, change style of the bank',
					options: [
						{
							type: 'dropdown',
							label: 'Entity',
							id: 'entity_id',
							default: entityId,
							choices: [{ id: entityId, label: entityId }],
						},
					],
					defaultStyle: { color: 0, bgcolor: 16777215 },
					callback: (feedback): boolean => {
						const event = client.latest(feedback.options.entity_id as string)
						if (!event || !event.data) return false
						return event.data.isOn === feedback.options.state
					},
				}
			})
		}
		return feedbacks
	},
}
