export interface Product {
    id: string;
    title: string;
    price: string;
    category: string;
    image: string;
}

export type RootStackParamList = {
    Home: undefined;
    ProductDetail: { data: Product };
    Profile: undefined;
    EditProfile: undefined;
};
