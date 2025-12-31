/**
 * Block Renderer
 *
 * Uses the default block registry from @webko-labs/ui.
 * To add custom blocks, extend the blockRegistry.
 */

import {
  BlockRenderer as BaseBlockRenderer,
  blockRegistry,
} from "@webko-labs/ui"
import type { GenericBlock, BlockComponentProps, FormHelpers } from "@webko-labs/ui"

// Re-export types for convenience
export type { GenericBlock, BlockComponentProps, FormHelpers }
export type SectionBlock = GenericBlock

interface BlockRendererProps extends FormHelpers {
  blocks: GenericBlock[]
  validationMessages?: Record<string, string>
  siteSettings?: Record<string, unknown> | null
  validateBlocks?: boolean
}

/**
 * Pre-configured BlockRenderer using default @webko-labs/ui blocks.
 *
 * To add custom blocks:
 * ```tsx
 * import { blockRegistry as defaultRegistry } from "@webko-labs/ui"
 *
 * const customRegistry = {
 *   ...defaultRegistry,
 *   "my-custom-block": { slug: "my-custom-block", component: MyCustomBlock, dataSource: { type: "inline" } },
 * }
 * ```
 */
export function BlockRenderer({
  blocks,
  validationMessages,
  siteSettings,
  validateBlocks,
  submitAction,
}: BlockRendererProps) {
  return (
    <BaseBlockRenderer
      blocks={blocks}
      validationMessages={validationMessages}
      siteSettings={siteSettings}
      validateBlocks={validateBlocks}
      blockRegistry={blockRegistry}
      submitAction={submitAction}
    />
  )
}
