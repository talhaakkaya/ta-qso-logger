// QRZ API response types

export interface QRZAdditionalFields {
  page_title?: string;
  callsign_display?: string;
  flag?: string;
  image?: string;
  last_modified?: string;
  qrz_record?: string;
  qrz_admin?: string;
  date_joined?: string;
  last_update?: string;
  geo_source?: string;
  "qrz_record#"?: string;
}

export interface QRZResponse {
  callsign: string;
  country?: string;
  name?: string;
  address?: string;
  grid_square?: string;
  latitude?: string;
  longitude?: string;
  qsl_info?: string | null;
  lookups?: string;
  status?: string;
  class?: string | null;
  effective?: string | null;
  expires?: string | null;
  trustee?: string | null;
  us_state?: string | null;
  us_county?: string | null;
  cq_zone?: string;
  itu_zone?: string | null;
  born?: string | null;
  gmt_offset?: string | null;
  sunrise?: string;
  sunset?: string;
  url?: string;
  additional_fields?: QRZAdditionalFields;
}

export interface QRZLookupResult {
  success: boolean;
  data?: QRZResponse;
  error?: string;
}
