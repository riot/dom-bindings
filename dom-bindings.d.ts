// Expressions

export enum ExpressionType {
  ATTRIBUTE,
  EVENT,
  TEXT,
  VALUE,
  REF,
}

export interface BaseExpressionData<Scope = any> {
  type: ExpressionType
  evaluate(scope: Scope): any
}

export interface AttributeExpressionData<Scope = any>
  extends BaseExpressionData<Scope> {
  name: string
}

export interface EventExpressionData<Scope = any>
  extends BaseExpressionData<Scope> {
  name: string
}

export interface TextExpressionData<Scope = any>
  extends BaseExpressionData<Scope> {
  childNodeIndex: number
}

export interface ValueExpressionData<Scope = any>
  extends BaseExpressionData<Scope> {}

export interface RefExpressionData<Scope = any>
  extends BaseExpressionData<Scope> {}

export type ExpressionData<Scope = any> =
  | AttributeExpressionData<Scope>
  | EventExpressionData<Scope>
  | TextExpressionData<Scope>
  | ValueExpressionData<Scope>
  | RefExpressionData<Scope>

export interface Expression<Scope = any> {
  type: ExpressionType
  node: HTMLElement
  value: any
  mount(scope: Scope): Expression<Scope>
  update(scope: Scope): Expression<Scope>
  unmount(scope: Scope): Expression<Scope>
}

// Bindings
export enum BindingType {
  EACH,
  IF,
  SIMPLE,
  TAG,
  SLOT,
}

export interface BaseBindingData<Scope = any> {
  selector?: string
  redundantAttribute?: string
  type?: BindingType
  evaluate?(scope: Scope): any
}

export interface EachBindingData<
  Scope = any,
  ItemName extends string = string,
  IndexName extends string = string,
  ItemValue extends any = any,
  ExtendedScope = Scope & { [Property in ItemName]: ItemValue } & {
    [Property in IndexName]: number
  },
> {
  itemName: ItemName
  indexName?: IndexName | null
  template: TemplateChunk<ExtendedScope>
  getKey?: ((scope: ExtendedScope) => any) | null
  condition?: ((scope: ExtendedScope) => any) | null
  evaluate(scope: Scope): ItemValue[]
  selector?: string
  redundantAttribute?: string
}

export interface IfBindingData<Scope = any> extends BaseBindingData<Scope> {
  template: TemplateChunk<Scope>
}

export interface SimpleBindingData<Scope = any> extends BaseBindingData<Scope> {
  expressions: ExpressionData<Scope>[]
}

export interface SlotBindingData<Scope = any> extends BaseBindingData<Scope> {
  template?: TemplateChunk<Scope>
  attributes: AttributeExpressionData<Scope>[]
  name: string
}

export interface TagSlotData<Scope = any> {
  id: string
  // the following null attributes might be set if the slot is inherited from the parent https://github.com/riot/riot/issues/3055
  html: string | null
  bindings: BindingData<Scope>[] | null
}

export interface TagBindingData<Scope = any> extends BaseBindingData<Scope> {
  getComponent(
    name: string,
  ): ({
    slots,
    attributes,
  }: {
    slots: TagSlotData<Scope>[]
    attributes: AttributeExpressionData<Scope>[]
  }) => Pick<TemplateChunk<Scope>, 'mount' | 'update' | 'unmount'>
  attributes: AttributeExpressionData<Scope>[]
  slots: TagSlotData[]
}

export type BindingData<Scope = any> =
  | EachBindingData<Scope>
  | IfBindingData<Scope>
  | SimpleBindingData<Scope>
  | SlotBindingData<Scope>
  | TagBindingData<Scope>

export interface Binding<Scope = any, ParentScope = any> {
  mount(
    el: HTMLElement,
    scope: Scope,
    parentScope?: ParentScope,
    meta?: TemplateChunkMeta,
  ): Binding<Scope, ParentScope>
  update(scope: Scope, parentScope?: ParentScope): Binding<Scope, ParentScope>
  unmount(
    scope: Scope,
    parentScope?: ParentScope,
    mustRemoveRoot?: boolean,
  ): Binding<Scope, ParentScope>
}

// Template Object

export interface TemplateChunkMeta {
  fragment: DocumentFragment
  children: HTMLCollection
  avoidDOMInjection: boolean
}

export interface TemplateChunk<Scope = any, ParentScope = any> {
  mount(
    el: HTMLElement,
    scope: Scope,
    parentScope?: ParentScope,
    meta?: TemplateChunkMeta,
  ): TemplateChunk
  update(scope: Scope, parentScope?: ParentScope): TemplateChunk
  unmount(
    scope: Scope,
    parentScope?: ParentScope,
    mustRemoveRoot?: boolean,
  ): TemplateChunk
  clone(): TemplateChunk
  createDOM(el: HTMLElement): TemplateChunk

  bindings?: Binding<Scope, ParentScope>[]
  bindingsData?: BindingData<Scope>[]
  html?: string | null
  isTemplateTag?: boolean
  fragment?: DocumentFragment
  children?: HTMLCollection
  dom?: HTMLElement
  el?: HTMLElement
}

// API
export function template<Scope = any, ParentScope = any>(
  template: string,
  bindings?: BindingData<Scope>[],
): TemplateChunk<Scope, ParentScope>
export function createBinding<Scope = any>(
  root: HTMLElement,
  binding: BindingData<Scope>,
  templateTagOffset?: number | null,
): Binding<Scope>
export function createExpression<Scope = any>(
  node: HTMLElement,
  expression: ExpressionData<Scope>,
): Expression<Scope>

export const bindingTypes: { [key in keyof typeof BindingType]: BindingType }
export const expressionTypes: {
  [key in keyof typeof ExpressionType]: ExpressionType
}
