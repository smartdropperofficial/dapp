const ItemCard: React.FC<{children: React.ReactNode}> = ({children}) => {
    return ( <div className="item-card">
        {children}
    </div> );
}
 
export default ItemCard;