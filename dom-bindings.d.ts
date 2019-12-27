// Expressions

export enum ExpressionType {
  ATTRIBUTE,
  EVENT,
  TEXT,
  VALUE,
}

export interface BaseExpressionData {
  type: ExpressionType
  evaluate(scope: any): any
}

export interface AttributeExpressionData extends BaseExpressionData {
  name: string
}

export interface EventExpressionData extends BaseExpressionData {
  name: string
}

export interface TextExpressionData extends BaseExpressionData {
  childNodeIndex: number
}

export interface ValueExpressionData extends BaseExpressionData {}

export type ExpressionData = AttributeExpressionData | EventExpressionData | TextExpressionData | ValueExpressionData

export interface Expression<Scope = any> {
  type: ExpressionType
  node: HTMLElement
  value: any
  mount(scope: Scope): Expression
  update(scope: Scope): Expression
  unmount(scope: Scope): Expression
}

// Bindings
export enum BindingType {
  EACH,
  IF,
  SIMPLE,
  TAG,
  SLOT,
}

export interface BaseBindingData {
  selector?: string
  redundantAttribute?: string
  type?: BindingType
  evaluate?(scope: any): any
}

export interface EachBindingData extends BaseBindingData {
  itemName: string
  indexName?: number
  template: TemplateChunk
  getKey?: ((scope: any) => any) | null
  condition?: ((scope: any) => any) | null
}

export interface IfBindingData extends BaseBindingData {
  template: TemplateChunk
}

export interface SimpleBindingData extends BaseBindingData {
  expressions: ExpressionData[]
}

export interface SlotBindingData extends BaseBindingData {
  id: string
  html: string
  bindings: BindingData
}

export interface TagBindingData extends BaseBindingData {
  getComponent(name: string): TemplateChunk
  attributes: AttributeExpressionData[]
  slots: SlotBindingData[]
}

export type BindingData = IfBindingData | EachBindingData | SimpleBindingData | SlotBindingData | TagBindingData

export interface Binding<Scope = any, ParentScope = any> {
  mount(el: HTMLElement, scope: Scope, parentScope: ParentScope, meta: TemplateChunkMeta): Binding
  update(scope: Scope, parentScope: ParentScope): Binding
  unmount(scope: Scope, parentScope: ParentScope, mustRemoveRoot: boolean): Binding
}

// Template Object

export interface TemplateChunkMeta {
  fragment: DocumentFragment
  children: HTMLCollection
  avoidDOMInjection: boolean
}

export interface TemplateChunk<Scope = any, ParentScope = any> {
  mount(el: HTMLElement, scope: Scope, parentScope: ParentScope, meta: TemplateChunkMeta): TemplateChunk
  update(scope: Scope, parentScope: ParentScope): TemplateChunk
  unmount(scope: Scope, parentScope: ParentScope, mustRemoveRoot: boolean): TemplateChunk
  clone(): TemplateChunk
  createDOM(el: HTMLElement): TemplateChunk

  bindings?: Binding<Scope, ParentScope>[]
  bindingsData?: BindingData[]
  html?: string | null
  isTemplateTag?: boolean
  fragment?: DocumentFragment
  children?: HTMLCollection
  dom?: HTMLElement
  el?: HTMLElement
}

// API
export function template(template: string, bindings: BindingData[]): TemplateChunk
export function createBinding(root: HTMLElement, binding: BindingData, templateTagOffset?: number | null): Binding
export function createExpression(node: HTMLElement, expression: ExpressionData): Expression
export const bindingTypes:BindingType
export const expressionTypes:ExpressionType

