export interface Root {
    product: ProductRainforest
}

export interface ProductRainforest {
    title: string
    search_alias: SearchAlias
    title_excluding_variant_name: string
    keywords: string
    keywords_list: string[]
    asin: string
    parent_asin: string
    link: string
    brand: string
    protection_plans: ProtectionPlan[]
    sell_on_amazon: boolean
    variants: Variant[]
    variant_asins_flat: string
    documents: Document[]
    categories: Category[]
    categories_flat: string
    description: string
    a_plus_content: APlusContent
    sub_title: SubTitle
    marketplace_id: string
    rating: number
    rating_breakdown: RatingBreakdown
    ratings_total: number
    main_image: MainImage
    images: Image2[]
    images_count: number
    images_flat: string
    videos: Video[]
    videos_count: number
    videos_flat: string
    is_bundle: boolean
    feature_bullets: string[]
    feature_bullets_count: number
    feature_bullets_flat: string
    important_information: ImportantInformation
    attributes: Attribute[]
    top_reviews: TopReview[]
    buybox_winner: BuyboxWinner
    specifications: Specification[]
    specifications_flat: string
    bestsellers_rank: BestsellersRank[]
    platform: string
    color: string
    manufacturer: string
    weight: string
    first_available: string
    dimensions: string
    model_number: string
    bestsellers_rank_flat: string
    whats_in_the_box: string[]
}

export interface SearchAlias {
    title: string
    value: string
}

export interface ProtectionPlan {
    asin: string
    title: string
    price: Price
}

export interface Price {
    symbol: string
    value: number
    currency: string
    raw: string
}

export interface Variant {
    asin: string
    title: string
    is_current_product: boolean
    link: string
    dimensions: Dimension[]
    main_image: string
    images: Image[]
}

export interface Dimension {
    name: string
    value: string
}

export interface Image {
    variant: string
    link: string
}

export interface Document {
    name: string
    link: string
}

export interface Category {
    name: string
    link?: string
    category_id?: string
}

export interface APlusContent {
    has_a_plus_content: boolean
    has_brand_story: boolean
    brand_story: BrandStory
    third_party: boolean
}

export interface BrandStory {
    hero_image: string
    brand_store: BrandStore
    images: string[]
    products: Product2[]
}

export interface BrandStore {
    link: string
    id: string
}

export interface Product2 {
    title: string
    asin: string
    link: string
    image: string
}

export interface SubTitle {
    text: string
    link: string
}

export interface RatingBreakdown {
    five_star: FiveStar
    four_star: FourStar
    three_star: ThreeStar
    two_star: TwoStar
    one_star: OneStar
}

export interface FiveStar {
    percentage: number
    count: number
}

export interface FourStar {
    percentage: number
    count: number
}

export interface ThreeStar {
    percentage: number
    count: number
}

export interface TwoStar {
    percentage: number
    count: number
}

export interface OneStar {
    percentage: number
    count: number
}

export interface MainImage {
    link: string
}

export interface Image2 {
    link: string
    variant: string
}

export interface Video {
    duration_seconds: number
    width: number
    height: number
    link: string
    thumbnail: string
    is_hero_video: boolean
    variant: string
    group_id: string
    group_type: string
    title: string
}

export interface ImportantInformation {
    sections: Section[]
}

export interface Section {
    body: string
}

export interface Attribute {
    name: string
    value: string
}

export interface TopReview {
    id: string
    title: string
    body: string
    asin?: string
    body_html: string
    link?: string
    rating: number
    date: Date
    profile: Profile
    vine_program: boolean
    verified_purchase: boolean
    helpful_votes?: number
    review_country: string
    is_global_review: boolean
}

export interface Date {
    raw: string
    utc: string
}

export interface Profile {
    name: string
    link?: string
    id?: string
    image?: string
}

export interface BuyboxWinner {
    maximum_order_quantity: MaximumOrderQuantity
    secondary_buybox: SecondaryBuybox
    offer_id: string
    mixed_offers_count: number
    mixed_offers_from: MixedOffersFrom
    is_prime: boolean
    is_prime_exclusive_deal: boolean
    is_amazon_fresh: boolean
    condition: Condition
    availability: Availability2
    fulfillment: Fulfillment
    price: Price2
    rrp: Rrp
    shipping: Shipping
}

export interface MaximumOrderQuantity {
    value: number
    hard_maximum: boolean
}

export interface SecondaryBuybox {
    offer_id: string
    caption: string
    availability: Availability
}

export interface Availability {
    raw: string
}

export interface MixedOffersFrom {
    raw: string
}

export interface Condition {
    is_new: boolean
}

export interface Availability2 {
    type: string
    raw: string
    dispatch_days: number
}

export interface Fulfillment {
    type: string
    standard_delivery: StandardDelivery
    fastest_delivery: FastestDelivery
    is_sold_by_amazon: boolean
    amazon_seller: AmazonSeller
    is_fulfilled_by_amazon: boolean
    is_fulfilled_by_third_party: boolean
    is_sold_by_third_party: boolean
}

export interface StandardDelivery {
    date: string
    name: string
}

export interface FastestDelivery {
    date: string
    name: string
}

export interface AmazonSeller {
    name: string
}

export interface Price2 {
    symbol: string
    value: number
    currency: string
    raw: string
}

export interface Rrp {
    symbol: string
    value: number
    currency: string
    raw: string
}

export interface Shipping {
    raw: string
}

export interface Specification {
    name: string
    value: string
}

export interface BestsellersRank {
    category: string
    rank: number
    link: string
}
