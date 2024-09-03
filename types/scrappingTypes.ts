interface RootObject {
    request_info: Requestinfo;
    request_parameters: Requestparameters;
    request_metadata: RainForestRequestmetadata;
    product: RainforestProduct;
    brand_store: Brandstore;
    user_guide: string;
    newer_model: Newermodel;
    frequently_bought_together: Frequentlyboughttogether;
    compare_with_similar: Newermodel[];
    also_bought: Newermodel[];
}
export interface RainforestData {
    request_metadata: RainForestRequestmetadata;
    product: RainforestProduct;
}

interface Frequentlyboughttogether {
    total_price: Price;
    products: Product2[];
}

interface Product2 {
    asin: string;
    title: string;
    link: string;
    image: string;
    price: Price;
}

interface Newermodel {
    title: string;
    asin: string;
    link: string;
    image: string;
    rating: number;
    ratings_total: number;
    price: Price;
}

interface Brandstore {
    id: string;
    link: string;
}

export interface RainforestProduct {
    title: string;
    search_alias: Searchalias;
    keywords: string;
    keywords_list: string[];
    asin: string;
    brand: string;
    sell_on_amazon: boolean;
    energy_efficiency: Energyefficiency;
    documents: Document[];
    categories: Category[];
    categories_flat: string;
    a_plus_content: Apluscontent;
    sub_title: Subtitle;
    marketplace_id: string;
    rating: number;
    rating_breakdown: Ratingbreakdown;
    ratings_total: number;
    main_image: Mainimage;
    images: Image[];
    images_count: number;
    images_flat: string;
    videos: Video[];
    videos_count: number;
    videos_flat: string;
    videos_additional: Videosadditional[];
    is_bundle: boolean;
    feature_bullets: string[];
    feature_bullets_count: number;
    feature_bullets_flat: string;
    important_information: Importantinformation;
    attributes: Attribute[];
    top_reviews: Topreview[];
    buybox_winner: Buyboxwinner;
    more_buying_choices: Morebuyingchoice[];
    specifications: Attribute[];
    specifications_flat: string;
    bestsellers_rank: Bestsellersrank[];
    color: string;
    manufacturer: string;
    weight: string;
    first_available: string;
    dimensions: string;
    model_number: string;
    bestsellers_rank_flat: string;
    whats_in_the_box: string[];
}

interface Bestsellersrank {
    category: string;
    rank: number;
    link: string;
}

interface Morebuyingchoice {
    price: Price;
    seller_name: string;
    seller_link: string;
    position: number;
}

interface Buyboxwinner {
    is_prime: boolean;
    is_prime_exclusive_deal: boolean;
    is_amazon_fresh: boolean;
    condition: Condition;
    fulfillment: Fulfillment;
    price: Price;
}

interface Price {
    symbol: string;
    value: number;
    currency: string;
    raw: string;
}

interface Fulfillment {
    type: string;
    error_message: string;
    is_sold_by_amazon: boolean;
    is_fulfilled_by_amazon: boolean;
    is_fulfilled_by_third_party: boolean;
    is_sold_by_third_party: boolean;
    third_party_seller: Thirdpartyseller;
}

interface Thirdpartyseller {
    name: string;
    link: string;
    id: string;
}

interface Condition {
    is_new: boolean;
}

interface Topreview {
    id: string;
    title: string;
    body: string;
    asin?: string;
    body_html: string;
    link?: string;
    rating: number;
    date: Date;
    profile: Profile;
    vine_program: boolean;
    verified_purchase: boolean;
    review_country: string;
    is_global_review: boolean;
    helpful_votes?: number;
}

interface Profile {
    name: string;
    link?: string;
    id?: string;
    image?: string;
}

interface Date {
    raw: string;
    utc: string;
}

interface Attribute {
    name: string;
    value: string;
}

interface Importantinformation {
    sections: Section[];
}

interface Section {
    body: string;
}

interface Videosadditional {
    id: string;
    product_asin: string;
    parent_asin: string;
    related_products?: string;
    title: string;
    profile_image_url: string;
    profile_link: string;
    public_name: string;
    creator_type: string;
    vendor_code: string;
    vendor_name: string;
    vendor_tracking_id?: string;
    video_image_id: string;
    video_image_url: string;
    video_image_url_unchanged: string;
    video_image_width: string;
    video_image_height: string;
    video_image_extension: string;
    video_url: string;
    video_previews: string;
    video_mime_type: string;
    duration: string;
    closed_captions: string;
    type: string;
}

interface Video {
    duration_seconds: number;
    width: number;
    height: number;
    link: string;
    thumbnail: string;
    is_hero_video: boolean;
    variant: string;
    group_id: string;
    group_type: string;
    title: string;
}

interface Image {
    link: string;
    variant: string;
}

interface Mainimage {
    link: string;
}

interface Ratingbreakdown {
    five_star: Fivestar;
    four_star: Fivestar;
    three_star: Fivestar;
    two_star: Fivestar;
    one_star: Fivestar;
}

interface Fivestar {
    percentage: number;
    count: number;
}

interface Subtitle {
    text: string;
    link: string;
}

interface Apluscontent {
    has_a_plus_content: boolean;
    has_brand_story: boolean;
    third_party: boolean;
}

interface Category {
    name: string;
    link?: string;
    category_id?: string;
}

interface Document {
    name: string;
    link: string;
}

interface Energyefficiency {
}

interface Searchalias {
    title: string;
    value: string;
}

export interface RainForestRequestmetadata {
    created_at: string;
    processed_at: string;
    total_time_taken: number;
    amazon_url: string;
}

interface Requestparameters {
    amazon_domain: string;
    asin: string;
    type: string;
}

interface Requestinfo {
    success: boolean;
    credits_used: number;
    credits_remaining: number;
    credits_used_this_request: number;
}

