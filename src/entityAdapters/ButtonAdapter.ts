import { CompanionActionDefinitions, CompanionFeedbackDefinitions } from '@companion-module/base'
import { ButtonEntity } from 'esphome-client'
import { EsphomeWrapper } from '../esphomeWrapper.js'
import { EntityAdapter } from './base.js'
import { ActionId } from '../util.js'

export const ButtonAdapter: EntityAdapter<ButtonEntity> = {
	is: (instance: unknown): instance is ButtonEntity => {
		return typeof instance === 'object' && instance !== null && (instance as any).type === 'button'
	},

	createActions: (client: EsphomeWrapper): CompanionActionDefinitions => {
		const actions: CompanionActionDefinitions = {}
		const buttonEntities = client.getAvailableEntityIds()['button'] || []
		if (buttonEntities.length) {
			buttonEntities.forEach((entityId: string) => {
				actions[ActionId.ButtonPush] = {
					name: 'Push Button',
					options: [
						{
							type: 'dropdown',
							label: 'Entity',
							id: 'entity_id',
							default: entityId,
							choices: [{ id: entityId, label: entityId }],
						},
					],
					callback: (evt): void => {
						console.log('[ButtonAdapter] Push button:', evt.options.entity_id)
					},
				}
			})
		}
		return actions
	},

	createFeedbacks: (_client: EsphomeWrapper): CompanionFeedbackDefinitions => {
		return {}
	},
}
