/**
 * Ambient types for the generated message catalogs.
 *
 * `messages/<locale>.po` is turned into a plain object by the loader from
 * `next-intl/plugin` — never import a catalog from application code.
 *
 * This file must stay free of top-level imports/exports, otherwise TypeScript
 * treats the `declare module` block below as an augmentation of an existing
 * module and rejects it.
 *
 * Note: with `messages.precompile` enabled, the runtime values are not the
 * original ICU strings but the minified ASTs produced by `icu-minify`. The
 * type below only needs to satisfy `AbstractIntlMessages`.
 */
declare module "*.po" {
  const messages: Record<string, string>;
  export default messages;
}
