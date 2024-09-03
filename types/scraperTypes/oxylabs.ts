export interface Welcome7 {
    results: Result[];
    job: Job;
}

export interface Job {
    callback_url: string;
    client_id: number;
    context: Context[];
    created_at: Date;
    domain: string;
    geo_location: null;
    id: string;
    limit: number;
    locale: null;
    pages: number;
    parse: boolean;
    parser_type: null;
    parsing_instructions: null;
    browser_instructions: null;
    render: null;
    url: string;
    query: string;
    source: string;
    start_page: number;
    status: string;
    storage_type: null;
    storage_url: null;
    subdomain: string;
    content_encoding: string;
    updated_at: Date;
    user_agent_type: string;
    session_info: null;
    statuses: any[];
    client_notes: null;
    _links: Link[];
}

export interface Link {
    rel: string;
    href: string;
    method: string;
}

export interface Context {
    key: string;
    value: boolean | null;
}

export interface Result {
    content: Content;
    created_at: Date;
    updated_at: Date;
    page: number;
    url: string;
    job_id: string;
    status_code: number;
    parser_type: string;
}

export interface Content {
    ads: Ad[];
    url: string;
    asin: string;
    page: number;
    price: number;
    stock: string;
    title: string;
    coupon: string;
    images: string[];
    rating: number;
    category: Category[];
    currency: string;
    delivery: any[];
    _warnings: string[];
    deal_type: string;
    page_type: string;
    price_sns: number;
    variation: Variation[];
    has_videos: boolean;
    sales_rank: SalesRank[];
    top_review: string;
    asin_in_url: string;
    description: string;
    parent_asin: string;
    price_upper: number;
    pricing_str: string;
    pricing_url: string;
    discount_end: string;
    manufacturer: string;
    price_buybox: number;
    product_name: string;
    bullet_points: string;
    is_addon_item: boolean;
    price_initial: number;
    pricing_count: number;
    reviews_count: number;
    sns_discounts: any[];
    developer_info: any[];
    lightning_deal: null;
    price_shipping: number;
    is_prime_pantry: boolean;
    product_details: ProductDetails;
    featured_merchant: any[];
    is_prime_eligible: boolean;
    parse_status_code: number;
    product_dimensions: string;
    answered_questions_count: number;
    rating_stars_distribution: RatingStarsDistribution[];
}

export interface Ad {
    pos: number;
    asin: string;
    type: string;
    price: number;
    title: string;
    images: string[];
    rating: number;
    location: string;
    price_upper: number;
    reviews_count: number;
    is_prime_eligible: boolean;
}

export interface Category {
    ladder: Ladder[];
}

export interface Ladder {
    url: string;
    name: string;
}

export interface ProductDetails {
    asin: string;
    batteries: string;
    manufacturer: string;
    item_model_number: string;
    product_dimensions: string;
    date_first_available: string;
}

export interface RatingStarsDistribution {
    rating: number;
    percentage: number;
}

export interface SalesRank {
    rank: number;
    ladder: Ladder[];
}

export interface Variation {
    asin: string;
    selected: boolean;
    dimensions: Dimensions;
}

export interface Dimensions {
    "Size Name": string;
}
