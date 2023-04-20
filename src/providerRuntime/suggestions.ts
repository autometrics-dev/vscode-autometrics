/**
 * A request for a provider to provide auto-suggestions.
 */
export type AutoSuggestRequest = {
  /**
   * The value of the field being typed by the user, up to the focus offset.
   */
  query: string;

  /**
   * The query type of the provider we're requesting suggestions for.
   */
  query_type: string;

  /**
   * The field in the query form we're requesting suggestions for.
   */
  field: string;

  /**
   * Some other fields of the cell data.
   * The choice of which other fields are sent in the request is
   * left to the caller.
   * The encoding of the other fields is left to the implementation
   * in Studio, and follows the format of
   * cells [Query Data](crate::ProviderCell::query_data).
   */
  other_field_data?: string;
};

/**
 * A suggestion for a provider's auto-suggest functionality.
 */
export type Suggestion = {
  /**
   * The offset to start applying the suggestion,
   *
   * All text should be replaced from that offset up to the end of the
   * query in AutoSuggestRequest.
   *
   * When missing, append the suggestion to the cursor
   */
  from?: number;
  text: string;
  description?: string;
};
