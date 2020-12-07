import { createEnhancedElement } from '@servicenow/library-enhanced-element';
import {
	extensionSplit,
	filterAriaAttributes
} from '@servicenow/library-enhanced-utils';
import { Fragment } from '@servicenow/ui-renderer-snabbdom';
import styles from './_now-dropdown.scss';
import { getFocusedEl, getTriggerEl } from './utils/elements.js';
import keyBindingBehavior from '@servicenow/behavior-key-binding';
import focusBehavior from '@servicenow/behavior-focus';
import '@servicenow/now-icon';
import '@servicenow/now-tooltip';
import './swf-dropdown-list';
import { t } from '@servicenow/library-translate';
import { itemsSchema } from './schemas/dropdown-schema';
import { constrainSchema } from '@servicenow/behavior-fit';

const renderDropdownTrigger = ({
	label,
	icon,
	presence,
	count,
	disabled,
	variant,
	size,
	bare,
	hideCaret,
	onClick,
	updateState,
	opened,
	tooltipContent,
	fitTarget,
	hideLabel,
	showPadding,
	configAria,
	componentId
}) => {
	const setFitTarget = (ref) => setTimeout(() => updateState({ fitTarget: ref }));
	const hasLabel = label && !hideLabel;

	let renderIcon = '';
	if (presence) {
		renderIcon = (
			<now-icon-presence
				presence={presence}
				size={size}
				class={{
					'now-m-inline-end--xxs': hasLabel && size !== 'lg',
					'now-m-inline-end--xs': hasLabel && size === 'lg'
				}}
			/>
		);
	} else if (icon) {
		renderIcon = (
			<now-icon
				icon={icon}
				size={size}
				class={{
					'now-m-inline-end--xxs': hasLabel && size !== 'lg',
					'now-m-inline-end--xs': hasLabel && size === 'lg'
				}}
			/>
		);
	}
	const renderTooltip = tooltipContent ? (
		<now-tooltip
			id={`tooltip-${componentId}`}
			target-ref={fitTarget}
			content={tooltipContent}
		/>
	) : (
			undefined
		);
	const renderLabel = hasLabel ? (
		<span
			class={{
				'now-dropdown-label': true,
				'now-m-inline-start--xxs': icon
			}}
			title={label}>
			{label}
		</span>
	) : (
			<span />
		);
	const renderCount = count ? `\u00A0(${count})` : undefined;
	const renderCaret = hideCaret ? (
		''
	) : (
			<now-icon
				class={{
					'now-m-inline-start--xxs': hasLabel && size !== 'lg',
					'now-m-inline-start--xs': hasLabel && size === 'lg'
				}}
				size={size}
				icon="caret-down-fill"
			/>
		);

	return (
		<Fragment>
			<button
				type="button"
				id={`trigger-${componentId}`}
				class={{
					'now-dropdown': true,
					...(!disabled ? extensionSplit(variant) : {}),
					['-' + size]: size,
					'is-bare':
						bare &&
						(variant === 'secondary' ||
							variant === 'secondary-selected' ||
							variant === 'tertiary' ||
							variant === 'inherit'),
					'is-disabled': disabled,
					'has-label': !hideLabel && label,
					'has-caret': !hideCaret,
					'is-active': opened,
					'show-padding': showPadding
				}}
				disabled={disabled}
				on-click={onClick}
				on-keyup={(e) => e.preventDefault()}
				hook-insert={({ elm }) => setFitTarget(elm)}
				hook-destroy={() => setFitTarget(null)}
				{...filterAriaAttributes(configAria)}
				aria-haspopup="listbox"
				aria-expanded={opened ? 'true' : 'false'}
				aria-describedby={
					tooltipContent ? `tooltip-${componentId}` : undefined
				}>
				<slot name="trigger-content">
					{renderIcon}
					<span className="now-line-height-crop">
						<span className="now-align">
							{renderLabel}
							{renderCount}
						</span>
					</span>
					{renderCaret}
				</slot>
			</button>
			{renderTooltip}
		</Fragment>
	);
};

const getSelected = (items, selectedItemId) => {
	const hasNestedChildren = items.some((item) =>
		item.hasOwnProperty('children')
	);
	if (hasNestedChildren) {
		return items
			.reduce(
				(acc, item) =>
					Array.isArray(item.children)
						? [...acc, ...item.children]
						: [...acc, item],
				[]
			)
			.find((item) => item.id === selectedItemId);
	} else {
		return items.find((item) => selectedItemId === item.id);
	}
};

const getTriggerLabel = (placeholder, selected, selectedItems) => {
	if (Array.isArray(selectedItems) && selectedItems.length > 1) {
		return t('{0} items selected', selectedItems.length);
	} else if (selected) {
		return selected.label;
	}
	return placeholder;
};

const getTriggerIcon = (icon, selected) => {
	if (selected && selected.icon) {
		return selected.icon.replace('outline', 'fill');
	}
	if (selected && selected.presence) {
		return 'presence-fill';
	}
	return icon;
};

const view = (state, { dispatch, updateState }) => {
	const { componentId } = state;
	const {
		opened,
		select,
		items,
		selectedItems,
		placeholder,
		icon,
		disabled,
		variant,
		size,
		bare,
		hideCaret,
		tooltipContent,
		panelFitProps = {},
		hideLabel,
		showPadding,
		configAria,
		search
	} = state.properties;

	const { fitTarget } = state;

	const onToggleOpened = (evt) => {

		if (!disabled) {
			evt.preventDefault();
			dispatch(({ properties }) => {
				return {
					type: 'SWF_DROPDOWN#OPENED_SET',
					payload: { value: !properties.opened }
				};
			});
		}
	};

	let selected;
	if (Array.isArray(selectedItems) && selectedItems.length === 1) {
		selected = getSelected(items, selectedItems[0]);
	}

	return (
		<Fragment>
			{renderDropdownTrigger({
				label: getTriggerLabel(placeholder, selected, selectedItems),
				icon: getTriggerIcon(icon, selected),
				presence: selected && selected.presence ? selected.presence : undefined,
				count: selected && selected.count ? selected.count : undefined,
				disabled,
				variant,
				size,
				bare,
				hideCaret,
				onClick: onToggleOpened,
				updateState,
				opened,
				tooltipContent,
				fitTarget,
				hideLabel,
				showPadding,
				configAria,
				componentId
			})}
			<swf-dropdown-list
				search={search}
				id={`panel-${componentId}`}
				items={items}
				selected-items={selectedItems}
				select={select}
				opened={opened}
				target-ref={fitTarget}
				position={panelFitProps.position}
				offset={panelFitProps.offset}
				container={panelFitProps.container}
				constrain={panelFitProps.constrain}
			/>
		</Fragment>
	);
};


createEnhancedElement('swf-dropdown', {
	properties: {
		/**
		 * An array of `DropdownItem` or `DropdownSection` items.
		 * @type {(Array.<DropdownItem> | Array.<DropdownSection>)}
		 */
		items: {
			required: true,
			schema: itemsSchema,
			default: [{ id: "1", label: "Alaska" }, { id: "2", label: "Alaska2" }] //{ id: "1", label: "Alaska" }, { id: "2", label: "Alaska2" }
		},
		/**
		 * An array of ids representing selected dropdown panel items. If multi-select mode is
		 * not enabled, each time the user selects a list item, the previously selected
		 * id will be replaced with the new id. If multi-select mode is
		 * enabled, ids will be added to or removed from the list.
		 * Use `manage-selected-items` to override the default behavior and handle the
		 * `SWF_DROPDOWN_LIST#SELECTED_ITEMS_SET` action manually.
		 * @type {Array.<(string|number)>}
		 */
		selectedItems: {
			default: [],
			manageable: true,
			schema: { type: 'array', items: { type: ['string', 'number'] } }
		},

		search: {
			default: 'none',
			schema: {
				type: 'string',
				enum: ['none', 'managed', 'initial', 'contains']
			}
		},
		/**
		 * Determines what happens when the user selects a dropdown item.
		 * Choose from the following:
		 * - "single" (default) - the panel is closed, the trigger label is updated with
		 *   the label of the selected list item, and the list item is marked as selected.
		 * - "multi" - the panel stays open, the trigger label is updated with the selected
		 *    list item count, and the list item's selected state is toggled on/off.
		 * - "none" - the panel is closed, the trigger label is not updated, and the
		 *   list item is not marked as selected.
		 * When using the "single" or "multi" option, handle the `SWF_DROPDOWN_LIST#SELECTED_ITEMS_SET`
		 * action manually. When using the "none" option, handle the `SWF_DROPDOWN_LIST#ITEM_CLICKED` action manually.
		 * @type {("single"|"multi"|"none")}
		 */
		select: {
			default: 'single',
			schema: { type: 'string', enum: ['single', 'multi', 'none'] }
		},
		/**
		 * Automatically updates when the user opens or closes the dropdown.
		 * Use `manage-opened` to override the default behavior and handle the
		 * `SWF_DROPDOWN#OPENED_SET` action manually.
		 * @type {boolean}
		 */
		opened: { default: false, manageable: true, schema: { type: 'boolean' } },
		/**
		 * The fallback label displays when no items are selected. If you do not
		 * specify a placeholder value, especially in the case of iconic
		 * dropdowns, provide `tooltipContent` and/or an `aria-label`
		 * via the `configAria` properties.
		 * @type {string}
		 */
		placeholder: { default: '(empty)', schema: { type: 'string' } },
		/**
		 * Enable to show the dropdown as visually disabled and to stop the dropdown
		 * from opening when the user interacts with it.
		 * @type {boolean}
		 */
		disabled: { default: false, schema: { type: 'boolean' } },
		/**
		 * Placeholder icon to include in the dropdown trigger. This icon will be replaced by
		 * the icon of a selected dropdown item if the item has an icon configured.
		 * @type {string}
		 */
		icon: { schema: { type: 'string' } },
		/**
		 * Sets the button styles of the dropdown trigger.
		 * @type {("primary"|"secondary"|"secondary-selected"|"tertiary"|"tertiary-selected"|"inherit")}
		 */
		variant: {
			default: 'secondary',
			schema: {
				type: 'string',
				enum: [
					'primary',
					'secondary',
					'secondary-selected',
					'tertiary',
					'tertiary-selected',
					'inherit'
				]
			}
		},
		/**
		 * Sets the button size of the dropdown trigger.
		 * @type {("sm"|"md"|"lg")}
		 */
		size: { default: 'md', schema: { type: 'string', enum: ['sm', 'md', 'lg'] } },
		/**
		 * Makes the dropdown trigger border and background transparent, but retains
		 * its `variant` style setting when an iconic button. If button is text or
		 * text with an icon then only works when `variant` is `secondary`,
		 * `tertiary`, or `inherit`.
		 * @type {boolean}
		 */
		bare: { default: false, schema: { type: 'boolean' } },
		/**
		 * Hides the triangular caret icon that appears in the dropdown trigger by
		 * default.
		 * @type {boolean}
		 */
		hideCaret: { default: false, schema: { type: 'boolean' } },
		/**
		 * Text shown inside the tooltip
		 * @type {string}
		 */
		tooltipContent: { schema: { type: 'string' } },
		/**
		 * Properties to configure the dropdown panel.
		 *
		 * Valid keys are:
		 *	- position,
		 *	- container
		 *	- constrain
		 *
		 * Each of these keys are used to control how the panel is positioned and
		 * scaled relative to the dropdown target.
		 *
		 * @see Fit behavior for more information on each property and valid
		 * values.
		 *
		 * @type {{ position: Array<string>, container: HTMLElement, constrain: object }}
		 */
		panelFitProps: {
			default: {},
			schema: {
				type: 'object',
				properties: {
					position: { type: 'array', items: { type: 'string' } },
					offset: {
						oneOf: [{ type: 'number' }, { type: 'array', items: { type: 'number' } }]
					},
					container: { type: 'object' },
					constrain: constrainSchema
				}
			}
		},
		/**
		 * Set this flag to suppress a visual indication of
		 * the selected item(s). By default, the dropdown displays
		 * the selected item or a count of selected items in place of the
		 * `placeholder` text in the label of the dropdown trigger.
		 * @type {boolean}
		 */
		hideLabel: { default: false, schema: { type: 'boolean' } },
		/**
		 * Set this flag to always include side padding on bare buttons.
		 * By default, bare buttons with labels do not have side padding.
		 * @type {boolean}
		 */
		showPadding: { default: false, schema: { type: 'boolean' } },
		/**
		 * An object whose items, all aria properties, will be set on the inner
		 * html `<button>`.
		 * See https://www.w3.org/TR/wai-aria-1.1/#button for properties and
		 * accepted values.
		 * @type {{ 'aria-*': string }}
		 */
		configAria: {
			schema: {
				type: 'object',
				patternProperties: {
					'^aria-': { type: 'string' }
				},
				additionalProperties: false
			}
		}
	},
	view,
	styles,
	actionHandlers: {
		"SWF_DROPDOWN#OPENED_SET": ({ updateProperties, action, state }) => {
			const { payload: { value } } = action;
			updateProperties({ opened: value });
			if (action.payload.restoreFocus) {
				state.fitTarget.focus();
			}
		},
		"SWF_DROPDOWN_LIST#SELECTED_ITEMS_SET": ({ updateProperties, properties, action }) => {
			if (properties.select == 'single') {
				updateProperties({ opened: false, selectedItems: action.payload.value })
			} else {
				updateProperties({ selectedItems: action.payload.value })
			}
		}
	},
	dispatches: {
		/**
		 * Dispatched when the dropdown menu is opened or closed. Payload contains
		 * a boolean of `true` when the dropdown is opened or `false` when the dropdown is closed.
		 * Set the `manage-opened` property to override the default behavior and
		 * handle this action manually.
		 * @type {{value: boolean}}
		 */
		'SWF_DROPDOWN#OPENED_SET': {},

	},
	slots: {
		/**
		 * Content placed in this named slot appears inside of the trigger button of the dropdown,
		 * taking the place of the `icon`, `placeholder` and caret icon that normally appear there.
		 * Click behavior and other functionality is maintained for the custom content automatically.
		 */
		'trigger-content': {}
	},
	behaviors: [
		{
			behavior: focusBehavior
		},
		{
			behavior: keyBindingBehavior,
			options: {
				keyBindings: {
					open: ['ArrowDown', ' ', 'Enter'],
					dismiss: ['Escape']
				},
				handlers: {
					open: (host, event, dispatch) => {
						const focused = getFocusedEl(host);
						const trigger = getTriggerEl(host);
						if (!host.disabled && focused === trigger) {
							event.preventDefault();
							dispatch(() => {
								return {
									type: 'SWF_DROPDOWN#OPENED_SET',
									payload: { value: true }
								};
							});
						}
					},
					dismiss: (host, event, dispatch) => {
						const focused = getFocusedEl(host);
						const trigger = getTriggerEl(host);
						dispatch(() => {
							return {
								type: 'SWF_DROPDOWN#OPENED_SET',
								payload: { value: false }
							};
						});
						if (focused !== trigger) {
							trigger.focus();
						}
					}
				}
			}
		}
	]
});
