import { SliderAction } from "./types";

export interface ResultItem {
  source: string;
  data: any; // Replace "any" with a more specific type that matches the structure of your API results.
}

export interface PriceAPIJobResult {
  job_id: string;
  status: string;
  free_credits: number;
  paid_credits: number;
  results: PriceAPIQueryResult[];
}

export interface PriceAPIQueryResult {
  query: PriceAPIQuery;
  success: boolean;
  metadata: PriceAPIMetadata;
  content: PriceAPIContent;
}

export interface PriceAPIQuery {
  source: string;
  country: string;
  topic: string;
  key: string;
  value: string;
  max_pages: number;
  max_age: number;
}

export interface PriceAPIMetadata {
  from_cache: boolean;
  page_count_delivered: number;
  page_count_from_cache: number;
  page_count_live: number;
  request_count: number;
  updated_at: string;
  tag: string;
}

export interface PriceAPIContent {
  search_results: PriceApiProduct[];
}

export interface PriceApiProduct {
  id: string;
  name: string;
  url: string;
  flags: string[];
  condition_text?: string; // This could be missing in some records
  price: string;
  shipping_costs?: string; // This could be missing or null in some records
  price_with_shipping?: string; // This could be missing or null in some records
  currency: string;
  shop_name: string;
  shop_url?: string | null; // This could be missing or explicitly null
  shop_id: string;
  shop_domain?: string | null; // This could be missing or explicitly null
  shop_matching_id: string;
  type: string;
  page: number;
  position: number;
  source: string;
}

export interface RecommendedProductResponse {
  id: string,
  message: string;
}

export interface SliderProps {
  label: string;
  min: number;
  max: number;
  value: number;
  step: number;
  name: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export interface SliderState {
  price: number;
  shipping: number;
  ratings: number;
}

export interface SliderContextType {
  preferences: SliderState;
  dispatch: React.Dispatch<SliderAction>;
}