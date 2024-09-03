import { Checkbox, FormControl, InputLabel, MenuItem, Select, SelectChangeEvent } from "@mui/material";
import Image from "next/image";
import { ProductSB } from "../../types/OrderSB";
import ItemCard from "../UI/ItemCard";
import { Quantity } from "./ModalRefund";

const ProductForRefund: React.FC<{ product: ProductSB; selectProduct: (asin: string, check: boolean) => void; quantity: Quantity; selectQuantity: (asin: string, quantity: number) => void }> = ({ product, selectProduct, quantity, selectQuantity }) => {
  const length = 40;
  const title = product.title.length > length ? product.title.substring(0, length - 3) + "..." : product.title;

  const showQuantities = () => {
    const quantities = [];
    for (let i = 1; i <= product.quantity; i++) {
      quantities.push(
        <MenuItem key={i} value={i}>
          {i}
        </MenuItem>
      );
    }

    return quantities;
  };

  return (
    <div className="mb-3 d-flex align-items-center">
      <div className="">
        <Checkbox checked={quantity.checked} onChange={(e: React.ChangeEvent<HTMLInputElement>) => selectProduct(product.asin, e.target.checked)} />
      </div>
      <ItemCard key={product.asin}>
        <div className="row align-items-center justify-content-between">
          <div className="col-lg-2">
            <Image src={product.image} alt={product.title} width={70} height={70} />
          </div>
          <div className="col-lg-5 mt-4 mt-lg-0">
            <div className="item-info">
              <p>{title}</p>
            </div>
          </div>
          <div className="col-6 col-lg-2 mt-4 mt-lg-0">
            <p className="text-lg-end">
              {product.symbol} {product.price.toFixed(2)}
            </p>
          </div>
          <div className="col-6 col-lg-2 mt-4 mt-lg-0">
            <FormControl fullWidth disabled={!quantity.checked}>
              <InputLabel id="demo-simple-select-label">Q.ty</InputLabel>
              <Select labelId="demo-simple-select-label" id="demo-simple-select" value={quantity.quantity.toString()} label="Age" onChange={(e: SelectChangeEvent) => selectQuantity(product.asin, Number(e.target.value))}>
                {showQuantities()}
              </Select>
            </FormControl>
          </div>
        </div>
      </ItemCard>
    </div>
  );
};

export default ProductForRefund;
