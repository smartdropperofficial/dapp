import React, { useRef, useEffect, useState, useMemo, useContext } from 'react';
import Table from 'react-bootstrap/Table';
import { Button, Card, Col, Form } from 'react-bootstrap';
import { OrderSB } from '@/types/OrderSB';
import { encryptData, formatSPDate } from '@/utils/utils';
import { OrderStatus, OrderTableStatus } from '@/types/Order';
import { FaSortUp, FaSortDown, FaCommentAlt } from 'react-icons/fa';
import { useRouter } from 'next/router';
import Pagination from '@mui/material/Pagination';
import Stack from '@mui/material/Stack';
import Image from 'next/image';
import { OrderContext } from '@/store/order-context';


function OrderTable({ ordersProps }: { ordersProps: OrderSB[] }) {
    const { TableOrdersCurrentPage, setTableOrdersCurrentPage, OrderTablePagination, setOrderTablePagination, setOrderTableFilter, OrderTableFilter } = useContext(OrderContext);
    const inputRef = useRef<HTMLInputElement>(null);
    const router = useRouter();

    const [itemsPerPage, setItemsPerPage] = useState(5);
    const [orders, setOrders] = useState<OrderSB[]>([]);
    const [search, setSearch] = useState('');
    const [sort, setSort] = useState<'asc' | 'desc'>('desc');
    const [orderBy, setOrderBy] = useState<string>('created_at');
    const [currentPage, setCurrentPage] = useState(5);


    useEffect(() => {
        console.log('🚀 ~ OrderTable ~ ordersProps:', ordersProps);

        setOrders(ordersProps);
    }, [ordersProps]);

    useEffect(() => {
        setCurrentPage(TableOrdersCurrentPage);
        setItemsPerPage(OrderTablePagination);
        setOrderTableFilter(OrderTableFilter);
    }, [])

    useEffect(() => {
        setTableOrdersCurrentPage(currentPage);
    }, [currentPage])
    useEffect(() => {
        setOrderTablePagination(itemsPerPage);
    }, [itemsPerPage])
    useEffect(() => {
        setOrderTableFilter(OrderTableFilter);
    }, [OrderTableFilter])

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearch(e.target.value);
    };

    const handleSort = (e: React.MouseEvent<HTMLTableHeaderCellElement>) => {
        const key = e.currentTarget.getAttribute('data-key') as keyof OrderSB;
        if (key === orderBy) {
            setSort(sort === 'asc' ? 'desc' : 'asc');
        } else {
            setSort('asc');
            setOrderBy(key);
        }
    };

    const filteredOrders = useMemo(() => {
        return orders.filter(order => {
            const searchValue = search.toLowerCase();
            const matchesSearch = Object.values(order).some(value => {
                if (typeof value === 'string') {
                    return value.toLowerCase().includes(searchValue);
                }
                return false;
            });

            const matchesFilter = OrderTableFilter ? order.status === OrderTableFilter : true;

            return matchesSearch && matchesFilter;
        });
    }, [orders, search, OrderTableFilter]);
    const filterByStatus = (status: OrderStatus) => {
        return filteredOrders.filter(order => order.status === status);
    }
    const sortedOrders = useMemo(() => {
        return [...filteredOrders].sort((a, b) => {
            const aValue = a[orderBy as keyof OrderSB];
            const bValue = b[orderBy as keyof OrderSB];

            if (aValue && bValue) {
                if (aValue < bValue) return sort === 'asc' ? -1 : 1;
                if (aValue > bValue) return sort === 'asc' ? 1 : -1;
            }
            return 0;
        });
    }, [filteredOrders, orderBy, sort]);

    const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);

    const paginatedOrders = useMemo(() => {
        const start = (currentPage - 1) * itemsPerPage;
        const end = start + itemsPerPage;
        return sortedOrders.slice(start, end);
    }, [sortedOrders, currentPage, itemsPerPage]);

    useEffect(() => {
        if (inputRef.current) {
            inputRef.current.focus();
        }
    }, [search]);

    const handlePagination = (event: React.ChangeEvent<unknown>, page: number) => {
        setCurrentPage(page);
    };

    const handleItemsPerPageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setItemsPerPage(parseInt(e.target.value));
        setCurrentPage(1);
    };

    const handlerFilter = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setOrderTableFilter(e.target.value);

    }
    const RenderSearch = () => (
        <Form.Control
            ref={inputRef}
            type="text"
            value={search}
            onChange={handleSearch}
            required
            placeholder="Filter by Search"
            className="m-lg-2 my-4 col-lg-4"
        />
    );

    const RenderItemsPerPage = () => (
        <Form.Group as={Col} controlId="ItemsPerPage" className="my-2">
            <div className="d-flex col-lg-6 col-8 justify-content-lg-start justify-content-center align-items-center">
                <Form.Label className="d-flex col-lg-6 col-12 align-items-lg-start mb-0 text-start">Rows per page</Form.Label>
                <Form.Select
                    value={itemsPerPage}
                    onChange={handleItemsPerPageChange}
                    required
                    className="form-select border-3"
                    aria-label="Rows per page"
                    style={{ backgroundColor: '#ececec', width: 'fit-content' }}
                >
                    <option value={5}>5</option>
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                </Form.Select>
            </div>
        </Form.Group>
    );

    const RenderAction = (order: OrderSB) => {
        switch (order?.status) {
            case OrderTableStatus.WAITING_CONFIRMATION.value:
                return (
                    <Button className="btn-success col-10" onClick={() => GoToCheckout(order.order_id!)}>
                        {OrderTableStatus.WAITING_CONFIRMATION.description}
                    </Button>
                );

            case OrderTableStatus.WAITING_TAX.value:
                return (
                    <span className="col-10 col-xl-8 text-center my-1 p-2 rounded-2" style={{ backgroundColor: '#ffeeb1', color: '#a96500' }}>
                        <b>{OrderTableStatus.WAITING_TAX.description}</b>
                    </span>
                );

            case OrderTableStatus.ERROR.value:
                return (
                    <span className="col-10 col-xl-8 text-danger text-center my-1 p-2 rounded-2" style={{ backgroundColor: '#ffc7c7' }}>
                        <b>{OrderTableStatus.ERROR.description}</b>
                    </span>
                );

            case OrderTableStatus.ORDER_CONFIRMED.value:
                return (
                    <span className="col-10 col-xl-8 text-success text-center my-1 p-2 rounded-2" style={{ backgroundColor: '#d3ffcb' }}>
                        <b>{OrderTableStatus.ORDER_CONFIRMED.description}</b>
                    </span>
                );

            case OrderTableStatus.PRODUCT_UNAVAILABLE.value:
                return (
                    <span className="col-10 col-xl-8 text-success text-center my-1 p-2 rounded-2" style={{ backgroundColor: '#d3ffcb' }}>
                        <b>{OrderTableStatus.PRODUCT_UNAVAILABLE.description}</b>
                    </span>
                );

            case OrderTableStatus.SENT_TO_AMAZON.value:
                return (
                    <span className="col-10 col-xl-8 text-center my-1 p-2 rounded-2" style={{ backgroundColor: '#a2d1ff', color: '#0c41a5' }}>
                        <b>{OrderTableStatus.SENT_TO_AMAZON.description}</b>
                    </span>
                );
            case OrderTableStatus.SHIPPING_ADDRESS_REFUSED.value:
                return (
                    <span className="col-10 col-xl-8 text-danger text-center my-1 p-2 rounded-2" style={{ backgroundColor: '#ffc7c7' }}>

                        <b>{OrderTableStatus.SHIPPING_ADDRESS_REFUSED.description}</b>
                    </span>
                );
        }
    };

    const GotoOrderDetails = (orderId: string) => {
        const tmpEnc = encryptData(orderId);
        console.log('Order Details', orderId);
        router.push(`/order/${tmpEnc}/order-details`);
    };

    const GoToCheckout = (orderId: string) => {
        const tmpEnc = encryptData(orderId);
        console.log('Order Details', orderId);
        router.push(`/pay/${tmpEnc}/checkout`);
    };
    const RenderStatusFilter = () => (
        <div className="d-flex col-lg-6 col-6 justify-content-lg-end justify-content-center align-items-center">
            <Form.Group as={Col} controlId="status" className="my-2">
                <div className="d-flex col-lg-6 col-8 justify-content-lg-start justify-content-center align-items-center">
                    <Form.Label className="d-flex col-lg-6 col-12 align-items-lg-start mb-0 text-start">Filter by Status</Form.Label>
                    <Form.Select
                        value={OrderTableFilter}
                        onChange={handlerFilter}
                        required
                        className="form-select border-3"
                        aria-label="Filter by Status"
                        style={{ backgroundColor: '#ececec', width: 'fit-content' }}
                    >
                        <option value="">All</option>
                        {Object.values(OrderTableStatus).map((status) => (
                            <option key={status.value} value={status.value}>
                                {status.description}
                            </option>
                        ))}
                    </Form.Select>
                </div>

            </Form.Group>
        </div>
    );
    const RenderTable = () => (
        <Table responsive striped bordered>
            <thead>
                <tr>
                    <th data-key="retailer" onClick={handleSort} style={{ cursor: 'pointer' }}>
                        Retailer {orderBy === 'retailer' && (sort === 'asc' ? <FaSortUp /> : <FaSortDown />)}
                    </th>
                    <th data-key="order_id" onClick={handleSort} style={{ cursor: 'pointer' }}>
                        Order Id {orderBy === 'order_id' && (sort === 'asc' ? <FaSortUp /> : <FaSortDown />)}
                    </th>
                    <th data-key="created_at" onClick={handleSort} style={{ cursor: 'pointer' }}>
                        Created At {orderBy === 'created_at' && (sort === 'asc' ? <FaSortUp /> : <FaSortDown />)}
                    </th>
                    <th data-key="action" onClick={handleSort} style={{ cursor: 'pointer' }}>
                        Status {orderBy === 'action' && (sort === 'asc' ? <FaSortUp /> : <FaSortDown />)}
                    </th>
                    <th data-key="details" style={{ cursor: 'pointer' }}>
                        Order details {orderBy === 'details' && (sort === 'asc' ? <FaSortUp /> : <FaSortDown />)}
                    </th>
                    <th data-key="details" style={{ cursor: 'pointer' }}>
                        Request
                    </th>

                </tr>
            </thead>
            <tbody>
                {paginatedOrders.map((order, index) => (
                    <tr key={index}>
                        <td className="align-middle">
                            <Image src="/icons/amazon-avatar.png" height={40} width={40} alt="avatar" />
                        </td>
                        <td className="align-middle">{order.order_id}</td>
                        <td className="align-middle">{formatSPDate(order.created_at!)}</td>
                        <td className="align-middle">{RenderAction(order)}</td>
                        <td className="align-middle">
                            <Button onClick={() => GotoOrderDetails(order.order_id!)} style={{ backgroundColor: '#616161' }}>
                                Details
                            </Button>
                        </td>
                        <td className="align-middle cursor-auto " >
                            {order?.ticket_id &&
                                <Button style={{ backgroundColor: '#616161' }}>
                                    <FaCommentAlt />
                                </Button>
                            }
                        </td>
                        {/* <td className='align-middle'> <Button onClick={order?.ticket_id ? () => openTicketMessages(order?.order_id!) : () => openNewRequest(order?.order_id!)} style={{ backgroundColor: order?.ticket_id ? '#616161' : '#primary' }}
                        > {order?.ticket_id ? <>See Request</> : <>Open Request</>} </Button></td> */}
                    </tr>
                ))}
            </tbody>
        </Table>
    );

    const RenderPagination = () => (
        <div className="d-flex col-lg-6 col-6 justify-content-lg-end justify-content-center align-items-center">
            <Stack spacing={2} className="my-2">
                <Pagination
                    count={totalPages}
                    page={currentPage}
                    onChange={handlePagination}
                    variant="outlined"
                    shape="rounded"
                    siblingCount={1} // numero di pagine visualizzate accanto alla pagina corrente
                    boundaryCount={1} // numero di pagine visualizzate all'inizio e alla fine
                />
            </Stack>
        </div>
    );

    return (
        <div>
            <Card className="p-4 mb-4">
                <RenderSearch />
                <RenderStatusFilter />
            </Card>

            <Card>
                <RenderTable />
            </Card>
            <Card className="d-flex align-items-center my-2 px-5 py-1">
                <div className="d-flex col-12 align-items-center justify-content-center flex-lg-row flex-column">
                    <RenderItemsPerPage />
                    <RenderPagination />
                </div>
            </Card>
            {/* <OffCanvasResult setShow={setShowCanvas} show={showCanvas} orderId={orderIdTicket}></OffCanvasResult> */}
        </div>
    );
}

export default OrderTable;
